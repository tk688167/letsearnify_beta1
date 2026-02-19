"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, PaymentMethod } from "@prisma/client"
import { updateProfile, addPaymentMethod } from "@/lib/actions"
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  CheckBadgeIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SwatchIcon
} from "@heroicons/react/24/outline"
import EditForm from "../profile/edit/edit-form"
import { cn } from "@/lib/utils"

// Type extension
type UserWithMethods = User & { paymentMethods: PaymentMethod[] }

export default function SettingsTabs({ user }: { user: UserWithMethods }) {
  const [activeTab, setActiveTab] = useState("general")
  const [isAddingPayment, setIsAddingPayment] = useState(false)

  const menuItems = [
    { id: "general", label: "My Profile", icon: UserCircleIcon, desc: "Personal details & bio" },
    { id: "security", label: "Security & Login", icon: ShieldCheckIcon, desc: "Password, 2FA, Recovery" },
    { id: "payments", label: "Payment Methods", icon: CreditCardIcon, desc: "Linked cards & banks" },
    { id: "verification", label: "Identity (KYC)", icon: DocumentTextIcon, desc: "Verification status" },
    { id: "preferences", label: "Global Preferences", icon: Cog6ToothIcon, desc: "Language & Notifications" },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        
        {/* User Mini Card */}
        <div className="bg-card rounded-[2rem] border border-border p-6 shadow-xl shadow-muted/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-50"></div>
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-card shadow-sm p-1">
                    {user.image ? (
                        <img src={user.image} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center">
                            <UserCircleIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-foreground font-serif leading-tight">{user.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded-md">
                        {user.tier} Member
                    </div>
                </div>
            </div>
        </div>

        {/* Navigation Menu */}
        <nav className="bg-card rounded-[2rem] border border-border shadow-xl shadow-muted/20 overflow-hidden">
            <div className="p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden",
                                isActive 
                                    ? "bg-foreground text-background shadow-lg shadow-foreground/20" 
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground group-hover:bg-background group-hover:shadow-sm"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="relative z-10">
                                <span className={cn("block font-bold text-sm", isActive ? "text-background" : "text-foreground")}>
                                    {item.label}
                                </span>
                                <span className={cn("block text-[10px]", isActive ? "text-background/80" : "text-muted-foreground")}>
                                    {item.desc}
                                </span>
                            </div>
                            {isActive && (
                                <motion.div layoutId="active-indicator" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>

        {/* Security Summary Widget */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <h4 className="font-bold text-sm uppercase tracking-widest text-indigo-200 mb-4">Account Health</h4>
             <div className="flex items-end gap-2 mb-2">
                 <span className="text-4xl font-bold font-serif">{user.kycStatus === 'VERIFIED' ? '98%' : '65%'}</span>
             </div>
             <div className="w-full bg-white/10 rounded-full h-1.5 mb-4 overflow-hidden">
                 <div className={cn("h-full rounded-full", user.kycStatus === 'VERIFIED' ? "bg-emerald-400 w-[98%]" : "bg-amber-400 w-[65%]")}></div>
             </div>
             <p className="text-xs text-indigo-200/70 leading-relaxed">
                 {user.kycStatus === 'VERIFIED' ? "Your account is secure and verified." : "Complete KYC to reach 100% health."}
             </p>
        </div>

      </div>

      {/* 2. RIGHT CONTENT AREA */}
      <div className="flex-1 min-w-0">
         <div className="bg-card rounded-[2.5rem] border border-border shadow-xl shadow-muted/20 p-8 md:p-12 min-h-[800px] relative">
            
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-muted to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
            
            <AnimatePresence mode="wait">
                {activeTab === "general" && (
                    <motion.div 
                        key="general"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 max-w-2xl"
                    >
                        <header className="mb-10 border-b border-border pb-6">
                            <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Profile Settings</h2>
                            <p className="text-muted-foreground">Manage your personal information and public profile.</p>
                        </header>
                        <EditForm user={user} />
                    </motion.div>
                )}

                {activeTab === "security" && (
                    <motion.div 
                        key="security"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 max-w-3xl"
                    >
                        <header className="mb-10 border-b border-border pb-6">
                            <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Security Center</h2>
                            <p className="text-muted-foreground">Advanced controls to keep your assets safe.</p>
                        </header>

                        <div className="grid gap-6">
                            {/* 2FA Card (Premium) */}
                            <div className="p-8 rounded-[2rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                                            <LockClosedIcon className="w-6 h-6 text-indigo-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Two-Factor Authentication</h3>
                                            <p className="text-indigo-200/80 text-sm max-w-sm">Add an extra layer of security to your account by requiring a code when signing in.</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/30 whitespace-nowrap opacity-50 cursor-not-allowed">
                                        Enable 2FA (Soon)
                                    </button>
                                </div>
                            </div>

                            {/* Security Questions */}
                            <div className="p-8 border border-border rounded-[2rem] bg-card">
                                <form action={async (formData) => { await updateProfile(formData) }} className="space-y-6">
                                    <h3 className="font-bold text-foreground flex items-center gap-2">
                                        <ShieldCheckIcon className="w-5 h-5 text-muted-foreground" />
                                        Recovery Question
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Question</label>
                                            <div className="relative">
                                                <select name="securityQuestion" defaultValue={user.securityQuestion || ""} className="w-full pl-4 pr-10 py-4 bg-muted/50 border border-border rounded-xl font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer">
                                                    <option value="" disabled>Select a recovery question</option>
                                                    <option value="pet">What was the name of your first pet?</option>
                                                    <option value="school">What elementary school did you attend?</option>
                                                    <option value="city">In what city were you born?</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Answer</label>
                                            <input 
                                                name="securityAnswer"
                                                defaultValue={user.securityAnswer || ""}
                                                type="text" 
                                                className="w-full px-4 py-4 bg-muted/50 border border-border rounded-xl font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                                                placeholder="Enter your secret answer"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button className="px-8 py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "payments" && (
                     <motion.div 
                        key="payments"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 max-w-4xl"
                    >
                        <header className="mb-10 text-center md:text-left border-b border-border pb-6">
                            <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Wallet & Methods</h2>
                            <p className="text-muted-foreground">Manage payment sources for deposits and withdrawals.</p>
                        </header>

                        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-[2.5rem] border border-border text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10 relative z-10">
                                <CreditCardIcon className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground font-serif mb-3 relative z-10">Payments Coming Soon</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-8 relative z-10 px-6">
                                We are finalizing partnerships with global payment providers to ensure secure and fast transactions. This section will be live shortly.
                            </p>
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                In Development
                            </span>
                        </div>
                    </motion.div>
                )}

                {activeTab === "verification" && (
                    <motion.div 
                        key="verification"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 max-w-3xl"
                    >
                         <header className="mb-10 text-center md:text-left border-b border-border pb-6">
                            <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Identity Verification</h2>
                            <p className="text-muted-foreground">Know Your Customer (KYC) compliance status.</p>
                        </header>

                        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-[2.5rem] border border-border text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-500/10 relative z-10">
                                <DocumentTextIcon className="w-10 h-10 text-purple-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground font-serif mb-3 relative z-10">KYC Portal In Progress</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-8 relative z-10 px-6">
                                Our automated identity verification system is currently undergoing security audits. It will be available for all users very soon.
                            </p>
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest rounded-full">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                In Development
                            </span>
                        </div>
                    </motion.div>
                )}

                {activeTab === "preferences" && (
                    <motion.div 
                        key="preferences"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 max-w-2xl"
                    >
                         <header className="mb-10 border-b border-border pb-6">
                            <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Global Preferences</h2>
                            <p className="text-muted-foreground">Customize your platform experience.</p>
                        </header>

                        <form action={async (formData) => { await updateProfile(formData) }} className="space-y-8">
                            
                            {/* Language & Currency */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <GlobeAltIcon className="w-4 h-4" /> Language
                                    </label>
                                    <select name="language" defaultValue={user.language} className="w-full px-5 py-4 bg-muted/50 border-none rounded-2xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="en">English (United States)</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <SwatchIcon className="w-4 h-4" /> Currency
                                    </label>
                                    <select name="currency" defaultValue={user.currency} className="w-full px-5 py-4 bg-muted/50 border-none rounded-2xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="h-px bg-border my-8"></div>

                            {/* Notifications */}
                            <div className="space-y-6">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                    <BellIcon className="w-5 h-5" />
                                    Notifications
                                </h3>
                                
                                {['Email Alerts', 'Push Notifications', 'Marketing Updates'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
                                        <span className="font-medium text-foreground">{item}</span>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={i !== 1} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-6">
                                <button className="px-10 py-4 bg-foreground text-background font-bold rounded-2xl shadow-xl shadow-foreground/20 hover:bg-foreground/90 hover:scale-[1.02] transition-all">
                                    Save Preferences
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

            </AnimatePresence>
         </div>
      </div>
    </div>
  )
}
