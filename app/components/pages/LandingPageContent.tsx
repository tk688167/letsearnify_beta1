"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Footer from "../layout/Footer";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import LandingHeader from "../../components/LandingHeader";
import {
  ArrowRightIcon,
  XMarkIcon,
  StarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import SignupForm from "../../components/auth/SignupForm";
import SocialProofStats from "../ui/SocialProofStats";
import PayoutsCarousel from "../ui/PayoutsCarousel";
import TestimonialsSection from "../../components/landing/TestimonialsSection";
import FAQSection from "../../components/landing/FAQSection";

// ─── ANIMATED DOTS BACKGROUND ───
function AnimatedDotsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    };
    
    checkDarkMode();
    const observer = new MutationObserver(() => checkDarkMode());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: any[] = [];
    let animationId: number;
    let isMounted = true;
    
    const handleResize = () => {
      if (!isMounted) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      pulseSpeed: number;
      pulseOffset: number;
      originalX: number;
      originalY: number;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.originalX = this.x;
        this.originalY = this.y;
        this.size = Math.random() * 3 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulseSpeed = 0.005 + Math.random() * 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }
      
      update(time: number) {
        const waveX = Math.sin(time * 0.0005 + this.originalY * 0.01) * 20;
        const waveY = Math.cos(time * 0.0005 + this.originalX * 0.01) * 20;
        
        this.x += this.speedX + waveX * 0.01;
        this.y += this.speedY + waveY * 0.01;
        
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        
        this.speedX += (Math.random() - 0.5) * 0.01;
        this.speedY += (Math.random() - 0.5) * 0.01;
        
        const maxSpeed = 0.6;
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        if (speed > maxSpeed) {
          this.speedX = (this.speedX / speed) * maxSpeed;
          this.speedY = (this.speedY / speed) * maxSpeed;
        }
        
        this.opacity = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(time * this.pulseSpeed + this.pulseOffset));
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(
          this.x - this.size/2, this.y - this.size/2, 0,
          this.x, this.y, this.size
        );
        
        if (isDark) {
          gradient.addColorStop(0, `rgba(139, 92, 246, ${this.opacity})`);
          gradient.addColorStop(0.5, `rgba(99, 102, 241, ${this.opacity * 0.8})`);
          gradient.addColorStop(1, `rgba(79, 70, 229, ${this.opacity * 0.3})`);
        } else {
          gradient.addColorStop(0, `rgba(139, 92, 246, ${this.opacity * 0.6})`);
          gradient.addColorStop(0.5, `rgba(99, 102, 241, ${this.opacity * 0.5})`);
          gradient.addColorStop(1, `rgba(79, 70, 229, ${this.opacity * 0.2})`);
        }
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
    
    function initParticles() {
      const count = Math.min(Math.floor((width * height) / 6000), 150);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }
    
    function drawConnections(ctx: CanvasRenderingContext2D, time: number) {
      const connectionDistance = Math.min(width, height) * 0.1;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * (isDark ? 0.25 : 0.15);
            const pulse = 0.7 + 0.3 * Math.sin(time * 0.001 + i * 0.1 + j * 0.1);
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            const grad = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            grad.addColorStop(0, `rgba(99, 102, 241, ${opacity * pulse})`);
            grad.addColorStop(0.5, `rgba(139, 92, 246, ${opacity * pulse * 0.8})`);
            grad.addColorStop(1, `rgba(168, 85, 247, ${opacity * pulse})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = isDark ? 0.8 : 0.5;
            ctx.stroke();
          }
        }
      }
    }
    
    function drawGlow(ctx: CanvasRenderingContext2D) {
      for (const particle of particles) {
        if (particle.size > 2.5) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
          );
          const glowOpacity = isDark ? particle.opacity * 0.15 : particle.opacity * 0.08;
          gradient.addColorStop(0, `rgba(99, 102, 241, ${glowOpacity})`);
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // ✅ FIXED: Properly handle requestAnimationFrame
    function animate(time: number) {
      if (!isMounted || !ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      drawGlow(ctx);
      
      for (const particle of particles) {
        particle.update(time);
        particle.draw(ctx);
      }
      
      drawConnections(ctx, time);
      animationId = requestAnimationFrame(animate);
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Start animation with initial timestamp
    animationId = requestAnimationFrame(animate);
    
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isDark]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none dark:bg-[#060e25] bg-blue-50 transition-colors duration-300"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── GRADIENT ORBS ───
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/15 dark:bg-indigo-500/15 blur-[150px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-fuchsia-500/15 dark:bg-fuchsia-500/15 blur-[150px] animate-float animation-delay-2000" />
      <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-[120px] animate-float animation-delay-4000" />
      <div className="absolute bottom-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-[100px] animate-float animation-delay-3000" />
    </div>
  );
}

// ─── FLOATING ICONS ───
function FloatingIcons() {
  const icons = ['🚀', '💎', '⚡', '🌟', '🎯', '🔥', '✨', '🎁'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-3xl md:text-4xl opacity-[0.06] sm:opacity-[0.08] md:opacity-[0.12]"
          initial={{ 
            x: Math.random() * 100 - 50 + '%',
            y: Math.random() * 100 - 50 + '%',
          }}
          animate={{
            y: ['-15%', '15%', '-15%'],
            x: ['-8%', '8%', '-8%'],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          style={{
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 90 + 5}%`,
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
}

// ─── TYPEWRITER EFFECT ───
function TypewriterEffect() {
  const words = ['Earn', 'Grow', 'Build', 'Achieve', 'Succeed'];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting && subIndex < words[index].length) {
        setSubIndex(prev => prev + 1);
      } else if (isDeleting && subIndex > 0) {
        setSubIndex(prev => prev - 1);
      } else if (!isDeleting && subIndex === words[index].length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && subIndex === 0) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timer);
  }, [subIndex, index, isDeleting, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
      {words[index].substring(0, subIndex)}
      <span className="animate-pulse text-indigo-500">|</span>
    </span>
  );
}

