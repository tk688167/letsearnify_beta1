"use client";

import { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
  value?: string; // Allow controlling it from parent if needed, but inner state is main driver here
}

export default function OTPInput({ length = 6, onChange }: OTPInputProps) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      // Take the last character if user somehow types more
      newOtp[index] = value.slice(-1); 
      setOtp(newOtp);
      onChange(newOtp.join(""));

      // Auto focus next box if value is entered
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length).split("");
    if (pastedData.every((char) => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((val, i) => {
        newOtp[i] = val;
      });
      setOtp(newOtp);
      onChange(newOtp.join(""));
      // Focus the last filled element
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {otp.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          ref={(el) => { inputRefs.current[idx] = el; }}
          className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm"
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
