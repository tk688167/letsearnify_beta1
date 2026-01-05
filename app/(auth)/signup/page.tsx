"use client"

import { registerUser } from "@/lib/register"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Client-side validation for simple fields if needed
    // Server action handles main logic
    const res = await registerUser(formData)
    
    if (res?.error) {
      setError(res.error)
    } else {
      router.push("/login?signup=success")
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
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-xl shadow-blue-900/5">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign Up</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Full Name</label>
          <input name="name" type="text" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required placeholder="John Doe" />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input name="email" type="email" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required placeholder="name@example.com" />
        </div>

        {/* Country */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Country</label>
          <select name="country" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white" required>
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
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full p-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              minLength={8}
              placeholder="Min 8 characters"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Referral Code (Optional) */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">
             Referral Code <span className="text-gray-400 text-sm font-normal">(Optional)</span>
          </label>
          <input 
             name="referralCode" 
             type="text" 
             className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase placeholder:normal-case" 
             placeholder="Enter referral code (optional)" 
          />
          <p className="mt-1 text-xs text-gray-500">
             Leave blank to be assigned to the company by default.
          </p>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-500/20 mb-4">
          Sign Up
        </button>

         {/* Divider */}
         <div className="relative flex items-center justify-center mb-4">
             <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-200"></div>
             </div>
             <div className="relative bg-white px-4 text-sm text-gray-500">Or continue with</div>
         </div>

         {/* Google Signup */}
         <button 
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm"
         >
             {isGoogleLoading ? (
                 <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
             ) : (
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
             )}
             Sign up with Google
         </button>
        
        <p className="mt-6 text-center text-sm text-gray-500">
           Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  )
}
