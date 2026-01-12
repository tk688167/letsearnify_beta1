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
  type: z.enum(["SOCIAL", "APP", "SURVEY", "VIDEO", "OTHER"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
  imageUrl: z.string().optional()
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

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    reward: formData.get("reward"),
    type: formData.get("type"),
    status: formData.get("status"),
    link: formData.get("link"),
    imageUrl: formData.get("imageUrl")
  }

  const validated = TaskSchema.safeParse(rawData)

  if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
  }

  try {
      await prisma.task.create({
          data: {
              title: validated.data.title,
              description: validated.data.description,
              reward: validated.data.reward,
              type: validated.data.type as any,
              status: validated.data.status,
              link: validated.data.link || null,
              imageUrl: validated.data.imageUrl || null
          }
      })
      revalidatePath("/admin/tasks")
      revalidatePath("/dashboard/tasks")
      return { success: true, message: "Task created successfully" }
  } catch (err) {
      console.error(err)
      return { success: false, error: "Failed to create task" }
  }
}

export async function updateTask(id: string, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      reward: formData.get("reward") ? parseFloat(formData.get("reward") as string) : undefined,
      type: formData.get("type"),
      link: formData.get("link"),
      status: formData.get("status"),
      companyId: formData.get("companyId") // Capture update
    }

    const validated = updateTaskSchema.safeParse(rawData)
    if (!validated.success) return { success: false, error: validated.error.errors[0].message }

    const updateData: any = { ...validated.data }
    if (rawData.companyId !== undefined) {
         // handle explicit null or string
         updateData.companyId = rawData.companyId === "" ? null : rawData.companyId
    }

    try {
        await prisma.task.update({
            where: { id },
            data: updateData
        })
        revalidatePath("/admin/tasks")
        revalidatePath("/dashboard/tasks")
        return { success: true, message: "Task updated successfully" }
    } catch (err) {
        console.error(err)
        return { success: false, error: "Failed to update task" }
    }
}

export async function deleteTask(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

    try {
        await prisma.task.delete({ where: { id } })
        revalidatePath("/admin/tasks")
        revalidatePath("/dashboard/tasks")
        return { success: true }
    } catch (err) {
        console.error(err)
        return { success: false, error: "Failed to delete task" }
    }
}
