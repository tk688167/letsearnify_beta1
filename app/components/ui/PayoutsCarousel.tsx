"use client"
import React from "react"
import { motion } from "framer-motion"

export default function PayoutsCarousel({ proofs }: { proofs: any[] }) {
    if (!proofs || proofs.length === 0) return null;

    // Duplicate proofs to create seamless loop
    const marqueeProofs = [...proofs, ...proofs, ...proofs, ...proofs];

    return (
        <section className="py-24 bg-background text-foreground overflow-hidden relative font-sans">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] translate-y-1/2"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Transaction Feed
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-serif font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
                    >
                        Success Stories Noticed Daily
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-black dark:text-muted-foreground text-lg max-w-2xl mx-auto font-medium"
                    >
                        Real people, real earnings. Join thousands withdrawing instantly to their preferred wallets.
                    </motion.p>
                </div>

                <div className="relative w-full overflow-hidden mask-gradient-x">
                    {/* Marquee Container */}
                    <div className="flex gap-6 w-max animate-marquee hover:pause-marquee">
                        {marqueeProofs.map((proof: any, index: number) => (
                            <div key={`${proof.id}-${index}`} className="w-[280px] md:w-[320px] flex-shrink-0 group">
                                <div className="relative aspect-[4/5] bg-card rounded-3xl overflow-hidden border border-border shadow-2xl shadow-muted/20 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-primary/20 group-hover:-translate-y-2">
                                    {/* Image */}
                                    <img src={proof.imageUrl} alt={`Payout to ${proof.userName}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                    
                                    {/* Content */}
                                    <div className="absolute bottom-0 inset-x-0 p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-muted/50 backdrop-blur-md flex items-center justify-center border border-border text-xl">
                                                👤
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground text-lg leading-tight">{proof.userName}</div>
                                                <div className="text-primary text-xs font-medium tracking-wide">Verified Earner</div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-muted/30 backdrop-blur-md rounded-xl p-3 border border-border flex justify-between items-center group-hover:bg-muted/50 transition-colors">
                                           <div>
                                               <div className="text-[10px] text-black dark:text-muted-foreground uppercase tracking-widest font-black">Received</div>
                                               <div className="text-emerald-500 font-mono font-bold text-xl">${proof.amount.toFixed(2)}</div>
                                           </div>
                                           <div className="text-right">
                                               <div className="text-[10px] text-black dark:text-muted-foreground uppercase tracking-widest font-black">Via</div>
                                               <div className="text-foreground text-sm font-semibold">{proof.method}</div>
                                           </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
