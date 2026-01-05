"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, EnvelopeIcon, KeyIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Clear states when step changes to ensure clean inputs
  useEffect(() => {
    if (step === 2) {
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [step]);

  const requestOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      
      setMessage({ text: "Check your email for the OTP code.", type: 'success' });
      setStep(2);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
        setMessage({ text: "Passwords do not match", type: 'error' });
        return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setMessage({ text: "Your password has been reset successfully.", type: 'success' });
      setStep(3); // Success State
      
      // Clear sensitive fields
      setOtp(""); 
      setNewPassword(""); 
      setConfirmPassword("");

    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <h2 className="mt-6 text-center text-3xl font-serif font-bold text-gray-900">
             Reset Password
         </h2>
         <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 && "Enter your email to receive a verification code."}
            {step === 2 && "Enter the OTP sent to your email."}
            {step === 3 && "You can now login with your new password."}
         </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {message && (
             <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                 {message.type === 'success' ? (
                    <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                 ) : (
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                 )}
                 {message.text}
             </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 px-3 py-3 h-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="you@example.com"
                    />
                </div>
              </div>

              <button
                onClick={requestOtp}
                disabled={loading || !email}
                className="w-full flex justify-center items-center py-3 px-4 h-12 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">OTP Code</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="appearance-none block w-full pl-10 px-3 py-3 h-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base tracking-[0.2em] font-mono"
                      placeholder="000000"
                      maxLength={6}
                      autoComplete="off"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500 text-right">Enter the 6-digit code sent to your email</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-10 px-3 py-3 h-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-10 px-3 py-3 h-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                     <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                </div>
              </div>

               <button
                onClick={resetPassword}
                disabled={loading || otp.length < 6 || !newPassword || !confirmPassword}
                className="w-full flex justify-center items-center py-3 px-4 h-12 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
          
          {step === 3 && (
              <div className="text-center py-4 animate-in zoom-in duration-300">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                      <LockClosedIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">Password Changed!</h3>
                  <p className="text-base text-gray-500 mb-8">
                      Your password has been successfully updated. You can now login with your new credentials.
                  </p>
                  <Link href="/login" className="w-full flex justify-center items-center py-3 px-4 h-12 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]">
                      Back to Login
                  </Link>
              </div>
          )}

          {step !== 3 && (
            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                        Remember your password?
                    </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Link href="/login" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 p-2">
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
