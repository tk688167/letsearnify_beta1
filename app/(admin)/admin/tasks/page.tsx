import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAdminTasks } from "@/app/actions/admin/tasks"
import { getCompanies } from "@/app/actions/admin/companies"
import { getPendingCompletions } from "@/app/actions/admin/task-approvals"
import TaskAdminClient from "./components/TaskAdminClient"
import { Suspense } from "react"

export const dynamic = 'force-dynamic'

export default async function AdminTasksPage() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        redirect("/")
    }

    const [tasks, companies, pendingCompletions] = await Promise.all([
        getAdminTasks(),
        getCompanies(),
        getPendingCompletions()
    ])

    return (
        <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            }>
                <TaskAdminClient 
                    tasks={tasks} 
                    companies={companies} 
                    pendingCompletions={pendingCompletions} 
                />
            </Suspense>
        </div>
    )
}
