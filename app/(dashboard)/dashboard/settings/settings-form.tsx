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
  SwatchIcon
} from "@heroicons/react/24/solid"
import { useRouter } from "next/navigation"

interface SettingsFormProps {
  user: User | null
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [preview, setPreview] = useState<string | null>(null)
  const [isRemoved, setIsRemoved] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const passwordMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  
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

    // Validate password match on client side
    const np = formData.get("newPassword") as string
    const cp = formData.get("confirmNewPassword") as string
    if (np && np !== cp) {
      setMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    startTransition(async () => {
      try {
        await updateProfile(formData)
        setMessage({ type: "success", text: "Settings saved successfully!" })
        setNewPassword("")
        setConfirmPassword("")
        router.refresh()
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Something went wrong." })
      }
    })
  }

  return (
    <div className="bg-card rounded-[2rem] shadow-sm border border-border p-5 sm:p-8">
      {message && (
        <div className={"mb-6 p-4 rounded-xl flex items-center gap-3 border " + (
          message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
        )}>
          {message.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
          )}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-8 sm:space-y-12">
        {/* Section 1: Profile Photo Update */}
        <section>
          <h2 className="text-xl font-bold font-serif text-foreground mb-6">Profile Photo</h2>
          
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
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
              <input type="hidden" name="image" value={isRemoved ? "REMOVE" : (preview || user?.image || "")} />
              
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto text-sm font-bold text-primary px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 hover:border-primary/30 transition-all">
                    Change Photo
                  </button>
                  {!isRemoved && (user?.image || preview) && (
                      <button type="button" onClick={handleRemovePhoto}
                        className="w-full sm:w-auto text-sm font-bold text-red-600 dark:text-red-400 px-5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all flex items-center justify-center gap-2">
                        <TrashIcon className="w-4 h-4" />
                        Remove
                      </button>
                  )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-sm mx-auto sm:mx-0">Supports JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border/50" />

        {/* Section 2: Localization & Preferences */}
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
                          <option value="ur">Urdu</option>
                          <option value="hi">Hindi</option>
                          <option value="ar">العربية</option>
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
                          <option value="PKR">PKR (₨)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="AED">AED (د.إ)</option>
                          <option value="BDT">BDT (৳)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                  </div>
              </div>
          </div>
        </section>

        <div className="h-px w-full bg-border/50" />

        {/* Section 3: Change Password */}
        <section>
           <h2 className="text-xl font-bold font-serif text-foreground mb-2">Change Password</h2>
           <p className="text-sm text-muted-foreground mb-6">Leave blank if you don't want to change your password.</p>
           <div className="space-y-5 sm:space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Current Password</label>
                 <div className="relative">
                   <input name="currentPassword" type={showCurrentPassword ? "text" : "password"}
                     className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground pr-12 hover:border-primary/40 placeholder:text-muted-foreground/40" 
                     placeholder="Enter your current password" />
                   <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors">
                     {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                   </button>
                 </div>
              </div>

              {/* New Password */}
              <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">New Password</label>
                   <div className="relative">
                     <input name="newPassword" type={showNewPassword ? "text" : "password"}
                       value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)}
                       className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground pr-12 hover:border-primary/40 placeholder:text-muted-foreground/40" 
                       placeholder="Min. 8 characters" />
                     <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors">
                       {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                     </button>
                   </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Confirm New Password</label>
                   <div className="relative">
                     <input name="confirmNewPassword" type={showConfirmPassword ? "text" : "password"}
                       value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)}
                       className={"w-full px-4 py-3 sm:px-5 sm:py-4 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-foreground pr-12 hover:border-primary/40 placeholder:text-muted-foreground/40 " + (passwordMismatch ? "border-red-500" : passwordMatch ? "border-emerald-500" : "border-border")}
                       placeholder="Re-enter new password" />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors">
                       {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                     </button>
                   </div>
                   {passwordMismatch && <p className="text-xs text-red-500 font-medium pl-1">Passwords don't match</p>}
                   {passwordMatch && <p className="text-xs text-emerald-500 font-medium pl-1">Passwords match</p>}
                </div>
              </div>
           </div>
        </section>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-20 md:bottom-6 z-50 pt-2 md:pt-4 flex justify-end">
           <div className="flex flex-row items-center gap-3 bg-card/90 backdrop-blur-xl border border-border p-3 rounded-2xl shadow-xl shadow-black/10 w-full md:w-auto">
             <button type="button" onClick={() => router.back()}
               className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-sm bg-secondary text-foreground font-semibold rounded-xl border border-border hover:bg-muted transition-colors opacity-90 hover:opacity-100">
               Discard
             </button>
             <button type="submit" disabled={isPending || passwordMismatch}
               className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-md shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5">
               {isPending ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
               Save Settings
             </button>
           </div>
        </div>
      </form>
    </div>
  )
}
