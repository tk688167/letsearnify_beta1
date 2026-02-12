import { auth } from "@/auth"
import { getPendingCompletions, approveTaskCompletion, rejectTaskCompletion } from "@/app/actions/admin/task-approvals"
import { redirect } from "next/navigation"
import ApprovalClient from "./components/ApprovalClient"

export const dynamic = 'force-dynamic'

export default async function TaskApprovalsPage() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        redirect("/")
    }

    const pendingCompletions = await getPendingCompletions()

     return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Pending Task Approvals</h1>
            <ApprovalClient completions={pendingCompletions} />
        </div>
    )
}
