
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

        if (!user) {
            if (userId === "super-admin-id") {
                return {
                    platformTasks: rawTasks.map(task => ({
                        ...task,
                        completionStatus: task.completions[0]?.status || null,
                        completionRemarks: task.completions[0]?.remarks || null
                    })),
                    user: {
                        id: userId,
                        name: "Super Admin",
                        email: "admin@letsearnify.com",
                        tier: "EMERALD",
                        arnBalance: 1000,
                        isActiveMember: true,
                        totalDeposit: 5000.0,
                    },
                    isOffline: false
                };
            }
            return { platformTasks: [], user: null, isOffline: false };
        }

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
