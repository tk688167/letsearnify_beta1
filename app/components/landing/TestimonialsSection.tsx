"use client"

import { motion } from "framer-motion"
import { StarIcon } from "@heroicons/react/24/solid"

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Freelance Designer",
    content: "I was skeptical at first, but the Mudaraba pool returns have been remarkably consistent. It's refreshing to finally see a platform that clearly explains where the profit actually comes from.",
    rating: 5,
    location: "United Kingdom",
    avatar: "SJ",
    color: "from-pink-500 to-rose-500"
  },
  {
    name: "Michael Chen",
    role: "Micro-Task Earner",
    content: "The withdrawal process is seamless. I've used other sites where funds get stuck for weeks. Here, transparency is real — standard tasks pay better than any competitor I've tried.",
    rating: 5,
    location: "Singapore",
    avatar: "MC",
    color: "from-blue-500 to-indigo-500"
  },
  {
    name: "Amara Ndiaye",
    role: "Community Leader",
    content: "The referral system is the fairest I've ever seen. It's not about recruiting endlessly — it's about building a team that actually works together and earns together. Real difference.",
    rating: 4,
    location: "Nigeria",
    avatar: "AN",
    color: "from-amber-500 to-orange-500"
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/20 overflow-hidden relative">
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-fuchsia-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] sm:text-xs mb-4 sm:mb-6 border border-amber-500/20 uppercase tracking-wider">
            Real People. Real Earnings.
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
            Trusted by Global Earners
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed px-2">
            Thousands of users across the world are already building consistent digital income on LetsEarnify.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group"
            >
              {/* Subtle background accent */}
              <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${item.color} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`}></div>

              {/* Stars */}
              <div className="flex gap-1 mb-4 sm:mb-5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < item.rating ? "text-amber-400" : "text-muted"}`} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/80 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 flex-1 italic">
                "{item.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-border">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center font-bold text-white text-xs sm:text-sm shrink-0`}>
                  {item.avatar}
                </div>
                <div>
                  <div className="font-bold text-foreground text-xs sm:text-sm">{item.name}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{item.role} · {item.location}</div>
                </div>
                <div className="ml-auto">
                  <div className="text-[8px] sm:text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-green-500/20 uppercase tracking-wider">
                    Verified
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-muted-foreground text-sm">
            Join <span className="text-foreground font-bold">thousands of earners</span> already building their income on LetsEarnify
          </p>
        </motion.div>
      </div>
    </section>
  )
}