export default function LandingPageContent({ initialStats, initialProofs }: { initialStats?: any, initialProofs?: any[] }) {
  const searchParams = useSearchParams();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const refCode = searchParams.get("ref");

  useEffect(() => {
    if (refCode) {
      const timer = setTimeout(() => setIsSignupOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [refCode]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);
  const y = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060e25] text-foreground overflow-x-hidden font-sans selection:bg-primary/20 selection:text-primary">
      <LandingHeader />

      <main className="flex-1">

        {/* ═══ HERO SECTION ═══ */}
        <section className="relative pt-20 pb-5 md:pt-28 md:pb-5 overflow-hidden min-h-[85vh] flex items-center">
          <GradientOrbs />
          <AnimatedDotsBackground />
          <FloatingIcons />
          
          <motion.div 
            style={{ opacity, scale, y }} 
            className="w-full max-w-7xl mx-auto text-center relative z-10 px-4 sm:px-6"
          >
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-3"
            >
              <h1 className="font-serif font-black leading-[1.05] md:leading-[1.1] tracking-tight">
                <span className="text-[2.6rem] sm:text-6xl md:text-7xl lg:text-8xl block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
                    Let
                  </span>
                 <span className="animate-dollar font-sans inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
  $
</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
                    Earnify
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Tagline with Typewriter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mb-4"
            >
              <h2 className="text-xl sm:text-3xl md:text-4xl font-light text-muted-foreground">
                <TypewriterEffect />
                <span className="text-foreground"> Your Future</span>
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 px-4"
            >
              Complete tasks, refer friends, and earn rewards through genuine participation.
              A simple activation unlocks everything. Just real opportunities to grow your digital income and with our global community, you're never alone on your journey to financial empowerment.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 max-w-2xl mx-auto"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="group w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25 relative overflow-hidden flex items-center justify-center gap-2"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Now
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link
                  href="/login"
                  className="px-6 sm:px-8 py-4 border border-border w-full sm:w-auto hover:border-indigo-500/50 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:bg-indigo-500/5 backdrop-blur-sm inline-flex items-center justify-center"
                >
                  Login Dashboard
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2 text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider"
            >
              {[
                { icon: <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />, label: "Lifetime access" },
                { icon: <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />, label: "Instant activation" },
                { icon: <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />, label: "Global community" },
              ].map((item, i) => (
                <motion.span 
                  key={i}
                  className="flex items-center gap-1.5"
                  whileHover={{ scale: 1.1 }}
                >
                  {item.icon}
                  {item.label}
                  {i < 2 && <span className="hidden sm:inline text-border/30 ml-4 sm:ml-6">|</span>}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* FEATURE HIGHLIGHTS - 6 BOXES */}
        <section className="py-12 md:py-16 bg-slate-100/50 dark:bg-[#060e28]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-10 md:mb-12">
                <motion.h2 
                  className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  One Platform. Multiple Opportunities.
                </motion.h2>
                <p className="text-sm text-muted-foreground">
                  Explore different ways to earn through genuine activity
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
                {[
                  { title: "Daily Tasks", icon: "⚡", desc: "Complete tasks & earn rewards" },
                  { title: "Referral Program", icon: "👥", desc: "Invite friends & earn" },
                  { title: "Community Pools", icon: "🏦", desc: "Share in platform growth" },
                  { title: "Skill Marketplace", icon: "🎯", desc: "Offer your services" },
                  { title: "Daily Rewards", icon: "🎁", desc: "Spin & win every day" },
                  { title: "No Subscription", icon: "💎", desc: "Pay once, earn forever" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
                    }}
                    className="bg-white dark:bg-[#060e28] border border-border/50 rounded-2xl p-4 sm:p-5 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  >
                    <motion.div 
                      className="text-2xl sm:text-3xl mb-2"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="font-bold text-xs sm:text-sm text-foreground mb-1">{item.title}</h3>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* SOCIAL PROOF STATS */}
        <SocialProofStats stats={initialStats} />

        {/* ACTIVATION SECTION */}
        <section className="py-12 md:py-15 bg-slate-50 dark:bg-[#060e25] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
                <motion.h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-serif font-black mb-4 text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  One-Time Activation
                </motion.h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed px-4">
                  Instead of monthly fees, LetsEarnify uses a simple one-time activation.
                  This helps maintain a quality community and unlocks all earning opportunities.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center max-w-5xl mx-auto">
              <FadeIn>
                <div className="space-y-4">
                  {[
                    {
                      icon: "🔑",
                      title: "Access, Not a Barrier",
                      desc: "One-time activation. Pay once and access all platform activities.",
                    },
                    {
                      icon: "🛡️",
                      title: "Quality Community",
                      desc: "The activation fee helps maintain a community of genuine participants.",
                    },
                    {
                      icon: "♾️",
                      title: "Earn at Your Pace",
                      desc: "Your earnings are based on your activity and participation.",
                    },
                    {
                      icon: "💎",
                      title: "All Opportunities Unlocked",
                      desc: "Tasks, Referrals, Community Pools, Marketplace, and Spin — all included.",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
                      }}
                      className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-[#060e28] border border-border rounded-2xl hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <motion.div 
                        className="text-xl sm:text-2xl shrink-0"
                        whileHover={{ rotate: 20 }}
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground mb-0.5">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-20" />
                  <motion.div 
                    className="relative bg-white dark:bg-[#060e28] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 text-center shadow-2xl"
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                      One-Time Activation
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full mb-6 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Pay Once. Participate Forever.
                    </div>

                    <div className="space-y-2.5 text-left mb-8">
                      {[
                        "All earning opportunities",
                        "Referral rewards",
                        "Community pool distributions",
                        "Task rewards",
                        "Daily Spin rewards",
                        "Marketplace access",
                      ].map((item, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center gap-3 text-sm text-muted-foreground"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                          {item}
                        </motion.div>
                      ))}
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/signup"
                        className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg"
                      >
                        Activate Now
                      </Link>
                    </motion.div>

                    <div className="mt-4 text-xs text-muted-foreground">
                      Already a member?{" "}
                      <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        Log In
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* PAYOUT PROOFS */}
        <PayoutsCarousel proofs={initialProofs || []} />

        {/* EARNING OPPORTUNITIES */}
        <section id="features" className="bg-slate-100/50 dark:bg-[#060e28]/50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-10 md:mb-12">
                <motion.h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Earning Opportunities
                </motion.h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto px-4">
                  Explore different ways to earn through genuine activity and community participation.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <FeatureCard
                title="Referral Program"
                desc="Invite others and earn rewards through our referral structure. Share the platform with your network."
                icon="👥"
                gradient="from-blue-500 to-indigo-600"
                delay={0}
                badge="Passive"
                stat="Multi-level rewards"
              />
              <FeatureCard
                title="Task Completion"
                desc="Complete verified digital tasks — content reviews, social engagements — and get paid upon completion."
                icon="⚡"
                gradient="from-emerald-500 to-teal-600"
                delay={0.05}
                badge="Active"
                stat="Paid upon verification"
              />
              <FeatureCard
                title="Community Pools"
                desc="Participate in our community profit-sharing pools. Your contributions support the ecosystem."
                icon="🏦"
                gradient="from-amber-500 to-orange-500"
                delay={0.1}
                badge="Community"
                stat="Weekly distributions"
              />
              <FeatureCard
                title="Skill Marketplace"
                desc="List your digital services — design, writing, tech — and connect with a global community."
                icon="🎯"
                gradient="from-pink-500 to-rose-600"
                delay={0.15}
                badge="Service"
                stat="Zero platform fees"
              />
              <FeatureCard
                title="Daily Rewards"
                desc="Daily gamified rewards. Check in every 24 hours for bonus opportunities and surprises."
                icon="🎁"
                gradient="from-purple-500 to-violet-600"
                delay={0.2}
                badge="Daily"
                stat="Every 24 hours"
              />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                className="p-6 sm:p-8 bg-gradient-to-br from-indigo-600/10 to-fuchsia-600/10 border border-primary/20 rounded-2xl flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <motion.div 
                    className="text-3xl sm:text-4xl mb-4"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🚀
                  </motion.div>
                  <h3 className="font-bold text-lg sm:text-xl mb-2 font-serif">Ready to start?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    All opportunities. One simple activation. Join the community today.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:bg-foreground/90 transition-all"
                    >
                      Create Account
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-12 md:pt-15 md:pb-20 bg-slate-50 dark:bg-[#060e25] relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-10 md:mb-12">
                <motion.h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Four Simple Steps
                </motion.h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto px-4">
                  From signup to earning in under 5 minutes. No experience required.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative">
              {[
                { number: "01", title: "Create Account", desc: "Sign up with your email. Takes under 60 seconds.", color: "text-blue-500", iconBg: "from-blue-500 to-blue-600" },
                { number: "02", title: "Activate", desc: "Complete the one-time activation to unlock all opportunities.", color: "text-violet-500", iconBg: "from-violet-500 to-violet-600" },
                { number: "03", title: "Participate", desc: "Engage with Tasks, Referrals, Pools, Marketplace, or Spin.", color: "text-emerald-500", iconBg: "from-emerald-500 to-emerald-600" },
                { number: "04", title: "Withdraw", desc: "Track your earnings and withdraw securely to your preferred method.", color: "text-orange-500", iconBg: "from-orange-500 to-orange-600" },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
                  }}
                  className="relative p-4 md:p-6 rounded-2xl border border-border bg-white dark:bg-[#060e28] hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 text-center cursor-pointer"
                >
                  <div className={`text-4xl md:text-5xl font-black absolute top-3 right-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity ${step.color} select-none`}>
                    {step.number}
                  </div>
                  <motion.div 
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center font-black text-white text-base md:text-lg mb-3 md:mb-4 shadow-md mx-auto`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {idx + 1}
                  </motion.div>
                  <h3 className="font-bold text-sm md:text-base mb-2 text-foreground">{step.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST & SECURITY */}
        <section className="py-12 md:py-16 lg:py-24 bg-slate-100/50 dark:bg-[#060e28]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-10 md:mb-12">
                <motion.h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Trust & Transparency
                </motion.h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto px-4">
                  Built on principles of security, transparency, and community.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <TrustCard
                title="Secure Platform"
                desc="256-bit SSL encryption and multi-factor authentication protect every user account."
                icon="🛡️"
                color="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                hoverBorder="hover:border-blue-200 dark:hover:border-blue-800"
                delay={0}
              />
              <TrustCard
                title="Community-Driven"
                desc="Our platform is powered by genuine community participation and transparent distribution."
                icon="🤝"
                color="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                hoverBorder="hover:border-emerald-200 dark:hover:border-emerald-800"
                delay={0.1}
              />
              <TrustCard
                title="Real-Time Transparency"
                desc="Every earning, contribution, and withdrawal is logged in real-time. Your account is always transparent."
                icon="📊"
                color="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                hoverBorder="hover:border-amber-200 dark:hover:border-amber-800"
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* SUPPORT SECTION */}
        <section className="py-10 md:py-12 px-4 sm:px-6 bg-slate-50 dark:bg-[#060e25]">
          <FadeIn>
            <motion.div 
              className="max-w-5xl mx-auto bg-white dark:bg-[#060e28] border border-border/60 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-6"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-full md:w-[45%] text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  24/7 Support
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-foreground mb-3">
                  Always Here To Help
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Quick solutions for onboarding, tasks, and withdrawals. Your journey is fully supported.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-2 px-5 md:px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:bg-foreground/90 transition-all"
                  >
                    Visit Help Center
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>

              <div className="w-full md:w-[55%] grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: "📧", title: "Email Us", desc: "LetsEarnify@gmail.com", href: "mailto:LetsEarnify@gmail.com" },
                  { icon: "🎫", title: "Ticketing", desc: "Submit a request", href: "/support/tickets" },
                  { icon: "📚", title: "Guides", desc: "Read tutorials", href: "/support/knowledge-base" },
                ].map((item, i) => (
                  <motion.a
                    key={i}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#060e28]/50 border border-border/50 rounded-xl hover:border-primary/30 hover:bg-slate-100 dark:hover:bg-[#060e28] transition-all group cursor-pointer"
                  >
                    <motion.div 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-base sm:text-lg shrink-0"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      {item.icon}
                    </motion.div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-foreground">{item.title}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.desc}</div>
                    </div>
                  </motion.a>
                ))}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#060e28]/50 border border-border/30 rounded-xl opacity-60 cursor-default">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center text-base sm:text-lg shrink-0">💬</div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-foreground">Live Chat</div>
                    <div className="text-[8px] sm:text-[9px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded w-max mt-0.5">Coming Soon</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </section>

        {/* TESTIMONIALS */}
        <TestimonialsSection />

        {/* FAQ SECTION */}
        <FAQSection />

      </main>

      {/* FOOTER */}
      <Footer />

      {/* AUTO-OPEN SIGNUP MODAL */}
      <AnimatePresence>
        {isSignupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsSignupOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-full max-w-md bg-white dark:bg-[#060e28] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#060e28] z-10">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Create Account</h3>
                <button
                  onClick={() => setIsSignupOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {refCode && (
                  <div className="mb-6 p-4 bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-start gap-3">
                    <StarIcon className="w-5 h-5 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Referral Applied!</p>
                      <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1">
                        You are joining with code <span className="font-mono font-bold">{refCode}</span>.
                      </p>
                    </div>
                  </div>
                )}
                <SignupForm referralCode={refCode || ""} isModal={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HELPER COMPONENTS ───

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
  gradient,
  delay,
  badge,
  stat,
}: {
  title: string;
  desc: string;
  icon: string;
  gradient: string;
  delay: number;
  badge?: string;
  stat?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
      viewport={{ once: true }}
      className="p-5 sm:p-6 bg-white dark:bg-[#060e28] rounded-2xl border border-border hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
    >
      {badge && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {badge}
        </div>
      )}
      <motion.div 
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-base sm:text-xl mb-3 sm:mb-4 text-white shadow-lg`}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {icon}
      </motion.div>
      <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
      {stat && (
        <div className="text-[10px] font-bold text-primary uppercase tracking-wider border-t border-border pt-3 mt-auto">
          {stat}
        </div>
      )}
    </motion.div>
  );
}

function TrustCard({
  title,
  desc,
  icon,
  color,
  hoverBorder,
  delay,
}: {
  title: string;
  desc: string;
  icon: string;
  color: string;
  hoverBorder: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.4, delay }}
      viewport={{ once: true }}
      className={`p-6 sm:p-8 bg-white dark:bg-[#060e28] rounded-2xl border border-border text-center ${hoverBorder} hover:shadow-lg transition-all group cursor-pointer`}
    >
      <motion.div 
        className={`w-14 h-14 sm:w-16 sm:h-16 ${color} rounded-full flex items-center justify-center text-xl sm:text-2xl mb-4 mx-auto`}
        whileHover={{ scale: 1.1, rotate: 10 }}
      >
        {icon}
      </motion.div>
      <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}