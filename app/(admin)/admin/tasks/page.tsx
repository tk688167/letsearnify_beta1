"use client"


import { useState, useEffect } from "react"
import { createTask, deleteTask, updateTask, getAdminTasks } from "@/app/actions/admin/tasks"
import { createCompany, updateCompany, deleteCompany, getCompanies, toggleCompanyStatus } from "@/app/actions/admin/companies"
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, BuildingOfficeIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline"
import { useFormStatus } from "react-dom"

interface Company {
  id: string
  name: string
  logoUrl?: string | null
  status: string
  _count?: { tasks: number }
}

interface Task {
  id: string
  title: string
  description: string
  reward: number
  type: string
  status: string
  link?: string | null
  companyId?: string | null
  company?: Company | null
}

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'companies'>('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  const fetchData = async () => {
      const [tData, cData] = await Promise.all([
          getAdminTasks(), 
          getCompanies()
      ])
      setTasks(tData as unknown as Task[])
      setCompanies(cData as unknown as Company[])
  }

  useEffect(() => {
      fetchData()
  }, [])

  const handleTaskDelete = async (id: string) => {
      if(!confirm("Delete this task?")) return
      await deleteTask(id)
      fetchData()
  }

  const handleCompanyDelete = async (id: string) => {
      if(!confirm("Delete this company? Verify no active tasks are linked.")) return
      await deleteCompany(id)
      fetchData()
  }

  const handleCompanyToggle = async (id: string, status: string) => {
      await toggleCompanyStatus(id, status)
      fetchData()
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Platform Management</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Manage earning opportunities and partners.</p>
         </div>
        <div className="flex gap-2">
             <a
               href="/admin/tasks/approvals"
               className="px-4 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors text-sm"
             >
                <ClipboardDocumentListIcon className="w-4 h-4" />
                Approvals
             </a>
             <button
               onClick={() => activeTab === 'tasks' ? (setEditingTask(null), setIsTaskModalOpen(true)) : (setEditingCompany(null), setIsCompanyModalOpen(true))}
               className="px-4 py-2.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors text-sm"
             >
                <PlusIcon className="w-4 h-4" />
                {activeTab === 'tasks' ? 'New Task' : 'New Company'}
             </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
          <button
             onClick={() => setActiveTab('tasks')}
             className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
          >
             <ClipboardDocumentListIcon className="w-4 h-4" /> Tasks
          </button>
          <button
             onClick={() => setActiveTab('companies')}
             className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'companies' ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
          >
             <BuildingOfficeIcon className="w-4 h-4" /> Companies
          </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[300px]">
         {activeTab === 'tasks' ? (
             <TasksTable 
                tasks={tasks} 
                onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true) }} 
                onDelete={handleTaskDelete} 
             />
         ) : (
             <CompaniesTable 
                companies={companies} 
                onEdit={(c) => { setEditingCompany(c); setIsCompanyModalOpen(true) }} 
                onDelete={handleCompanyDelete}
                onToggle={handleCompanyToggle}
             />
         )}
      </div>

      {isTaskModalOpen && (
          <TaskModal 
             task={editingTask} 
             companies={companies}
             onClose={() => setIsTaskModalOpen(false)} 
             onSuccess={() => { setIsTaskModalOpen(false); fetchData() }}
          />
      )}

      {isCompanyModalOpen && (
          <CompanyModal 
             company={editingCompany}
             onClose={() => setIsCompanyModalOpen(false)}
             onSuccess={() => { setIsCompanyModalOpen(false); fetchData() }}
          />
      )}
    </div>
  )
}

