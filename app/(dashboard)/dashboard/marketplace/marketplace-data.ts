export interface Freelancer {
  id: string; name: string; title: string; initials: string; avatarColor: string
  bio: string; category: string; skills: string[]; rating: number; reviews: number
  hourlyRate: number; verified: boolean; topRated: boolean; location: string
  completedJobs: number; responseTime: string; level: string; portfolio: string[]
  availability: "available" | "busy" | "away"; joinedDate: string; languages: string[]
  verificationStatus: "none" | "pending" | "verified"
}

export interface JobPost {
  id: string; clientName: string; clientInitials: string; clientColor: string
  title: string; category: string; budget: string; deadline: string
  description: string; skills: string[]; postedAt: string; comments: Comment[]
}

export interface Comment {
  id: string; freelancerId: string; freelancerName: string
  freelancerInitials: string; freelancerColor: string; freelancerTitle: string
  text: string; postedAt: string; verified: boolean
}

export interface ChatThread {
  id: string; freelancerId: string; messages: { id: string; from: "me"|"them"; text: string; time: string }[]
}

export interface VerificationApplication {
  portfolioUrl: string
  yearsExperience: string
  category: string
  pitch: string
}

export const CATEGORIES = ["All","Development","Design","Marketing","Writing","Video","AI & ML","Finance","Cybersecurity","Music","Translation"]

export const CATEGORY_ICONS: Record<string, string> = {
  "All": "🌐",
  "Development": "💻",
  "Design": "🎨",
  "Marketing": "📣",
  "Writing": "✍️",
  "Video": "🎬",
  "AI & ML": "🤖",
  "Finance": "💰",
  "Cybersecurity": "🔒",
  "Music": "🎵",
  "Translation": "🌍",
}

