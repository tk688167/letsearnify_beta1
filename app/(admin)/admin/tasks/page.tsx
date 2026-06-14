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

    // Parallel data fetching on the server
    const [tasks, companies, pendingCompletions] = await Promise.all([
        getAdminTasks(),
        getCompanies(),
        getPendingCompletions()
    ])

    return (
        <div className="p-3 sm:p-6 md:p-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Suspense boundary yahan hona zaroori hai kyunki child component 
              useSearchParams() use kar raha hai. Yeh Next.js build errors ko rokta hai.
            */}
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-7 h-7 border-[3px] border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
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