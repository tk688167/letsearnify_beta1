"use client"

import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const navItems = [
  '/dashboard',
  '/dashboard/spin',
  '/dashboard/tasks',
  '/dashboard/referrals',
  '/dashboard/wallet'
]

export function SwipeContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [direction, setDirection] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768)
    
    // Initial check
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Find current index in nav list
  const currentIndex = navItems.indexOf(pathname)

  const handleSwipe = (swipeDirection: number) => {
    if (currentIndex === -1) return // Not in a swipeable route

    const nextIndex = currentIndex + swipeDirection
    if (nextIndex >= 0 && nextIndex < navItems.length) {
      setDirection(swipeDirection)
      router.push(navItems[nextIndex])
    }
  }

  // Desktop: Render children directly without animation wrapper to avoid conflicts
  if (isDesktop) {
      return <div className="h-full w-full">{children}</div>
  }

  return (
    <div className="relative h-full overflow-x-hidden">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={{
            enter: (direction: number) => ({
              x: direction > 0 ? '100vw' : '-100vw',
              opacity: 0
            }),
            center: {
              x: 0,
              opacity: 1
            },
            exit: (direction: number) => ({
              x: direction < 0 ? '100vw' : '-100vw',
              opacity: 0
            })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 500
            if (swipe) {
              handleSwipe(offset.x > 0 ? -1 : 1)
            }
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
