"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Mail, Lock, Key } from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Request OTP
  // -----------------------------
  const requestOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent to your email!");
      setStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Verify OTP
  // -----------------------------
  const verifyOtp = async () => {
    if (!email || !otp) return toast.error("Enter email & OTP");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-reset-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "OTP verification failed");
        return;
      }

      toast.success("OTP verified! Set your new password.");
      setStep("reset");
    } catch (err: any) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Reset Password
  // -----------------------------
  const resetPassword = async () => {
    if (!password || !confirmPassword) return toast.error("Enter new password");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Password reset failed");
        return;
      }

      toast.success("Password updated! Redirecting to login...");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/icons/screen.png')" }}
    >
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row transform hover:scale-[1.01] transition-transform duration-300">
        {/* Left Banner */}
        <div className="hidden lg:flex lg:w-1/3 p-8 text-white bg-gradient-to-b from-[#26696D] to-[#368A8D] flex-col justify-center items-center backdrop-blur-sm">
          <Key className="w-20 h-20 mb-4" />
          <h2 className="text-3xl font-bold text-center">Coneio Seller Portal</h2>
        </div>

        {/* Form Section */}
        <div className="lg:w-2/3 p-8 md:p-12 bg-white/95 backdrop-blur-sm">
          <h1 className="text-3xl font-extrabold text-center text-[#26696D] mb-8 border-b pb-4">
            Forgot Password
          </h1>

          {/* Step 1: Request OTP */}
          {step === "request" && (
            <form onSubmit={requestOtp} className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-4 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-[#26696D] focus:border-[#26696D] transition duration-150"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === "verify" && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={otp}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-[#26696D] focus:border-[#26696D] transition duration-150"
              />
              <button
                onClick={verifyOtp}
                className="w-full px-6 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                disabled={loading || otp.length < 6}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-4 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="New Password"
                  className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-[#26696D] focus:border-[#26696D] transition duration-150"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-4 text-gray-400" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-[#26696D] focus:border-[#26696D] transition duration-150"
                />
              </div>
              <button
                onClick={resetPassword}
                className="w-full px-6 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
