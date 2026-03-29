HTML File Structure & Context (C:\Users\Ebad Computer\Desktop\letsearnify_beta1\available_demo_html)
This document provides a detailed breakdown of each HTML file in the Let'sEarnify platform, outlining its specific purpose, core sections, and functionality.

1. Public & Entry Pages
   index.html
   (Landing Page)
   Purpose: The public face of the platform. It serves to convert visitors into users by explaining the "Hybrid Business Model".
   Key Sections:
   Hero Section: "Turn $1 into Opportunities" headline.
   Features Grid: Introduces the 4 Pillars (Referrals, Tasks, Investments, Marketplace).
   Auth Checks: Contains inline script to redirect authenticated users (earnify_auth_status) to
   dashboard.html
   .
   Mobile Menu: Responsive navigation toggle.
   about.html
   (About Us)
   Purpose: Explains the platform's vision, ecosystem, and core values.
   Key Sections:
   Mission Statement: Redefining digital finance.
   Ecosystem Grid: Describes the Wallet, Task Center, Marketplace, and Mudarba Pool.
   Values: Security First, Community, Integrity.
   Access: Protected page (redirects to
   index.html
   if not logged in).
   faq.html
   (Knowledge Base)
   Purpose: Addresses common user questions to reduce support tickets.
   Key Sections:
   Categories: General, Earning & Investment, Security & Support.
   Content: Explains mechanics like the "Hybrid" model, Mudaraba profit sharing, and data security.
   UI: Accordion-style expandable questions.
2. Core Application Pages
   dashboard.html
   (User Command Center)
   Purpose: The central hub for authenticated users. It aggregates all platform features and prompts users to unlock full access.
   Key Sections:
   $1 Hook Section: Prominent call-to-action to deposit $1 to unlock features.
   Main Navigation: Links to Referrals, Tasks, Investments, Marketplace, and Settings.
   Company Pools: Displays CBSP, Emergency, Royalty, and Reward pools.
   Earnings Simulation: Dynamic counters for Task, Watch, and Investment earnings.
   tasks.html
   (Task Center)
   Purpose: Lists available micro-tasks for active earning.
   Key Sections:
   Filter Bar: Categories for Social Media, Surveys, App Testing, etc.
   Task Grid: Individual cards showing task requirements (e.g., "Follow on Twitter"), reward amount, and difficulty.
   Functionality: Simulates task "Starting" and "Completion" states via
   script.js
   .
   investments.html
   (Mudaraba Pools)
   Purpose: Interface for passive investment opportunities.
   Key Sections:
   Hero: "Ethical Growth Portfolios" banner.
   Opportunity Cards: Real Estate, Tech VC, and SME Growth options with ROI and Funding % details.
   Portfolio Viewer: Table/Section intended to show active user investments.
   marketplace.html
   (Micro-Services)
   Purpose: A freelance gig marketplace similar to Fiverr, but for micro-skills.
   Key Sections:
   Category Navigator: Scrollable list (Graphics, Marketing, Writing, etc.).
   Gig Cards: Listings with "Starting At" prices, user ratings, and service descriptions.
3. User Management & Utilities
   profile.html
   (User Profile)
   Purpose: personalized view of the user's identity and achievements.
   Key Sections:
   Hero: User avatar, join date, and "Verified Member" badge.
   Wallet Overview: Mini-view of Available and Pending balance.
   Referral Stats: Summary of network size and earnings.
   Achievements: Badge system (Verified, Locked tiers).
   Activity Feed: List of recent user actions.
   referrals.html
   (Affiliate Dashboard)
   Purpose: Dedicated page for managing the referral network and accessing the unique invite link.
   Key Sections:
   Invite Box: Copyable referral link (.../invite/u/demo_user_01).
   Stats Grid: Total Referrals, Active Users, Total Earned.
   Social Share: Quick links for Telegram, WhatsApp, Twitter, Facebook.
   History Table: List of referred users and their status.
   settings.html
   (Account Configuration)
   Purpose: Allows users to manage security, preferences, and privacy.
   Key Sections:
   Account Info: Read-only fields for Name/Email (simulated).
   Security: Toggle for 2FA and Password Change.
   Privacy: Toggles for Profile Visibility and Stat Sharing.
   Wallet Preview: Quick look at total balance within settings.
   support.html
   (Customer Service)
   Purpose: Methods for users to get help.
   Key Sections:
   Troubleshooting: Embedded "Login & Signup Issues" accordion.
   Access: Instructions for KYC and Withdrawals.
   Ticket Form: Input fields for submitting support requests.
   Contact Info: Email, Phone, and Telegram details.
