"use client";

import { motion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Freelance Designer",
    content:
      "I was skeptical at first, but the Mudaraba pool returns have been remarkably consistent. It's refreshing to finally see a platform that clearly explains where the profit actually comes from.",
    rating: 5,
    location: "United Kingdom",
    avatar: "SJ",
    handle: "@sarah_j_design",
    time: "2h",
    color: "from-pink-500 to-rose-500",
    stats: { reposts: "23K", likes: "187K", views: "412K" },
  },
  {
    name: "Michael Chen",
    role: "Micro-Task Earner",
    content:
      "The withdrawal process is seamless. I've used other sites where funds get stuck for weeks. Here, transparency is real — standard tasks pay better than any competitor I've tried.",
    rating: 5,
    location: "Singapore",
    avatar: "MC",
    handle: "@mchen_trades",
    time: "4h",
    color: "from-blue-500 to-indigo-500",
    stats: { reposts: "41K", likes: "223K", views: "538K" },
  },
  {
    name: "Amara Ndiaye",
    role: "Community Leader",
    content:
      "The referral system is the fairest I've ever seen. It's not about recruiting endlessly — it's about building a team that actually works together and earns together. Real difference.",
    rating: 4,
    location: "Nigeria",
    avatar: "AN",
    handle: "@amara_leaders",
    time: "6h",
    color: "from-amber-500 to-orange-500",
    stats: { reposts: "17K", likes: "94K", views: "261K" },
  },
  {
    name: "Marco Rossi",
    role: "Digital Nomad",
    content:
      "Five income streams in one place. Activated for $1 and haven't looked back. The Spin Wheel is a daily habit now — such a fun way to start the workday!",
    rating: 5,
    location: "Italy",
    avatar: "MR",
    handle: "@marco_nmd",
    time: "8h",
    color: "from-emerald-500 to-teal-500",
    stats: { reposts: "39K", likes: "178K", views: "495K" },
  },
];

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
            Trusted by Global Leaders
          </h2>
          <p className="text-black dark:text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed px-2 font-medium">
            Thousands of users across the world are already building consistent
            digital income on LetsEarnify.
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
              className="bg-card rounded-2xl p-6 sm:p-7 border border-border hover:border-indigo-500/30 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden group h-full shadow-sm"
            >
              {/* Header: Platform Meta */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center font-bold text-white text-sm shadow-inner`}
                  >
                    {item.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-foreground text-sm leading-none">
                        {item.name}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5 text-blue-500 fill-current"
                        aria-hidden="true"
                      >
                        <path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.26-.54.4-1.14.4-1.76 0-2.26-1.83-4.1-4.1-4.1-.62 0-1.21.14-1.76.4C14.15 2.13 12.78 1.25 11.2 1.25s-2.95.88-3.66 2.18c-.54-.26-1.14-.4-1.76-.4-2.26 0-4.1 1.83-4.1 4.1 0 .62.14 1.21.4 1.76C.88 9.55 0 10.92 0 12.5s.88 2.95 2.18 3.66c-.26.54-.4 1.14-.4 1.76 0 2.26 1.83 4.1 4.1 4.1.62 0 1.21-.14 1.76-.4 1.32 2.18 2.84 2.18 4.41 2.18s2.95-.88 3.66-2.18c.54.26 1.14.4 1.76.4 2.26 0 4.1-1.83 4.1-4.1 0-.62-.14-1.21-.4-1.76 1.3-1.32 2.18-2.69 2.18-4.25zM10.85 18.15l-4.25-4.25 1.41-1.41 2.84 2.84 6.71-6.71 1.41 1.41-8.12 8.12z" />
                      </svg>
                    </div>
                    <div className="text-[11px] text-black/60 dark:text-muted-foreground font-medium">
                      {item.handle} · {item.time}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-3 h-3 ${i < item.rating ? "text-amber-400" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Body: Tweet Content */}
              <p className="text-black dark:text-foreground/90 text-sm sm:text-base leading-relaxed mb-6 flex-1 font-medium italic">
                "{item.content}"
              </p>

              {/* Footer: Stats & Meta */}
             
            </motion.div>
          ))}
        </div>

        
      </div>
    </section>
  );
}