export const FREELANCERS: Freelancer[] = [
  { id:"1", name:"Sarah Chen", title:"Full-Stack Developer", initials:"SC", avatarColor:"from-violet-500 to-purple-700", bio:"5+ years building production-grade React & Node.js apps. Specialized in fintech and SaaS platforms.", category:"Development", skills:["React","Node.js","TypeScript","PostgreSQL","Next.js"], rating:4.9, reviews:187, hourlyRate:65, verified:true, topRated:true, location:"United States", completedJobs:234, responseTime:"< 1 hr", level:"Expert", portfolio:["E-Commerce SaaS","Fintech Dashboard","Real-time Chat App"], availability:"available", joinedDate:"Jan 2024", languages:["English","Mandarin"], verificationStatus:"verified" },
  { id:"2", name:"Marcus Rivera", title:"UI/UX Designer", initials:"MR", avatarColor:"from-blue-500 to-cyan-600", bio:"Award-winning designer with a focus on clean, conversion-optimized interfaces. Figma-to-dev handoff specialist.", category:"Design", skills:["Figma","Webflow","Motion Design","Branding","Prototyping"], rating:4.8, reviews:142, hourlyRate:55, verified:true, topRated:true, location:"Spain", completedJobs:179, responseTime:"< 2 hr", level:"Pro", portfolio:["FinApp Redesign","SaaS Onboarding Flow","Brand Identity Kit"], availability:"available", joinedDate:"Feb 2024", languages:["English","Spanish"], verificationStatus:"verified" },
  { id:"3", name:"Aisha Okafor", title:"Digital Marketing Strategist", initials:"AO", avatarColor:"from-amber-500 to-orange-600", bio:"Performance marketing specialist with a proven track record across Google, Meta, and TikTok campaigns.", category:"Marketing", skills:["SEO","Google Ads","Meta Ads","Analytics","Funnel Design"], rating:4.7, reviews:98, hourlyRate:48, verified:true, topRated:false, location:"Nigeria", completedJobs:113, responseTime:"< 3 hr", level:"Pro", portfolio:["3x ROAS Campaign","SEO Traffic 200% Growth","Email Sequence Revamp"], availability:"available", joinedDate:"Mar 2024", languages:["English","Yoruba"], verificationStatus:"verified" },
  { id:"4", name:"Liam O'Brien", title:"Content Writer & Copywriter", initials:"LO", avatarColor:"from-emerald-500 to-teal-600", bio:"B2B and SaaS copywriter specializing in long-form SEO content, landing pages, and email sequences.", category:"Writing", skills:["Copywriting","SEO Writing","Blog Posts","Email","LinkedIn"], rating:4.9, reviews:231, hourlyRate:35, verified:true, topRated:true, location:"Ireland", completedJobs:312, responseTime:"< 1 hr", level:"Expert", portfolio:["SaaS Blog Series (50 articles)","Product Launch Copy","Investor Deck Writing"], availability:"available", joinedDate:"Jan 2024", languages:["English"], verificationStatus:"verified" },
  { id:"5", name:"Yuki Tanaka", title:"AI & Machine Learning Engineer", initials:"YT", avatarColor:"from-sky-500 to-blue-700", bio:"Building production ML systems and LLM-powered products. Expert in RAG pipelines and AI automation.", category:"AI & ML", skills:["Python","TensorFlow","LLMs","RAG Systems","OpenAI API"], rating:5.0, reviews:63, hourlyRate:95, verified:true, topRated:true, location:"Japan", completedJobs:78, responseTime:"< 4 hr", level:"Expert", portfolio:["Custom GPT for Legal","AI Document Processor","Predictive Analytics Engine"], availability:"busy", joinedDate:"Apr 2024", languages:["English","Japanese"], verificationStatus:"verified" },
  { id:"6", name:"Priya Sharma", title:"Video Editor & Animator", initials:"PS", avatarColor:"from-pink-500 to-rose-600", bio:"Cinematic video editing for YouTube, brand ads, and product launches. Motion graphics in After Effects.", category:"Video", skills:["Premiere Pro","After Effects","DaVinci","Motion Graphics","3D"], rating:4.8, reviews:115, hourlyRate:42, verified:true, topRated:false, location:"India", completedJobs:148, responseTime:"< 2 hr", level:"Pro", portfolio:["Brand Ad Reel","YouTube Channel (500K subs)","Product Launch Video"], availability:"available", joinedDate:"May 2024", languages:["English","Hindi"], verificationStatus:"verified" },
  { id:"7", name:"Carlos Mendes", title:"Cybersecurity Consultant", initials:"CM", avatarColor:"from-red-500 to-rose-700", bio:"OSCP-certified pentester with deep expertise in web application security, OWASP, and SOC2 audits.", category:"Cybersecurity", skills:["Pen Testing","OWASP","SOC2","Firewall","SIEM"], rating:4.9, reviews:47, hourlyRate:110, verified:true, topRated:true, location:"Brazil", completedJobs:58, responseTime:"< 6 hr", level:"Expert", portfolio:["Fintech Security Audit","OWASP Top 10 Remediation","SOC2 Certification Guide"], availability:"available", joinedDate:"Feb 2024", languages:["English","Portuguese"], verificationStatus:"verified" },
  { id:"8", name:"Sophie Laurent", title:"Brand Designer", initials:"SL", avatarColor:"from-fuchsia-500 to-purple-600", bio:"Visual identity designer creating memorable logos and brand systems for startups and enterprises.", category:"Design", skills:["Illustrator","Brand Systems","Logo Design","Typography","Print"], rating:4.7, reviews:176, hourlyRate:50, verified:true, topRated:false, location:"France", completedJobs:189, responseTime:"< 2 hr", level:"Pro", portfolio:["Tech Startup Brand Kit","Luxury Packaging Design","Corporate Style Guide"], availability:"away", joinedDate:"Mar 2024", languages:["English","French"], verificationStatus:"verified" },
  { id:"9", name:"Hamza Al-Rashid", title:"Financial Analyst & Advisor", initials:"HA", avatarColor:"from-indigo-500 to-blue-700", bio:"CFA-level financial modeling, business valuation, and CFO advisory for growing startups.", category:"Finance", skills:["Financial Modeling","Excel","Valuation","Forecasting","M&A"], rating:4.8, reviews:88, hourlyRate:70, verified:true, topRated:false, location:"UAE", completedJobs:102, responseTime:"< 4 hr", level:"Pro", portfolio:["Series B Financial Model","SaaS Unit Economics","Investor Report Deck"], availability:"available", joinedDate:"Jan 2024", languages:["English","Arabic"], verificationStatus:"verified" },
  { id:"10", name:"Elena Popescu", title:"Full-Stack Developer", initials:"EP", avatarColor:"from-lime-500 to-green-600", bio:"Next.js and Django specialist focused on high-performance SaaS platforms and API-first architecture.", category:"Development", skills:["Next.js","Django","REST APIs","AWS","Docker"], rating:4.9, reviews:204, hourlyRate:58, verified:true, topRated:true, location:"Romania", completedJobs:267, responseTime:"< 1 hr", level:"Expert", portfolio:["SaaS Multi-tenant App","E-learning Platform","Analytics Dashboard"], availability:"available", joinedDate:"Nov 2023", languages:["English","Romanian"], verificationStatus:"verified" },
  { id:"11", name:"David Kim", title:"Motion Designer", initials:"DK", avatarColor:"from-cyan-500 to-teal-600", bio:"3D motion designer and Lottie animation expert. Known for sleek interface animations and brand storytelling.", category:"Design", skills:["After Effects","Cinema 4D","Lottie","Spline","Blender"], rating:4.6, reviews:91, hourlyRate:60, verified:true, topRated:false, location:"South Korea", completedJobs:124, responseTime:"< 3 hr", level:"Pro", portfolio:["App Onboarding Animation","Product 3D Showcase","Explainer Video"], availability:"available", joinedDate:"Feb 2024", languages:["English","Korean"], verificationStatus:"verified" },
  { id:"12", name:"Nina Kovalev", title:"Technical Translator (RU/EN/DE)", initials:"NK", avatarColor:"from-cyan-400 to-sky-600", bio:"Certified technical translator with 8 years in legal, medical, and software documentation.", category:"Translation", skills:["Russian","English","German","Legal","Medical"], rating:5.0, reviews:137, hourlyRate:28, verified:true, topRated:true, location:"Germany", completedJobs:182, responseTime:"< 2 hr", level:"Expert", portfolio:["Legal Contracts Translation","Medical Trial Docs","Software Localization"], availability:"available", joinedDate:"Dec 2023", languages:["Russian","English","German"], verificationStatus:"verified" },
]

