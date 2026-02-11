"use client"
import React from "react"
import { motion } from "framer-motion"

export default function SocialProofStats({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 relative overflow-hidden">
             {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-indigo-50/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               viewport={{ once: true, margin: "-100px" }}
            >
                <div className="w-full relative mask-gradient-x">
                    <div className="flex gap-2 sm:gap-4 md:gap-8 w-max animate-marquee hover:pause-marquee py-2 sm:py-3 md:py-4">
                        {[1, 2].map((iteration) => (
                            <React.Fragment key={iteration}>
                                {/* Users Card */}
                                <StatCard 
                                    label="Community Members" 
                                    value={stats.totalUsers ?? 0} 
                                    suffix="+"
                                    gradient="from-indigo-500 to-blue-600"
                                    delay={0}
                                />
                                 {/* Online Card */}
                                <StatCard 
                                    label="Active Now" 
                                    value={stats.activeOnline ?? 0} 
                                    suffix=""
                                    isLive={true}
                                    gradient="from-emerald-400 to-green-600"
                                    delay={0.1}
                                />
                                 {/* Deposited Card */}
                                <StatCard 
                                    label="Total Liquidity" 
                                    value={stats.totalDeposited ?? 0} 
                                    prefix="$"
                                    gradient="from-blue-500 to-cyan-500"
                                    delay={0.2}
                                />
                                 {/* Payouts Card */}
                                <StatCard 
                                    label="Paid to Users" 
                                    value={stats.totalPayouts ?? 0} 
                                    prefix="$"
                                    gradient="from-fuchsia-500 to-pink-600"
                                    delay={0.3}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

function StatCard({ label, value, prefix = "", suffix = "", gradient, delay, isLive = false }: any) {
    const count = useCountUp(value, 2000); 

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
            className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-indigo-100/50 border border-gray-50 flex flex-col items-center justify-center group overflow-hidden min-w-[180px] sm:min-w-[220px] md:min-w-[280px] lg:min-w-[350px] mx-1 sm:mx-2 md:mx-4"
        >
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
            
            {isLive && (
                <div className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
            )}

            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent mb-1 sm:mb-2 font-sans tracking-tight`}>
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">{label}</div>
        </motion.div>
    )
}

// Simple CountUp Hook
function useCountUp(end: number, duration: number = 2000) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Ease out quart
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            setCount(Math.floor(easeOutQuart * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end); 
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return count;
}
