"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Get user tasks (active tasks only)
export async function getUserTasks() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        company: true,
        completions: {
          where: {
            userId: session.user.id
          },
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        reward: "desc" // Highest reward first
      }
    })

    return tasks.map(task => ({
      ...task,
      isCompleted: task.completions.length > 0,
      completionStatus: task.completions[0]?.status || null
    }))
  } catch (error) {
    console.error("Failed to fetch user tasks:", error)
    throw new Error("Failed to fetch tasks")
  }
}

// Complete a task and credit ARN tokens
export async function completeTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Check if task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        reward: true,
        status: true
      }
    })

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    if (task.status !== "ACTIVE") {
      return { success: false, error: "This task is no longer active" }
    }

    // Check if user already completed this task
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        userId: session.user.id,
        taskId: taskId
      }
    })

    if (existingCompletion) {
      return { success: false, error: "You have already completed this task" }
    }

    // Credit ARN tokens and create records in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Credit ARN to user balance
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          arnBalance: {
            increment: task.reward
          }
        }
      })

      // 2. Create task completion record
      await tx.taskCompletion.create({
        data: {
          userId: session.user.id,
          taskId: taskId,
          status: "APPROVED", // Auto-approve simple tasks
          pointsEarned: task.reward
        }
      })

      // 3. Create transaction record for audit trail
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: "TASK_REWARD",
          amount: task.reward,
          status: "COMPLETED",
          description: `Task completed: ${task.title}`
        }
      })
    })

    revalidatePath("/dashboard/tasks")
    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Congratulations! You earned ${task.reward.toFixed(0)} ARN tokens!`,
      arnEarned: task.reward
    }
  } catch (error) {
    console.error("Failed to complete task:", error)
    return { success: false, error: "Failed to complete task. Please try again." }
  }
}
