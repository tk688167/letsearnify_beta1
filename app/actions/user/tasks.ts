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
            status: true,
            remarks: true // Added info
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
      completionStatus: task.completions[0]?.status || null,
      completionRemarks: task.completions[0]?.remarks || null // Added info
    }))
  } catch (error) {
    console.error("Failed to fetch user tasks:", error)
    throw new Error("Failed to fetch tasks")
  }
}

// Submit a task for review (Proof required)
export async function completeTask(taskId: string, proof: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  if (!proof || proof.trim().length === 0) {
      return { success: false, error: "Proof is required to complete this task." }
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
        if (existingCompletion.status === "PENDING") {
             // Block if already pending
             return { success: false, error: "Task is already pending review." }
        } else if (existingCompletion.status === "APPROVED") {
             // Block if already approved
             return { success: false, error: "You have already completed this task" }
        }
        
        // If REJECTED, allow re-submission by updating the existing record
        // Status -> PENDING, Update Proof, Clear Remarks
        await prisma.taskCompletion.update({
            where: { id: existingCompletion.id },
            data: {
                status: "PENDING",
                proof: proof,
                remarks: null, // Clear previous rejection remarks
                createdAt: new Date() // Refresh timestamp to show as new
            }
        })
        
        revalidatePath("/dashboard/tasks")
        return {
            success: true,
            message: `Task re-submitted! use will review your proof again.`,
            pending: true
        }

    }

    // Create pending completion record
    await prisma.taskCompletion.create({
        data: {
          userId: session.user.id,
          taskId: taskId,
          status: "PENDING",
          proof: proof,
          pointsEarned: 0 // No points yet
        }
    })

    revalidatePath("/dashboard/tasks")

    return {
      success: true,
      message: `Task submitted! We will review your proof shortly.`,
      pending: true
    }
  } catch (error) {
    console.error("Failed to complete task:", error)
    return { success: false, error: "Failed to submit task. Please try again." }
  }
}
