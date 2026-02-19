"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
    UserCircleIcon, 
    ShieldCheckIcon, 
    PencilSquareIcon, 
    WalletIcon, 
    UserIcon, 
    LinkIcon,
    CameraIcon,
    UsersIcon,
    StarIcon,
    CheckBadgeIcon,
    KeyIcon,
    DocumentTextIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { User } from "@prisma/client"
import { CopyableText } from "@/app/(dashboard)/dashboard/copyable-text"
import { formatCurrency, formatUserId } from "@/lib/utils"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProfileViewProps {
    user: User & {
        _count: {
            referrals: number
        }
    }
}

export default function ProfileView({ user }: ProfileViewProps) {
    const [activeTab, setActiveTab] = useState("overview")

    const tabs = [
        { id: "overview", label: "Overview", icon: UserCircleIcon },
        { id: "security", label: "Security", icon: ShieldCheckIcon },
        { id: "settings", label: "Settings", icon: Cog6ToothIcon },
    ]

    return (
        <div className="max-w-5xl mx-auto pb-12">
            
            {/* 1. HERO SECTION - NEW STABLE FLOW LAYOUT */}
            <div className="mb-24 relative group">
                {/* A. Cover Photo (Static Height) */}
                <div className="h-48 md:h-72 w-full rounded-[2.5rem] bg-gradient-to-r from-background via-indigo-900/50 to-indigo-800/50 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Status Badge (Absolute to Cover) */}
                    <div className="absolute top-6 right-6 z-10">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider shadow-xl">
                            <ShieldCheckIcon className={cn("w-4 h-4", user.isActiveMember ? "text-emerald-400" : "text-gray-400")} />
                            {user.isActiveMember ? "Verified Member" : "Unverified"}
                        </div>
                    </div>
                </div>

                {/* B. Profile Bar (Negative Margin, In-Flow) */}
                <div className="px-6 md:px-12 -mt-16 md:-mt-20 relative z-20 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    
                    {/* 1. Avatar (Fixed Size) */}
                    <div className="shrink-0 relative">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] border-[6px] border-background bg-background shadow-2xl overflow-hidden relative group cursor-pointer transition-transform hover:scale-[1.02]">
                            {user.image ? (
                                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                    <UserCircleIcon className="w-20 h-20 text-muted-foreground" />
                                </div>
                            )}
                            
                            {/* Hover Edit Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <CameraIcon className="w-8 h-8 text-white/90" />
                            </div>
                        </div>
                    </div>

                    {/* 2. User Identity Block (Self-Stabilizing) */}
                    <div className="flex-1 md:mb-6 min-w-0 pt-2 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1 justify-center md:justify-start">
                            <h1 className="text-3xl md:text-5xl font-bold text-foreground font-serif tracking-tight">
                                {user.name}
                            </h1>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest border self-center md:self-auto",
                                user.tier === 'GOLD' || user.tier === 'PLATINUM' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            )}>
                                {user.tier}
                            </span>
                        </div>
                        <p className="text-muted-foreground font-medium text-sm md:text-base flex items-center gap-2 justify-center md:justify-start">
                            <span>{user.email}</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                            <span className="text-muted-foreground">Member since {new Date(user.createdAt).getFullYear()}</span>
                        </p>
                    </div>

                    {/* 3. Action Buttons (Right Aligned) */}
                    <div className="md:mb-8 flex items-center gap-3 w-full md:w-auto">
                        <Link href="/dashboard/profile/edit" className="w-full md:w-auto">
                            <button className="w-full md:w-auto px-6 py-3 bg-card border border-border text-foreground font-bold rounded-xl shadow-sm hover:bg-muted/50 hover:border-border/80 transition-all flex items-center justify-center gap-2 group whitespace-nowrap">
                                <PencilSquareIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                Edit Profile
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. NAVIGATION TABS */}
            <div className="px-4 md:px-0 mb-8 mt-8">
                <div className="flex p-1 bg-muted/50 rounded-2xl w-full md:w-fit gap-1 backdrop-blur-sm border border-border mx-auto md:mx-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300",
                                    isActive 
                                        ? "bg-card text-foreground shadow-md ring-1 ring-black/5 dark:ring-white/10" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 3. CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                
                {/* LEFT COLUMN: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* STATS OVERVIEW CARD */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            title="Wallet Balance"
                            value={formatCurrency(user.balance || 0)} // Fixed: user.balance instead of totalEarned
                            icon={WalletIcon}
                            color="emerald"
                            delay={0.1}
                        />
                        <StatCard 
                            title="Community"
                            value={user._count.referrals.toString()}
                            suffix=" Members"
                            icon={UsersIcon}
                            color="blue"
                            delay={0.2}
                        />
                        <StatCard 
                            title="Loyalty Tier"
                            value={user.tier}
                            icon={StarIcon}
                            color="amber"
                            delay={0.3}
                        />
                        <StatCard 
                            title="Total ARN"
                            value={user.arnBalance.toLocaleString()}
                            suffix=" ARN"
                            icon={CheckBadgeIcon}
                            color="purple"
                            delay={0.4}
                        />
                    </div>


                    {/* DYNAMIC TAB CONTENT */}
                    <div className="bg-card rounded-[2rem] border border-border shadow-sm p-8 min-h-[400px]">
                        {activeTab === "overview" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground font-serif mb-6">Personal Details</h3>
                                    <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
                                        <DetailRow label="Full Name" value={user.name!} />
                                        <DetailRow label="Email Address" value={user.email!} />
                                        <DetailRow label="Phone Number" value={user.phoneNumber || "Not set"} />
                                        <DetailRow label="Country" value={user.country || "Global"} />
                                        <DetailRow label="Member Since" value={new Date(user.createdAt).toLocaleDateString('en-US')} />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Member ID</p>
                                            <div className="flex items-center gap-2">
                                                <CopyableText 
                                                    text={formatUserId(user.memberId)}
                                                    className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-border">
                                    <h3 className="text-lg font-bold text-foreground font-serif mb-6">Referral Info</h3>
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Your Referral Code</p>
                                            <p className="text-xs text-muted-foreground">Share this to earn rewards</p>
                                        </div>
                                        <CopyableText 
                                            text={user.referralCode || "No Code"}
                                            className="font-mono font-bold text-lg text-foreground bg-background px-4 py-2 rounded-xl border border-border shadow-sm"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "security" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <h3 className="text-lg font-bold text-foreground font-serif mb-4">Security Settings</h3>
                                
                                <div className="p-5 border border-border rounded-2xl flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <KeyIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-foreground">Change Password</h4>
                                        <p className="text-xs text-muted-foreground">Update your password regularly</p>
                                    </div>
                                    <button className="text-sm font-bold text-blue-600 dark:text-blue-400">Update</button>
                                </div>

                                <div className="p-5 border border-border rounded-2xl flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-foreground">KYC Verification</h4>
                                        <p className="text-xs text-muted-foreground">Status: <span className={cn("font-bold uppercase", user.kycStatus === 'VERIFIED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500')}>{user.kycStatus}</span></p>
                                    </div>
                                    <button className="text-sm font-bold text-emerald-600 dark:text-emerald-400">View</button>
                                </div>

                                <div className="p-5 border border-border rounded-2xl flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <DocumentTextIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-foreground">Login History</h4>
                                        <p className="text-xs text-muted-foreground">Monitor active sessions</p>
                                    </div>
                                    <button className="text-sm font-bold text-muted-foreground hover:text-foreground">View Logs</button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <h3 className="text-lg font-bold text-foreground font-serif mb-4">Preferences</h3>
                                <p className="text-muted-foreground text-sm">Manage your notification and display settings.</p>
                                {/* Placeholder for settings toggles */}
                                <div className="h-48 bg-muted/30 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm font-medium">
                                    Notification Settings Coming Soon
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar (Progress/Badges) */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8"></div>
                        <h3 className="text-lg font-serif font-bold mb-1">Current Tier</h3>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6">Progress Tracker</p>
                        
                        <div className="mb-6 text-center">
                            <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white/20">
                                <StarIcon className="w-10 h-10 text-yellow-400" />
                            </div>
                            <h2 className="text-2xl font-bold">{user.tier}</h2>
                            <p className="text-sm text-indigo-200">Next: Upgrade Available</p>
                        </div>

                        <Link href="/dashboard/tiers" className="block w-full py-3 bg-white text-indigo-900 font-bold text-center rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                            View All Benefits
                        </Link>
                    </div>

                    <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm">
                        <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href="/dashboard/wallet?tab=deposit">
                                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-muted/50 text-sm font-bold text-foreground/80 transition-colors flex items-center gap-3">
                                    <WalletIcon className="w-4 h-4 text-emerald-500"/>
                                    Deposit Funds
                                </button>
                            </Link>
                            <Link href="/dashboard/profile/edit">
                                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-muted/50 text-sm font-bold text-foreground/80 transition-colors flex items-center gap-3">
                                    <PencilSquareIcon className="w-4 h-4 text-blue-500"/>
                                    Edit Profile
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-foreground font-medium font-serif text-lg">{value}</p>
        </div>
    )
}

function StatCard({ title, value, suffix, icon: Icon, color, delay }: any) {
    const colors: any = {
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
        >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 border", colors[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
            <p className="text-xl font-bold text-foreground mt-1">
                {value}
                {suffix && <span className="text-sm font-medium text-muted-foreground ml-1">{suffix}</span>}
            </p>
        </motion.div>
    )
}
