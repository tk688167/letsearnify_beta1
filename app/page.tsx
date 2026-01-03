import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

const SUPPORT_EMAIL = "LetsEarnify@gmail.com"

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-serif font-bold tracking-tight">
            Let'<span className="text-primary">$</span>Earnify
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          </nav>
          <div className="flex gap-4">
             <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
               Log In
             </Link>
             <Link 
               href="/signup" 
               className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
             >
               Get Started
             </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20">
        <section className="relative px-6 text-center max-w-5xl mx-auto mb-32">
          {/* Decor */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl -z-10 opacity-50"></div>
          
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            🚀 The Future of Digital Earning
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-[1.1]">
            Turn <span className="text-primary">$1</span> into <br/>
            <span className="text-gradient">Endless Opportunities</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            A Hybrid Business Model bridging Micro-Tasks, Freelancing, and Ethical Investments. 
            Join the ecosystem designed for your financial freedom.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              href="/signup" 
              className="px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-full text-lg font-semibold shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
            >
              Start Earning Now
            </Link>
            <Link 
              href="/about" 
              className="px-10 py-4 bg-white border border-gray-200 text-gray-700 rounded-full text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white/50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">The 4-Pillar Ecosystem</h2>
               <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                title="Referral Network" 
                desc="Build your team and earn passive commissions from a multi-tier referral system."
                icon="👥"
                gradient="from-blue-500 to-indigo-600"
              />
              <FeatureCard 
                title="Task Center" 
                desc="Complete simple micro-tasks for instant rewards in your spare time."
                icon="✅"
                gradient="from-emerald-500 to-teal-600"
              />
              <FeatureCard 
                title="Mudaraba Pool" 
                desc="Ethical, profit-sharing investment pools for long-term passive growth."
                icon="📈"
                gradient="from-amber-400 to-orange-500"
              />
              <FeatureCard 
                title="Marketplace" 
                desc="Offer your professional skills and services to a global audience."
                icon="🛍️"
                gradient="from-pink-500 to-rose-600"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2"></div>
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">How It Works</h2>
                 <p className="text-gray-500 max-w-2xl mx-auto">Start your earning journey in four simple steps.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 {[
                    { number: "01", title: "Create Account", desc: "Sign up with your email & country in under 60 seconds." },
                    { number: "02", title: "Activate", desc: "Unlock full platform access with a minimal $1 deposit." },
                    { number: "03", title: "Choose Earning", desc: "Engage in Tasks, Referrals, Marketplace, or Investment pools." },
                    { number: "04", title: "Withdraw", desc: "Track earnings in real-time and withdraw securely." }
                 ].map((step, idx) => (
                    <div key={idx} className="relative p-8 bg-white/60 backdrop-blur-sm border border-white/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
                       <div className="text-5xl font-bold text-gray-100 mb-6 group-hover:text-blue-50 transition-colors">{step.number}</div>
                       <h3 className="font-serif font-bold text-xl mb-3 text-gray-900 relative z-10">{step.title}</h3>
                       <p className="text-gray-500 text-sm leading-relaxed relative z-10">{step.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Why Users Trust Us Section */}
        <section className="py-20 bg-gray-50/50">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Why Users Trust Let'$Earnify</h2>
                 <p className="text-gray-500 max-w-2xl mx-auto">Built on transparency, security, and ethical financial principles.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-blue-100 transition-colors">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl mb-6 text-blue-600">🛡️</div>
                    <h3 className="font-bold text-lg mb-3">Secure Infrastructure</h3>
                    <p className="text-gray-500 text-sm">Enterprise-grade security for your wallet and personal data.</p>
                 </div>
                 <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-emerald-100 transition-colors">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-2xl mb-6 text-emerald-600">⚖️</div>
                    <h3 className="font-bold text-lg mb-3">Ethical Profit-Sharing</h3>
                    <p className="text-gray-500 text-sm">Our Mudaraba model ensures fair, transparent profit distribution.</p>
                 </div>
                 <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-amber-100 transition-colors">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-2xl mb-6 text-amber-600">💳</div>
                    <h3 className="font-bold text-lg mb-3">Real-Time Tracking</h3>
                    <p className="text-gray-500 text-sm">Monitor every cent of your earnings and deposits instantly.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Customer Support Section */}
        <section className="py-24 px-6 relative">
             <div className="max-w-5xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] p-12 shadow-2xl shadow-gray-200/50 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>
                <div className="flex-1 space-y-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      💬 We're Here To Help
                   </div>
                   <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Dedicated Support & Resources</h2>
                   <p className="text-gray-500 leading-relaxed">
                      Your success is our priority. We provide multiple channels to ensure you never feel stuck or alone on your journey.
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <a 
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Support Request – Let'$Earnify")}&body=${encodeURIComponent("Hello Let'$Earnify Support Team,\n\nI need help regarding my account.\n\nName:\nRegistered Email:\nUser ID (if available):\nIssue Description:\n\nThank you,")}`}
                        className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group cursor-pointer"
                      >
                         <div className="flex items-center gap-3">
                            <span className="text-xl">📧</span>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Email Support</span>
                         </div>
                         <span className="text-[10px] text-gray-400 pl-9">Opens default email app</span>
                      </a>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                         <span className="text-xl">🎫</span>
                         <span className="text-sm font-semibold text-gray-700">Ticket System</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                         <span className="text-xl">📚</span>
                         <span className="text-sm font-semibold text-gray-700">Knowledge Base</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl opacity-70">
                         <span className="text-xl">💬</span>
                         <div>
                            <span className="text-sm font-semibold text-gray-700 block">Live Chat</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Coming Soon</span>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                   <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl text-center">
                      <div className="text-4xl mb-2">24/7</div>
                      <div className="text-sm text-gray-300 font-medium">System Monitoring</div>
                   </div>
                   <Link href="/support" className="p-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-3xl text-center font-bold transition-colors">
                      Visit Help Center
                   </Link>
                </div>
             </div>
        </section>

        {/* Transparency & Rules Section */}
        <section className="pb-24 pt-10 px-6">
           <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
                       <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                       Platform Rules
                    </h3>
                    <ul className="space-y-4">
                       <li className="flex gap-3 text-sm text-gray-600">
                          <span className="text-blue-500 font-bold">•</span>
                          Minimum $1 deposit required for activation
                       </li>
                       <li className="flex gap-3 text-sm text-gray-600">
                          <span className="text-blue-500 font-bold">•</span>
                          Marketplace applies minimum commission fees
                       </li>
                       <li className="flex gap-3 text-sm text-gray-600">
                          <span className="text-blue-500 font-bold">•</span>
                          Withdrawals subject to standard verification
                       </li>
                    </ul>
                 </div>
                 <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
                       <span className="w-2 h-8 bg-gray-500 rounded-full"></span>
                       Transparency
                    </h3>
                    <ul className="space-y-4">
                       <li className="flex gap-3 text-sm text-gray-600">
                          <span className="text-gray-400 font-bold">•</span>
                          Earnings depend on activity & participation
                       </li>
                       <li className="flex gap-3 text-sm text-gray-600">
                          <span className="text-gray-400 font-bold">•</span>
                          No guaranteed fixed profits in Mudaraba
                       </li>
                       <li className="flex gap-3 text-sm text-gray-600">
                          <span className="text-gray-400 font-bold">•</span>
                          Global architecture for worldwide access
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </section>
        
        {/* Deposit/CTA Section */}
        <section className="py-24 px-6">
           <div className="max-w-6xl mx-auto bg-gray-900 text-white rounded-[2rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
                       <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Premium Access
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Start Small, <br/> Dream Big.</h2>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                       Unlock the full potential of the platform with a minimal entry deposit. 
                       Get access to high-value tasks, marketplace posting, and investment pools.
                    </p>
                    <ul className="space-y-4 mb-10">
                       <li className="flex items-center gap-3 text-gray-300">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">✓</span>
                          Instant Account Activation
                       </li>
                       <li className="flex items-center gap-3 text-gray-300">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">✓</span>
                          Access to all 4 Earning Pillars
                       </li>
                       <li className="flex items-center gap-3 text-gray-300">
                          <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">✓</span>
                          24/7 Priority Support
                       </li>
                    </ul>
                 </div>
                 
                 <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center">
                    <div className="text-sm uppercase tracking-widest text-gray-400 mb-2">Minimum Deposit</div>
                    <div className="text-6xl font-bold mb-2">$1<span className="text-2xl text-gray-400">.00</span></div>
                    <div className="text-gray-400 text-sm mb-8">One-time entry fee</div>
                    
                    <Link 
                      href="/signup" 
                      className="block w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                    >
                       Get Started Now
                    </Link>
                    <p className="mt-4 text-xs text-gray-500">Secure payment via Stripe & TRC20</p>
                 </div>
              </div>
           </div>
        </section>
        
        {/* Final Emotional CTA Section */}
        <section className="py-20 text-center px-6">
           <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Start Small. Grow Big.</h2>
              <p className="text-xl text-gray-500 mb-10 font-light">
                 Your financial freedom journey doesn't need a fortune to begin. 
                 Consistency is the key to unlocking endless opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link 
                   href="/signup" 
                   className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                 >
                   Create Free Account
                 </Link>
                 <Link 
                   href="/signup" 
                   className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                 >
                   Start with $1
                 </Link>
              </div>
           </div>
        </section>

      </main>

      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1">
                 <div className="text-xl font-serif font-bold mb-6">Let'$Earnify</div>
                 <p className="text-gray-500 text-sm leading-relaxed">
                    The ultimate platform for financial freedom. Join thousands of users growing their wealth today.
                 </p>
              </div>
              <div>
                 <h4 className="font-bold mb-6">Platform</h4>
                 <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link href="#" className="hover:text-primary">Features</Link></li>
                    <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                    <li><Link href="#" className="hover:text-primary">Investments</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-6">Company</h4>
                 <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                    <li><Link href="#" className="hover:text-primary">Careers</Link></li>
                    <li><Link href="/support" className="hover:text-primary">Contact</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-6">Legal</h4>
                 <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                    <li><Link href="#" className="hover:text-primary">Risk Disclosure</Link></li>
                 </ul>
              </div>
           </div>
           <div className="text-center text-sm text-gray-400 border-t border-gray-100 pt-10">
              © 2024 Let'$Earnify. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc, icon, gradient }: { title: string, desc: string, icon: string, gradient: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-gray-900 font-serif">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-light">{desc}</p>
    </div>
  )
}
