import { prisma } from "@/lib/prisma";

export interface AdminUserListResult {
  users: AdminUser[];
  total: number;
  isOffline: boolean;
  offlineReason?: string;
}

export type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  balance: number;
  tier: string;
  arnBalance: number;
  activeMembers: number;
  memberId: string;
  isActiveMember: boolean;
  qualifiedArn: number;
  totalSignups: number;
};

function mapAdminUserFetchError(error: unknown): string {
  const rawMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = rawMessage.toLowerCase();

  if (message.includes("data transfer quota")) {
    return "Database quota limit reached on Neon. Upgrade/reset quota to restore live data.";
  }

  if (message.includes("database_url is not defined")) {
    return "Database URL is missing. Configure DATABASE_URL in environment variables.";
  }

  return "Database connection is currently unavailable.";
}

export async function getAdminUsers(limit = 100): Promise<AdminUserListResult> {
  try {
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          balance: true,
          tier: true,
          arnBalance: true,
          activeMembers: true,
          memberId: true,
          isActiveMember: true,
        },
      }),
      prisma.user.count(),
    ]);

    const usersWithProgress = users.map((u) => ({
      ...u,
      qualifiedArn: u.arnBalance || 0,
      totalSignups: u.activeMembers || 0,
    }));

    return { users: usersWithProgress, total, isOffline: false };
  } catch (error) {
    console.error("Service Error [getAdminUsers]:", error);
    const offlineReason = mapAdminUserFetchError(error);
    return {
      users: [],
      total: 0,
      isOffline: true,
      offlineReason,
    };
  }
}
