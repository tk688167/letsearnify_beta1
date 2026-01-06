"use client"

import { registerUser } from "@/lib/register"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, GlobeAltIcon, LockClosedIcon, TagIcon } from "@heroicons/react/24/outline"
import { signIn } from "next-auth/react"

interface SignupFormProps {
  referralCode?: string
  isModal?: boolean
}

export default function SignupForm({ referralCode = "", isModal = false }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    
    try {
        const res = await registerUser(formData)
        
        if (res?.error) {
          setError(res.error)
          setLoading(false)
        } else {
          // If in a modal or standalone, we usually redirect to login or dashboard
          // The actions.ts/registerUser usually handles creation.
          router.push("/login?signup=success")
        }
    } catch (err) {
        setError("An unexpected error occurred during registration")
        setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
      setIsGoogleLoading(true);
      try {
          // Capture referral code if entered
          const referralInput = document.querySelector('input[name="referralCode"]') as HTMLInputElement;
          if (referralInput?.value) {
              document.cookie = `referral_code=${referralInput.value}; path=/; max-age=3600`;
          }
          
          await signIn("google", { callbackUrl: "/dashboard" });
      } catch (err) {
          console.error("Google Signup Failed", err);
          setIsGoogleLoading(false);
          setError("Google sign-in failed. Please try again.")
      }
  }

  return (
    <div className={`bg-white ${isModal ? "" : "py-8 px-4 shadow-xl shadow-blue-900/5 sm:rounded-2xl sm:px-10 border border-gray-100"}`}>
      
      {error && (
         <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
             <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
             {error}
         </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="block w-full h-11 pl-10 pr-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 sm:text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              className="block w-full h-11 pl-10 pr-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 sm:text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-bold text-gray-700 mb-1">
            Country
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GlobeAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <select 
                id="country"
                name="country" 
                className="block w-full h-11 pl-10 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white sm:text-sm transition-all outline-none appearance-none" 
                required
            >
                <option value="">Select your country</option>
                <option value="AF">Afghanistan</option>
                <option value="AL">Albania</option>
                <option value="DZ">Algeria</option>
                <option value="AD">Andorra</option>
                <option value="AO">Angola</option>
                <option value="AR">Argentina</option>
                <option value="AM">Armenia</option>
                <option value="AU">Australia</option>
                <option value="AT">Austria</option>
                <option value="AZ">Azerbaijan</option>
                <option value="BH">Bahrain</option>
                <option value="BD">Bangladesh</option>
                <option value="BE">Belgium</option>
                <option value="BR">Brazil</option>
                <option value="BG">Bulgaria</option>
                <option value="CA">Canada</option>
                <option value="CL">Chile</option>
                <option value="CN">China</option>
                <option value="CO">Colombia</option>
                <option value="HR">Croatia</option>
                <option value="CY">Cyprus</option>
                <option value="CZ">Czech Republic</option>
                <option value="DK">Denmark</option>
                <option value="EG">Egypt</option>
                <option value="EE">Estonia</option>
                <option value="FI">Finland</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="GR">Greece</option>
                <option value="HK">Hong Kong</option>
                <option value="HU">Hungary</option>
                <option value="IS">Iceland</option>
                <option value="IN">India</option>
                <option value="ID">Indonesia</option>
                <option value="IR">Iran</option>
                <option value="IQ">Iraq</option>
                <option value="IE">Ireland</option>
                <option value="IT">Italy</option>
                <option value="JP">Japan</option>
                <option value="JO">Jordan</option>
                <option value="KZ">Kazakhstan</option>
                <option value="KW">Kuwait</option>
                <option value="LB">Lebanon</option>
                <option value="MY">Malaysia</option>
                <option value="MX">Mexico</option>
                <option value="MA">Morocco</option>
                <option value="NL">Netherlands</option>
                <option value="NZ">New Zealand</option>
                <option value="NO">Norway</option>
                <option value="OM">Oman</option>
                <option value="PK">Pakistan</option>
                <option value="PS">Palestine</option>
                <option value="PH">Philippines</option>
                <option value="PL">Poland</option>
                <option value="PT">Portugal</option>
                <option value="QA">Qatar</option>
                <option value="RO">Romania</option>
                <option value="RU">Russia</option>
                <option value="SA">Saudi Arabia</option>
                <option value="SG">Singapore</option>
                <option value="ZA">South Africa</option>
                <option value="KR">South Korea</option>
                <option value="ES">Spain</option>
                <option value="LK">Sri Lanka</option>
                <option value="SE">Sweden</option>
                <option value="CH">Switzerland</option>
                <option value="TH">Thailand</option>
                <option value="TR">Turkey</option>
                <option value="UA">Ukraine</option>
                <option value="AE">United Arab Emirates</option>
                <option value="UK">United Kingdom</option>
                <option value="US">United States</option>
                <option value="VN">Vietnam</option>
                <option value="YE">Yemen</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                 <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
            Password
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Min 8 characters"
              minLength={8}
              className="block w-full h-11 pl-10 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 sm:text-sm transition-all outline-none"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Referral */}
        <div>
          <label htmlFor="referralCode" className="block text-sm font-bold text-gray-700 mb-1">
             Referral Code <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TagIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              defaultValue={referralCode}
              placeholder="Enter code"
              className="block w-full h-11 pl-10 pr-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 sm:text-sm transition-all outline-none uppercase placeholder:normal-case"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || isGoogleLoading}
            className="w-full flex justify-center py-3 px-4 h-11 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                "Create Account"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
             <button 
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border-2 border-gray-100 p-3 h-11 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition font-bold shadow-sm"
             >
                 {isGoogleLoading ? (
                     <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                 ) : (
                     <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                 )}
                 Sign up with Google
             </button>
        </div>
      </div>

      {!isModal && (
        <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
               Sign in
            </Link>
        </p>
      )}
    </div>
  )
}
