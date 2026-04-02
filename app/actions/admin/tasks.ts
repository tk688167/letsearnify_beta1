"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for Task Validation
const TaskSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(10, "Description too short"),
  reward: z.coerce.number().positive("Reward must be positive"),
  type: z.enum(["BASIC", "PREMIUM", "SOCIAL", "APP", "SURVEY", "VIDEO", "OTHER"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  companyId: z.string().optional().nullable()
})

const updateTaskSchema = TaskSchema.partial()

export async function getAdminTasks() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return []

  return await prisma.task.findMany({
    orderBy: { createdAt: "desc" }
  })
}

export async function createTask(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
  }

  // Helper to convert null/empty from formData to Zod-friendly types
  const getVal = (key: string) => {
    const val = formData.get(key)
    return val === null ? undefined : val
  }

  const rawData = {
    title: getVal("title"),
    description: getVal("description"),
    reward: getVal("reward"),
    type: getVal("type"),
    status: getVal("status"),
    link: getVal("link") || "", // Default to empty string for url check if null
    imageUrl: getVal("imageUrl"),
    companyId: getVal("companyId")
  }

  const validated = TaskSchema.safeParse(rawData)

  if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
  }

  try {
      const task = await prisma.task.create({
          data: {
              title: validated.data.title,
              description: validated.data.description,
              reward: validated.data.reward,
              type: validated.data.type as any,
              status: validated.data.status,
              link: validated.data.link || null,
              imageUrl: validated.data.imageUrl || null,
              companyId: validated.data.companyId || null
          }
      })
      revalidatePath("/admin/tasks")
      revalidatePath("/dashboard/tasks")
      return { success: true, message: "Task created successfully", data: task }
  } catch (err) {
      console.error(err)
      return { success: false, error: "Failed to create task" }
  }
}

export async function updateTask(id: string, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const getVal = (key: string) => {
        const val = formData.get(key)
        return val === null ? undefined : val
    }

    const rawData = {
      title: getVal("title"),
      description: getVal("description"),
      reward: getVal("reward") ? parseFloat(getVal("reward") as string) : undefined,
      type: getVal("type"),
      link: getVal("link") || "",
      status: getVal("status"),
      companyId: getVal("companyId")
    }

    const validated = updateTaskSchema.safeParse(rawData)
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const updateData: any = { ...validated.data }
    if (rawData.companyId !== undefined) {
         // handle explicit null or string
         updateData.companyId = rawData.companyId === "" ? null : rawData.companyId
    }

    try {
        const task = await prisma.task.update({
            where: { id },
            data: updateData
        })
        revalidatePath("/admin/tasks")
        revalidatePath("/dashboard/tasks")
        return { success: true, message: "Task updated successfully", data: task }
    } catch (err) {
        console.error(err)
        return { success: false, error: "Failed to update task" }
    }
}

export async function toggleTaskStatus(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    try {
        const task = await prisma.task.findUnique({
            where: { id },
            select: { status: true }
        })

        if (!task) {
            return { success: false, error: "Task not found" }
        }

        const newStatus = task.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

        await prisma.task.update({
            where: { id },
            data: { status: newStatus }
        })

        revalidatePath("/admin/tasks")
        revalidatePath("/dashboard/tasks")
        return { success: true, message: `Task ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`, newStatus }
    } catch (err) {
        console.error(err)
        return { success: false, error: "Failed to toggle task status" }
    }
}

export async function deleteTask(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    try {
        await prisma.$transaction([
            // Cascading delete: Remove completions first to avoid foreign key constraints
            prisma.taskCompletion.deleteMany({
                where: { taskId: id }
            }),
            // Now remove the task itself
            prisma.task.delete({
                where: { id }
            })
        ])

        revalidatePath("/admin/tasks")
        revalidatePath("/dashboard/tasks")
        return { success: true }
    } catch (err) {
        console.error(err)
        return { success: false, error: "Failed to delete task" }
    }
}
