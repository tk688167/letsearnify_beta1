import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: string
      /** The user's ID. */
      id: string
      /** The user's numeric Member ID (e.g. 1001) */
      memberId: string
      /** Whether the user is an active member. */
      isActiveMember: boolean
    } & DefaultSession["user"]
  }

  interface User {
      role: UserRole
      memberId: string
      isActiveMember: boolean
  }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole
        memberId: string
        isActiveMember: boolean
    }
}
