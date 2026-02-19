"use client"

import { motion } from "framer-motion"
import { StarIcon } from "@heroicons/react/24/solid"

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Freelance Designer",
    content: "I was skeptical at first, but the Mudaraba pool returns have been consistent. It's refreshing to see a platform that actually explains where the profit comes from.",
    rating: 5,
    location: "United Kingdom"
  },
  {
    name: "Michael Chen",
    role: "Micro-Task Earner",
    content: "The withdrawal process is seamless. I've used other sites where funds get stuck, but here, the transparency is real. Standard tasks pay better than competitors too.",
    rating: 5,
    location: "Singapore"
  },
  {
    name: "Amara Ndiaye",
    role: "Community Leader",
    content: "The referral system is the fairest I've seen. It's not about recruiting endlessly; it's about building a team that actually works and earns together.",
    rating: 4,
    location: "Nigeria"
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">Trusted by Global Earners</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Join a community of thousands who are already building their digital wealth with transparency and security.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-[2rem] p-8 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < item.rating ? "text-amber-400" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-muted-foreground text-lg italic mb-6 leading-relaxed">"{item.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.role} • {item.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
