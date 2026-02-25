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
  TrashIcon,
  GlobeAltIcon,
  SwatchIcon,
  IdentificationIcon,
  TrophyIcon
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
      setIsRemoved(false)
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
        setMessage({ type: "success", text: "Settings saved successfully!" })
        router.refresh()
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Something went wrong." })
      }
    })
  }

  return (
    <div className="bg-card rounded-[2rem] shadow-sm border border-border p-5 sm:p-8">
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
        }`}>
          {message.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
          )}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-8 sm:space-y-12">
        {/* Section 1: Profile Details */}
        <section>
          <h2 className="text-xl font-bold font-serif text-foreground mb-6">Personal Profile</h2>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background bg-secondary overflow-hidden flex items-center justify-center text-muted-foreground shadow-sm relative z-10 transition-transform group-hover:scale-105">
                 {!isRemoved && (preview || user?.image) ? (
                   <img src={preview || user?.image || ""} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserCircleIcon className="w-full h-full opacity-50" />
                 )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full text-white flex items-center justify-center shadow-lg hover:bg-primary/90 hover:scale-110 transition-all z-20 border-2 border-background"
              >
                <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="text-center sm:text-left flex-1 w-full">
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
              
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto text-sm font-bold text-primary px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 hover:border-primary/30 transition-all"
                  >
                    Change Photo
                  </button>
                  
                  {!isRemoved && (user?.image || preview) && (
                      <button 
                        type="button" 
                        onClick={handleRemovePhoto}
                        className="w-full sm:w-auto text-sm font-bold text-red-600 dark:text-red-400 px-5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Remove
                      </button>
                  )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto sm:mx-0">Supports JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 w-full">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Full Name</label>
              <input 
                name="name"
                defaultValue={user?.name || ""}
                type="text" 
                className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground hover:border-primary/40 placeholder:text-muted-foreground/50" 
                placeholder="Ex. John Doe"
              />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Phone Number</label>
               <input 
                 name="phoneNumber"
                 // @ts-ignore
                 defaultValue={user?.phoneNumber || ""} 
                 type="tel" 
                 className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground hover:border-primary/40 placeholder:text-muted-foreground/50" 
                 placeholder="+1 (555) 000-0000"
               />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Email Address</label>
              <input 
                name="email"
                defaultValue={user?.email || ""}
                type="email" 
                className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground hover:border-primary/40 placeholder:text-muted-foreground/50" 
                placeholder="hello@example.com"
              />
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border/50" />

        {/* Section 2: Platform Details (Read-only) */}
        <section>
          <h2 className="text-xl font-bold font-serif text-foreground mb-6">Platform Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
             {/* Read-Only Member ID */}
             <div className="bg-secondary/50 p-4 sm:p-5 rounded-xl border border-border space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                   <IdentificationIcon className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Permanent ID</span>
                </div>
                <div className="font-mono font-bold text-primary truncate">
                   {formatUserId(user?.memberId)}
                </div>
             </div>
             {/* Read-Only Tier */}
             <div className="bg-secondary/50 p-4 sm:p-5 rounded-xl border border-border space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                   <TrophyIcon className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Current Rank</span>
                </div>
                <div className="font-sans font-bold text-foreground">
                   {user?.tier} Member
                </div>
             </div>
             {/* Read-Only KYC Status */}
             <div className="bg-secondary/50 p-4 sm:p-5 rounded-xl border border-border space-y-1 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none ${user?.kycStatus === 'VERIFIED' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                   <CheckCircleIcon className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">KYC Status</span>
                </div>
                <div className={`font-sans font-bold ${user?.kycStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                   {user?.kycStatus === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                </div>
             </div>
          </div>
        </section>

        <div className="h-px w-full bg-border/50" />

        {/* Section 3: Localization & Preferences */}
        <section>
          <h2 className="text-xl font-bold font-serif text-foreground mb-6">Global Preferences</h2>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 pl-1">
                      <GlobeAltIcon className="w-4 h-4 text-primary" /> Language
                  </label>
                  <div className="relative">
                      <select name="language" defaultValue={user?.language || "en"} className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer">
                          <option value="en">English (United States)</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 pl-1">
                      <SwatchIcon className="w-4 h-4 text-primary" /> Currency
                  </label>
                  <div className="relative">
                      <select name="currency" defaultValue={user?.currency || "USD"} className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer">
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>
          </div>
        </section>

        <div className="h-px w-full bg-border/50" />

        {/* Section 4: Security */}
        <section>
           <h2 className="text-xl font-bold font-serif text-foreground mb-6">Change Password</h2>
           <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2 relative">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Current Password</label>
                 <div className="relative">
                   <input 
                     name="currentPassword"
                     type={showCurrentPassword ? "text" : "password"}
                     className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground pr-12 hover:border-primary/40 placeholder:text-muted-foreground/40" 
                     placeholder="••••••••"
                   />
                   <button
                     type="button"
                     onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors"
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
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">New Password</label>
                 <div className="relative">
                   <input 
                     name="newPassword"
                     type={showNewPassword ? "text" : "password"}
                     className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground pr-12 hover:border-primary/40 placeholder:text-muted-foreground/40" 
                     placeholder="••••••••"
                   />
                   <button
                     type="button"
                     onClick={() => setShowNewPassword(!showNewPassword)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors"
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
        </section>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-4 z-50 pt-2 sm:pt-4">
           <div className="flex flex-col sm:flex-row items-center gap-3 bg-card/80 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-xl shadow-black/5">
             <button 
               type="submit" 
               disabled={isPending}
               className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
             >
               {isPending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
               Save All Changes
             </button>
             <button 
               type="button" 
               onClick={() => router.back()}
               className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-secondary text-foreground font-bold rounded-xl border border-border hover:bg-muted transition-colors opacity-90 hover:opacity-100"
             >
               Discard
             </button>
           </div>
        </div>
      </form>
    </div>
  )
}
