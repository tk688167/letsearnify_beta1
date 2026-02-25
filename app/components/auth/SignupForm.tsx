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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }
    
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
    <div className={`relative ${isModal ? "" : "py-6 px-4 sm:py-8 sm:px-10 sm:rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl"}`}>
      {/* Background Glow Effect */}
      {!isModal && (
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-amber-500/20 -z-10 blur-xl opacity-50 pointer-events-none"></div>
      )}
      
      {error && (
         <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-destructive rounded-full shrink-0" />
             {error}
         </div>
      )}

      <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
        
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-foreground mb-1">
            Full Name
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="block w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-3 border border-input bg-background rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground text-xs sm:text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-foreground mb-1">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              className="block w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-3 border border-input bg-background rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground text-xs sm:text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-xs sm:text-sm font-bold text-foreground mb-1">
            Country
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <select 
                id="country"
                name="country" 
                className="block w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-9 sm:pr-10 border border-input bg-background rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground text-xs sm:text-sm transition-all outline-none appearance-none" 
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
                 <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
            </div>
          </div>
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-foreground mb-1">
              Password
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Min 8 chars"
                minLength={8}
                className="block w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-9 sm:pr-10 border border-input bg-background rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground text-xs sm:text-sm transition-all outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-bold text-foreground mb-1">
              Confirm Password
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Confirm"
                minLength={8}
                className="block w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-9 sm:pr-10 border border-input bg-background rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground text-xs sm:text-sm transition-all outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Referral */}
        <div>
          <label htmlFor="referralCode" className="block text-xs sm:text-sm font-bold text-foreground mb-1">
             Referral Code <span className="text-muted-foreground font-normal text-[10px] sm:text-xs"> (optional)</span>
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              defaultValue={referralCode}
              placeholder="Enter code"
              className="block w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-3 border border-input bg-background rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground text-xs sm:text-sm transition-all outline-none uppercase placeholder:normal-case"
            />
          </div>
        </div>

        <div className="pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={loading || isGoogleLoading}
            className="group relative w-full flex justify-center items-center py-2.5 sm:py-3.5 px-4 h-11 sm:h-[52px] border border-transparent rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20 text-[13px] sm:text-base font-bold text-primary-foreground bg-primary hover:bg-primary/95 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_forwards]"></div>
            {loading ? (
                <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <span className="flex items-center gap-1 sm:gap-1.5 leading-none">
                  <span>Create Account</span>
                  <span className="text-primary-foreground/90 font-semibold">• Activate $1</span>
                </span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
             <button 
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || loading}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-card text-foreground border-2 border-border p-3 h-10 sm:h-11 rounded-xl hover:bg-muted/50 hover:border-primary/20 transition text-xs sm:text-sm font-bold shadow-sm"
             >
                 {isGoogleLoading ? (
                     <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                 ) : (
                     <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
                 )}
                 Sign up with Google
             </button>
        </div>
      </div>

      {!isModal && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:text-primary/80 hover:underline">
               Sign in
            </Link>
        </p>
      )}
    </div>
  )
}
