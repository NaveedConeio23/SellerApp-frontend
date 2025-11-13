"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || data.message || "Login failed");
        return;
      }

      const tokens = data.tokens || {};
      const accessToken = tokens.access;
      const refreshToken = tokens.refresh;

      if (!accessToken || !refreshToken) {
        throw new Error("Missing access or refresh token in response.");
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/me/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!userRes.ok) {
        toast.error("Failed to fetch user info");
        return;
      }

      const user = await userRes.json();
      const userId = user.id;
      localStorage.setItem("user_id", userId);

      const statusRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/status/${userId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!statusRes.ok) {
        toast.success("Login successful! Please upload your documents.");
        setTimeout(() => router.push("/upload"), 1000);
        return;
      }

      const seller = await statusRes.json();
      const status = seller.status;

      if (status === "approved") {
        toast.success("Welcome back! Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 1200);
      } else if (status === "pending") {
        toast("Your documents are under review.", { icon: "🕒" });
        setTimeout(() => router.push("/status"), 1200);
      } else if (status === "rejected") {
        if (seller.admin_comment)
          localStorage.setItem("admin_comment", seller.admin_comment);
        setTimeout(() => router.push("/upload"), 300);
      } else {
        toast.success("Please upload your documents.");
        setTimeout(() => router.push("/upload"), 1200);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Server error during login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast.error("Please enter your email to reset password");
      return;
    }
    router.push(`/forgot-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/icons/screen.png')" }}
    >
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row transform hover:scale-[1.01] transition-transform duration-300">
        {/* Left Banner */}
        <div className="hidden lg:flex lg:w-1/3 p-8 text-white bg-gradient-to-b from-[#26696D] to-[#368A8D] flex-col justify-center items-center backdrop-blur-sm">
          <svg
            className="w-10 h-10 text-white mb-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" x2="3" y1="12" y2="12" />
          </svg>
          <h2 className="text-3xl font-bold text-center">Coneio Seller</h2>
        </div>

        {/* Login Form */}
        <div className="lg:w-2/3 p-8 md:p-12 bg-white/95 backdrop-blur-sm">
          <h1 className="text-3xl font-extrabold text-center text-[#26696D] mb-8 border-b pb-4">
            Login
          </h1>

          <form onSubmit={handleLogin} className="grid grid-cols-1 gap-4">
            <div className="relative">
              <Mail className="absolute left-3 top-4 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Email"
                className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-[#26696D] focus:border-[#26696D]"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-4 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-[#26696D] focus:border-[#26696D]"
                required
              />
            </div>

            <p
              onClick={handleForgotPassword}
              className="text-right text-[#26696D] font-semibold cursor-pointer hover:underline"
            >
              Forgot Password?
            </p>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
