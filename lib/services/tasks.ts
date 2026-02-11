
import { prisma } from "@/lib/prisma"

export interface TaskDataResult {
    platformTasks: any[];
    user: any;
    isOffline: boolean;
}

export async function getTaskData(userId: string): Promise<TaskDataResult> {
    try {
        const [platformTasks, user] = await Promise.all([
             prisma.task.findMany({
                where: { status: "ACTIVE" },
                include: { company: true }
             }),
             prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, tier: true, arnBalance: true }
             })
        ]);

        return { platformTasks: platformTasks || [], user, isOffline: false };

    } catch (error) {
        console.error("⚠️ Task Service Error [getTaskData]:", error);
        return { 
            platformTasks: [], 
            user: { id: userId, tier: "NEWBIE", arnBalance: 0 }, 
            isOffline: true 
        };
    }
}