export const JOB_POSTS: JobPost[] = [
  {
    id:"p1", clientName:"Ahmad Farooq", clientInitials:"AF", clientColor:"from-blue-500 to-indigo-600",
    title:"Need an experienced React Developer for Dashboard Project",
    category:"Development", budget:"$800 – $1,500", deadline:"3 weeks",
    description:"We are building a data analytics dashboard using React and a Node.js backend. Looking for someone with strong TypeScript skills and experience with chart libraries like Recharts or Victory. Must be able to work independently and deliver clean, maintainable code.",
    skills:["React","TypeScript","Node.js","Recharts"],
    postedAt:"2 hours ago",
    comments:[
      { id:"c1", freelancerId:"1", freelancerName:"Sarah Chen", freelancerInitials:"SC", freelancerColor:"from-violet-500 to-purple-700", freelancerTitle:"Full-Stack Developer", text:"Hello! I have extensive experience building data dashboards with React and Recharts. I'd love to discuss your project requirements in more detail. My portfolio includes several similar fintech dashboard projects.", postedAt:"1 hour ago", verified:true },
      { id:"c2", freelancerId:"10", freelancerName:"Elena Popescu", freelancerInitials:"EP", freelancerColor:"from-lime-500 to-green-600", freelancerTitle:"Full-Stack Developer", text:"Hi Ahmad, I specialize in exactly this stack — React + Node.js + TypeScript. I've delivered 3 dashboards with Recharts in the past year. Happy to share samples and hop on a quick call to understand the scope.", postedAt:"45 min ago", verified:true },
    ]
  },
  {
    id:"p2", clientName:"Jessica Tran", clientInitials:"JT", clientColor:"from-rose-400 to-pink-600",
    title:"Looking for a Brand Designer — Logo + Full Identity System",
    category:"Design", budget:"$400 – $700", deadline:"2 weeks",
    description:"We are a seed-stage healthtech startup and need a complete brand identity: logo, color palette, typography, business cards, and a basic brand guidelines document. We prefer a modern, clean aesthetic that conveys trust and innovation.",
    skills:["Logo Design","Brand Identity","Illustrator","Typography"],
    postedAt:"5 hours ago",
    comments:[
      { id:"c3", freelancerId:"8", freelancerName:"Sophie Laurent", freelancerInitials:"SL", freelancerColor:"from-fuchsia-500 to-purple-600", freelancerTitle:"Brand Designer", text:"This sounds like a project I'd enjoy. I've worked with 3 health-sector startups on their brand identity. I can deliver a comprehensive brand kit within your timeline and budget. Please review my profile to see relevant portfolio samples.", postedAt:"4 hours ago", verified:true },
    ]
  },
  {
    id:"p3", clientName:"Omar Bilal", clientInitials:"OB", clientColor:"from-emerald-500 to-teal-600",
    title:"SEO Content Writer Needed — 10 Articles per Month (Ongoing)",
    category:"Writing", budget:"$300 – $500/mo", deadline:"Ongoing",
    description:"We run a B2B SaaS blog and need a skilled SEO writer to produce 10 in-depth articles per month (1,500–2,500 words each). Topics are in the HR software niche. Must understand keyword research, internal linking, and proper on-page SEO.",
    skills:["SEO Writing","B2B SaaS","Long-Form Content","Keyword Research"],
    postedAt:"1 day ago",
    comments:[
      { id:"c4", freelancerId:"4", freelancerName:"Liam O'Brien", freelancerInitials:"LO", freelancerColor:"from-emerald-500 to-teal-600", freelancerTitle:"Content Writer & Copywriter", text:"Omar, I've been writing exclusively for B2B SaaS companies for 4 years. I currently manage content for 2 HR software blogs. I understand Ahrefs-based keyword strategy, topical authority clusters, and conversion-focused writing. I'd love to be your long-term content partner.", postedAt:"20 hours ago", verified:true },
    ]
  },
  {
    id:"p4", clientName:"Lin Wei", clientInitials:"LW", clientColor:"from-sky-500 to-blue-600",
    title:"AI Engineer Needed — LLM Integration for Customer Support Bot",
    category:"AI & ML", budget:"$2,000 – $4,000", deadline:"1 month",
    description:"We need a skilled AI engineer to integrate an LLM-based customer support bot into our existing SaaS platform. The bot should handle tier-1 support queries, escalate when needed, and pull from our knowledge base via RAG. Must have experience with OpenAI API or similar.",
    skills:["Python","OpenAI API","RAG","LangChain","FastAPI"],
    postedAt:"3 hours ago",
    comments:[
      { id:"c5", freelancerId:"5", freelancerName:"Yuki Tanaka", freelancerInitials:"YT", freelancerColor:"from-sky-500 to-blue-700", freelancerTitle:"AI & ML Engineer", text:"This is exactly my area of expertise. I've built 3 production RAG systems for customer-facing use cases. I can architect a robust solution with proper fallback logic and escalation paths. Happy to share technical architecture before we begin.", postedAt:"2 hours ago", verified:true },
    ]
  },
]
