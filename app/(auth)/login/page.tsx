"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-xl shadow-blue-900/5">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input name="email" type="email" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required placeholder="you@example.com" />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full p-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              placeholder="••••••••"
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
        
        <div className="flex justify-end mb-6">
          <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-500/20">
          Login
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
           Don't have an account? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  )
}
