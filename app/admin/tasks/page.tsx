"use client"

import { useState, useEffect } from "react"
import { createTask, deleteTask, updateTask, getAdminTasks } from "@/app/actions/admin/tasks"
import { createCompany, updateCompany, deleteCompany, getCompanies, toggleCompanyStatus } from "@/app/actions/admin/companies"
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, BuildingOfficeIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline"
import { useFormStatus } from "react-dom"

export const dynamic = 'force-dynamic'

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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Platform Management</h1>
            <p className="text-gray-500">Manage earning opportunities and partners.</p>
         </div>
         <div className="flex gap-2">
             <button 
               onClick={() => activeTab === 'tasks' ? (setEditingTask(null), setIsTaskModalOpen(true)) : (setEditingCompany(null), setIsCompanyModalOpen(true))}
               className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg"
             >
                <PlusIcon className="w-5 h-5" /> 
                {activeTab === 'tasks' ? 'New Task' : 'New Company'}
             </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
          <button 
             onClick={() => setActiveTab('tasks')}
             className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
             <ClipboardDocumentListIcon className="w-5 h-5" /> Tasks
          </button>
          <button 
             onClick={() => setActiveTab('companies')}
             className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'companies' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
             <BuildingOfficeIcon className="w-5 h-5" /> Companies
          </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
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
    if (tasks.length === 0) return <div className="p-12 text-center text-gray-500">No tasks found.</div>

    return (
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Company</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Reward</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {tasks.map((task) => (
                   <tr key={task.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium">{task.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{task.company?.name || "Let's Earnify"}</td>
                      <td className="px-6 py-4 font-mono text-green-600 font-bold">${task.reward.toFixed(2)}</td>
                      <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${task.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                             {task.status}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => onEdit(task)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><PencilIcon className="w-4 h-4"/></button>
                          <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><TrashIcon className="w-4 h-4"/></button>
                      </td>
                   </tr>
               ))}
            </tbody>
        </table>
    )
}

function CompaniesTable({ companies, onEdit, onDelete, onToggle }: { companies: Company[], onEdit: (c: Company) => void, onDelete: (id: string) => void, onToggle: (id: string, s: string) => void }) {
    if (companies.length === 0) return <div className="p-12 text-center text-gray-500">No companies found.</div>

    return (
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Active Tasks</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {companies.map((company) => (
                   <tr key={company.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                          {company.logoUrl && <img src={company.logoUrl} className="w-6 h-6 rounded-full object-cover" alt="" />}
                          {company.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company._count?.tasks || 0}</td>
                      <td className="px-6 py-4">
                          <button 
                            onClick={() => onToggle(company.id, company.status)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${company.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700" : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"}`}
                          >
                             {company.status}
                          </button>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => onEdit(company)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><PencilIcon className="w-4 h-4"/></button>
                          <button onClick={() => onDelete(company.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><TrashIcon className="w-4 h-4"/></button>
                      </td>
                   </tr>
               ))}
            </tbody>
        </table>
    )
}

function TaskModal({ task, companies, onClose, onSuccess }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">{task ? "Edit Task" : "New Task"}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form action={async (formData) => {
                    if (task) await updateTask(task.id, formData)
                    else await createTask(formData)
                    onSuccess()
                }} className="p-6 space-y-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                        <input name="title" defaultValue={task?.title} required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" placeholder="Task Title"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
                            <select name="companyId" defaultValue={task?.companyId || ""} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500">
                                <option value="">Let's Earnify (Default)</option>
                                {companies.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reward ($)</label>
                            <input name="reward" type="number" step="0.01" defaultValue={task?.reward} required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500"/>
                         </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea name="description" defaultValue={task?.description} required rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                            <select name="type" defaultValue={task?.type || "SOCIAL"} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500">
                                <option value="SOCIAL">Social</option>
                                <option value="APP">App</option>
                                <option value="SURVEY">Survey</option>
                                <option value="VIDEO">Video</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                            <select name="status" defaultValue={task?.status || "ACTIVE"} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                         </div>
                    </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link</label>
                        <input name="link" type="url" defaultValue={task?.link} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" placeholder="https://..."/>
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
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">{company ? "Edit Company" : "New Company"}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form action={async (formData) => {
                    if (company) await updateCompany(company.id, formData)
                    else await createCompany(formData)
                    onSuccess()
                }} className="p-6 space-y-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                        <input name="name" defaultValue={company?.name} required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" placeholder="e.g. Acme Corp"/>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo URL (Optional)</label>
                        <input name="logoUrl" defaultValue={company?.logoUrl} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-indigo-500" placeholder="https://..."/>
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
        <button disabled={pending} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 mt-2">
            {pending ? "Saving..." : label}
        </button>
    )
}
