"use client"

import { useState, useTransition, useRef } from "react"
import { updateProfile } from "@/lib/actions"
import { User } from "@prisma/client"
import { 
  UserCircleIcon, 
  PhotoIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [preview, setPreview] = useState<string | null>(null)
  const [isRemoved, setIsRemoved] = useState(false)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsRemoved(false) // Reset removal state if new file selected
      if (file.size > 2 * 1024 * 1024) {
         setMessage({ type: "error", text: "File size exceeds 2MB limit." })
         return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
      setPreview(null)
      setIsRemoved(true)
      if (fileInputRef.current) {
          fileInputRef.current.value = ""
      }
  }

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
    <div className="bg-card rounded-3xl shadow-xl shadow-muted/20 border border-border overflow-hidden">
      <div className="px-6 py-6 md:px-12 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">Update your personal information and security settings.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
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
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-border">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-background bg-muted overflow-hidden flex items-center justify-center text-muted-foreground relative">
                 {!isRemoved && (preview || user?.image) ? (
                   <img src={preview || user?.image || ""} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserCircleIcon className="w-full h-full" />
                 )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors z-10"
              >
                <PhotoIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-foreground">Profile Picture</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Supports JPG, PNG or GIF. Max size 2MB.</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <input 
                type="hidden" 
                name="image" 
                value={isRemoved ? "REMOVE" : (preview || user?.image || "")} 
              />

              <div className="flex items-center gap-4 justify-center sm:justify-start">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 px-4 py-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    Upload New
                  </button>
                  
                  {/* Show Remove Button if an image exists (either saved or previewed) and not yet removed */}
                  {!isRemoved && (user?.image || preview) && (
                      <button 
                        type="button" 
                        onClick={handleRemovePhoto}
                        className="text-sm font-bold text-red-600 dark:text-red-400 px-4 py-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Remove
                      </button>
                  )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">User ID (Permanent)</label>
               <input 
                 disabled
                 readOnly
                 // @ts-ignore
                 value={formatUserId(user?.memberId)}
                 className="w-full px-4 py-3 bg-muted border border-border rounded-xl font-mono font-bold text-blue-600 dark:text-blue-400 cursor-not-allowed" 
               />
               <p className="text-[10px] text-muted-foreground">This ID identifies you across the platform and cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
              <input 
                name="name"
                defaultValue={user?.name || ""}
                type="text" 
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground" 
                placeholder="Ex. John Doe"
              />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number</label>
               <input 
                 name="phoneNumber"
                 // @ts-ignore
                 defaultValue={user?.phoneNumber || ""} 
                 type="tel" 
                 className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground" 
                 placeholder="+1 (555) 000-0000"
               />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
              <input 
                name="email"
                defaultValue={user?.email || ""}
                type="email" 
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground" 
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-border">
             <h3 className="text-lg font-bold text-foreground mb-6">Change Password</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Password</label>
                   <div className="relative">
                     <input 
                       name="currentPassword"
                       type={showCurrentPassword ? "text" : "password"}
                       className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground pr-10" 
                       placeholder="••••••••"
                     />
                     <button
                       type="button"
                       onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
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
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                   <div className="relative">
                     <input 
                       name="newPassword"
                       type={showNewPassword ? "text" : "password"}
                       className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground pr-10" 
                       placeholder="••••••••"
                     />
                     <button
                       type="button"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
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
               className="px-8 py-3 bg-card text-foreground font-bold rounded-xl border border-border hover:bg-muted/50 transition-all"
             >
               Cancel
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