function TasksTable({ tasks, onEdit, onDelete }: { tasks: Task[], onEdit: (t: Task) => void, onDelete: (id: string) => void }) {
    if (tasks.length === 0) return <div className="p-12 text-center text-gray-500 dark:text-slate-500">No tasks found.</div>

    return (
        <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
                {tasks.map((task) => (
                    <div key={task.id} className="p-4 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{task.title}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{task.company?.name || "Let's Earnify"}</div>
                            </div>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${task.status === "ACTIVE" ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"}`}>
                                {task.status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-green-600 dark:text-green-400">{task.reward.toFixed(0)} ARN</span>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400"><PencilIcon className="w-3.5 h-3.5"/></button>
                                <button onClick={() => onDelete(task.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 dark:text-red-400"><TrashIcon className="w-3.5 h-3.5"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                       <tr>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Title</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Company</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Reward</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Status</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                       {tasks.map((task) => (
                           <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                              <td className="px-5 py-3.5 font-medium text-sm text-gray-900 dark:text-white">{task.title}</td>
                              <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-slate-400">{task.company?.name || "Let's Earnify"}</td>
                              <td className="px-5 py-3.5 font-mono text-green-600 dark:text-green-400 font-bold text-sm">{task.reward.toFixed(0)} ARN</td>
                              <td className="px-5 py-3.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${task.status === "ACTIVE" ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"}`}>
                                     {task.status}
                                  </span>
                              </td>
                              <td className="px-5 py-3.5 text-right flex justify-end gap-1.5">
                                  <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400"><PencilIcon className="w-3.5 h-3.5"/></button>
                                  <button onClick={() => onDelete(task.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 dark:text-red-400"><TrashIcon className="w-3.5 h-3.5"/></button>
                              </td>
                           </tr>
                       ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function CompaniesTable({ companies, onEdit, onDelete, onToggle }: { companies: Company[], onEdit: (c: Company) => void, onDelete: (id: string) => void, onToggle: (id: string, s: string) => void }) {
    if (companies.length === 0) return <div className="p-12 text-center text-gray-500 dark:text-slate-500">No companies found.</div>

    return (
        <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
                {companies.map((company) => (
                    <div key={company.id} className="p-4 space-y-2">
                        <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {company.logoUrl && <img src={company.logoUrl} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />}
                                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{company.name}</div>
                            </div>
                            <button
                                onClick={() => onToggle(company.id, company.status)}
                                className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${company.status === "ACTIVE" ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500"}`}
                            >
                                {company.status}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-slate-400">{company._count?.tasks || 0} tasks</span>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(company)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400"><PencilIcon className="w-3.5 h-3.5"/></button>
                                <button onClick={() => onDelete(company.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 dark:text-red-400"><TrashIcon className="w-3.5 h-3.5"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                       <tr>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Name</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Active Tasks</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Status</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                       {companies.map((company) => (
                           <tr key={company.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                              <td className="px-5 py-3.5 font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                  {company.logoUrl && <img src={company.logoUrl} className="w-5 h-5 rounded-full object-cover" alt="" />}
                                  {company.name}
                              </td>
                              <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-slate-400">{company._count?.tasks || 0}</td>
                              <td className="px-5 py-3.5">
                                  <button
                                    onClick={() => onToggle(company.id, company.status)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${company.status === "ACTIVE" ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 hover:bg-green-100 dark:hover:bg-green-500/10 hover:text-green-700 dark:hover:text-green-400"}`}
                                  >
                                     {company.status}
                                  </button>
                              </td>
                              <td className="px-5 py-3.5 text-right flex justify-end gap-1.5">
                                  <button onClick={() => onEdit(company)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400"><PencilIcon className="w-3.5 h-3.5"/></button>
                                  <button onClick={() => onDelete(company.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 dark:text-red-400"><TrashIcon className="w-3.5 h-3.5"/></button>
                              </td>
                           </tr>
                       ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function TaskModal({ task, companies, onClose, onSuccess }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{task ? "Edit Task" : "New Task"}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"/></button>
                </div>
                <form action={async (formData) => {
                    if (task) await updateTask(task.id, formData)
                    else await createTask(formData)
                    onSuccess()
                }} className="p-5 space-y-4">

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Title</label>
                        <input name="title" defaultValue={task?.title} required className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm" placeholder="Task Title"/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Company</label>
                            <select name="companyId" defaultValue={task?.companyId || ""} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm">
                                <option value="">Let's Earnify (Default)</option>
                                {companies.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Reward (ARN)</label>
                            <input name="reward" type="number" step="1" defaultValue={task?.reward} required className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm"/>
                         </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Description</label>
                        <textarea name="description" defaultValue={task?.description} required rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm"/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Type</label>
                            <select name="type" defaultValue={task?.type || "SOCIAL"} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm">
                                <option value="SOCIAL">Social</option>
                                <option value="APP">App</option>
                                <option value="SURVEY">Survey</option>
                                <option value="VIDEO">Video</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Status</label>
                            <select name="status" defaultValue={task?.status || "ACTIVE"} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                         </div>
                    </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Link</label>
                        <input name="link" type="url" defaultValue={task?.link} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm" placeholder="https://..."/>
                    </div>

                    <SubmitButton label={task ? "Update Task" : "Create Task"} />
                </form>
            </div>
        </div>
    )
}

function CompanyModal({ company, onClose, onSuccess }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{company ? "Edit Company" : "New Company"}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"/></button>
                </div>
                <form action={async (formData) => {
                    if (company) await updateCompany(company.id, formData)
                    else await createCompany(formData)
                    onSuccess()
                }} className="p-5 space-y-4">

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Company Name</label>
                        <input name="name" defaultValue={company?.name} required className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm" placeholder="e.g. Acme Corp"/>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Logo URL (Optional)</label>
                        <input name="logoUrl" defaultValue={company?.logoUrl} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 text-sm" placeholder="https://..."/>
                    </div>

                    <SubmitButton label={company ? "Update Company" : "Add Company"} />
                </form>
            </div>
        </div>
    )
}


function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus()
    return (
        <button disabled={pending} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 mt-1 text-sm">
            {pending ? "Saving..." : label}
        </button>
    )
}
