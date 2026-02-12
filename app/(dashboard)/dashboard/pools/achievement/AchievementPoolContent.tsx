"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  GiftIcon,
  ArrowLeftIcon,
  SparklesIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  HomeIcon,
  RocketLaunchIcon,
  StarIcon
} from "@heroicons/react/24/outline"

export default function AchievementPoolContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Back Button */}
      <Link 
        href="/dashboard/pools" 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Pools
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
              <GiftIcon className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2">Achievement Pool</h1>
              <p className="text-blue-100 text-lg font-medium">Celebrate Your Growth with Special Rewards</p>
            </div>
          </div>
          <p className="text-blue-50 leading-relaxed max-w-3xl text-lg">
            Unlock exclusive rewards when you achieve important milestones on your LetsEarnify journey. Every step forward is worth celebrating!
          </p>
        </div>
      </motion.div>

      {/* Your First Achievement */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your First Achievement: Newbie to Bronze</h2>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-10 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <RocketLaunchIcon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Special Surprise Reward</h3>
          </div>

          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            When you upgrade from <strong className="text-blue-900">Newbie to Bronze tier</strong>, you become eligible for a <strong className="text-blue-900">Special Surprise Reward</strong>! This is our way of celebrating your first major achievement on the platform.
          </p>

          <div className="bg-white rounded-xl p-6 border border-blue-200">
            <p className="text-gray-600 leading-relaxed">
              This reward marks the beginning of your growth journey with LetsEarnify. It's a token of appreciation for taking action and reaching your first milestone. Every achievement counts, and we believe in rewarding progress!
            </p>
          </div>
        </div>
      </section>

      {/* What Can You Receive? */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What Can You Receive?</h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          Your Special Surprise Reward can take different forms. The reward type is determined by the platform and may include any of the following:
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* ARN Tokens */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
              <CurrencyDollarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ARN Tokens</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive bonus ARN tokens directly to your wallet, ready to use or withdraw immediately.
            </p>
          </div>

          {/* Digital Surprise */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Digital Surprise Reward</h3>
            <p className="text-gray-600 leading-relaxed">
              Get access to exclusive digital perks, bonuses, or special platform benefits.
            </p>
          </div>

          {/* Physical Gift Hamper */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Physical Gift Hamper</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive a carefully curated gift hamper delivered directly to your home address.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-gray-700 leading-relaxed">
            <strong className="text-blue-900">Please note:</strong> The type of reward you receive will be determined by the platform. All rewards are designed to celebrate your achievement and motivate your continued growth!
          </p>
        </div>
      </section>

      {/* How to Qualify */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrophyIcon className="w-7 h-7 text-blue-600" />
          How to Qualify for Your First Reward
        </h3>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Start as a Newbie
            </h4>
            <p className="text-gray-700 leading-relaxed pl-9">
              When you join LetsEarnify, you begin at the Newbie tier. This is your starting point on the platform.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Meet Bronze Tier Requirements
            </h4>
            <p className="text-gray-700 leading-relaxed pl-9">
              Complete the requirements to upgrade to Bronze tier by earning points, making deposits, and building your network.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-lg">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Unlock Your Surprise Reward
            </h4>
            <p className="text-gray-700 leading-relaxed pl-9">
              Once you successfully upgrade to Bronze, you become eligible for your Special Surprise Reward. The platform will determine and deliver your reward!
            </p>
          </div>
        </div>
      </section>

      {/* Motivational Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <StarIcon className="w-9 h-9 text-white" />
          </div>
          
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Ready to Unlock Your First Achievement?
          </h3>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Upgrade from Newbie to Bronze tier today and receive your Special Surprise Reward. Every journey begins with a single step—take yours now!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard/tiers" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <TrophyIcon className="w-5 h-5" />
              View Tier Progress
            </Link>
            <Link 
              href="/dashboard/wallet?tab=deposit" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              <CurrencyDollarIcon className="w-5 h-5" />
              Make a Deposit
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Note */}
      <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p className="text-gray-600 leading-relaxed text-center">
          <strong className="text-gray-900">Remember:</strong> This is just the beginning! As you continue growing on LetsEarnify, more achievement milestones and rewards will become available at higher tier levels. Keep progressing, keep achieving!
        </p>
      </section>
    </div>
  )
}
