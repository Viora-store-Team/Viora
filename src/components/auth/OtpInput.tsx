"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({
  value = "",
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Extract only digits
    const cleaned = val.replace(/\D/g, "");

    if (!cleaned) {
      // Clear current digit
      const nextDigits = [...digits];
      nextDigits[index] = "";
      onChange(nextDigits.join(""));
      return;
    }

    if (cleaned.length > 1) {
      // Pasting multi-digit code
      const pasted = cleaned.slice(0, length);
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      if (inputsRef.current[nextIndex]) {
        inputsRef.current[nextIndex]?.focus();
      }
      return;
    }

    // Single digit input
    const nextDigits = [...digits];
    nextDigits[index] = cleaned[0];
    const newValue = nextDigits.join("");
    onChange(newValue);

    // Focus next input box
    if (index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0 && inputsRef.current[index - 1]) {
        // Move to previous input on backspace if current is empty
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === "ArrowRight" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length, length - 1);
      if (inputsRef.current[targetIndex]) {
        inputsRef.current[targetIndex]?.focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 dir-ltr">
      {Array.from({ length }).map((_, idx) => {
        const char = digits[idx] || "";
        const isFilled = Boolean(char);

        return (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`size-11 sm:size-13 rounded-2xl border text-center text-xl font-black transition-all outline-none ${
              isFilled
                ? "border-[#7d1d29] bg-[#fdf0f2] text-[#7d1d29] shadow-xs"
                : "border-[#ede5da] bg-[#faf7f2] text-[#1e1b18] hover:border-[#7d1d29]/40 focus:border-[#7d1d29] focus:bg-white focus:ring-4 focus:ring-[#7d1d29]/10"
            } disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
}
