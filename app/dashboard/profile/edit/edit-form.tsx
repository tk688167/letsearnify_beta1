"use client"

import { useState, useTransition } from "react"
import { updateProfile } from "@/lib/actions"
import { User } from "@prisma/client"
import { 
  UserCircleIcon, 
  PhotoIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/solid"
import { useRouter } from "next/navigation"
import { formatUserId } from "@/lib/utils"

interface EditFormProps {
  user: User | null
}

export default function EditForm({ user }: EditFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      try {
        await updateProfile(formData)
        setMessage({ type: "success", text: "Profile updated successfully!" })
        router.refresh()
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Something went wrong." })
      }
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      <div className="px-6 py-6 md:px-12 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-2">Update your personal information and security settings.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5" />
            )}
            <p className="font-medium text-sm">{message.text}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center text-gray-300">
                 {user?.image ? (
                   <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserCircleIcon className="w-full h-full" />
                 )}
              </div>
              <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
                <PhotoIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-gray-900">Profile Picture</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">Supports JPG, PNG or GIF. Max size 2MB.</p>
              <button type="button" className="text-sm font-bold text-blue-600 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                Upload New
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">User ID (Permanent)</label>
               <input 
                 disabled
                 readOnly
                 // @ts-ignore
                 value={formatUserId(user?.memberId)}
                 className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl font-mono font-bold text-blue-600 cursor-not-allowed" 
               />
               <p className="text-[10px] text-gray-400">This ID identifies you across the platform and cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
              <input 
                name="name"
                defaultValue={user?.name || ""}
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900" 
                placeholder="Ex. John Doe"
              />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
               <input 
                 name="phoneNumber"
                 // @ts-ignore
                 defaultValue={user?.phoneNumber || ""} 
                 type="tel" 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900" 
                 placeholder="+1 (555) 000-0000"
               />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
              <input 
                name="email"
                defaultValue={user?.email || ""}
                type="email" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900" 
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Password</label>
                   <div className="relative">
                     <input 
                       name="currentPassword"
                       type={showCurrentPassword ? "text" : "password"}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 pr-10" 
                       placeholder="••••••••"
                     />
                     <button
                       type="button"
                       onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                     >
                       {showCurrentPassword ? (
                         <EyeSlashIcon className="w-5 h-5" />
                       ) : (
                         <EyeIcon className="w-5 h-5" />
                       )}
                     </button>
                   </div>
                </div>
                <div className="space-y-2 relative">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Password</label>
                   <div className="relative">
                     <input 
                       name="newPassword"
                       type={showNewPassword ? "text" : "password"}
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 pr-10" 
                       placeholder="••••••••"
                     />
                     <button
                       type="button"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                     >
                       {showNewPassword ? (
                         <EyeSlashIcon className="w-5 h-5" />
                       ) : (
                         <EyeIcon className="w-5 h-5" />
                       )}
                     </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
             <button 
               type="submit" 
               disabled={isPending}
               className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
               {isPending && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
               Save Changes
             </button>
             <button 
               type="button" 
               onClick={() => router.back()}
               className="px-8 py-3 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
             >
               Cancel
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
