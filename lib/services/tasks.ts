
import { prisma } from "@/lib/prisma"

export interface TaskDataResult {
    platformTasks: any[];
    user: any;
    isOffline: boolean;
}

export async function getTaskData(userId: string): Promise<TaskDataResult> {
    try {
        const [rawTasks, user] = await Promise.all([
             prisma.task.findMany({
                where: { status: "ACTIVE" },
                include: { 
                    company: true,
                    completions: {
                        where: { userId },
                        select: { status: true, remarks: true }
                    }
                },
                orderBy: { reward: 'desc' }
             }),
             prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, tier: true, arnBalance: true, name: true, email: true, isActiveMember: true, totalDeposit: true }
             })
        ]);

        const platformTasks = rawTasks.map(task => ({
            ...task,
            completionStatus: task.completions[0]?.status || null,
            completionRemarks: task.completions[0]?.remarks || null
        }));

        return { platformTasks, user, isOffline: false };

    } catch (error) {
        console.error("⚠️ Task Service Error [getTaskData]:", error);
        return { 
            platformTasks: [], 
            user: { id: userId, tier: "NEWBIE", arnBalance: 0 }, 
            isOffline: true 
        };
    }
}
