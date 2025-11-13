"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  FileText,
  MapPin,
} from "lucide-react";

interface SignupForm {
  owner_name: string;
  email: string;
  password: string;
  confirm_password: string;
  country_code: string;
  mobile: string;
  factory_name: string;
  gstin: string;
  iec: string;
  address: string;
}

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({
    owner_name: "",
    email: "",
    password: "",
    confirm_password: "",
    country_code: "+91",
    mobile: "",
    factory_name: "",
    gstin: "",
    iec: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState("");

  const otpSectionRef = useRef<HTMLDivElement | null>(null);

  // Scroll to OTP section when it's shown
  useEffect(() => {
    if (showOtpSection && otpSectionRef.current) {
      otpSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showOtpSection]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;

    if (target.name === "logo" && target.files?.length) {
      setForm({ ...form });
    } else {
      const { name, value } = target;
      if (name in form) {
        setForm((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  // --- Submit Registration ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      return toast.error("Password and Confirm Password do not match");
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup/`,
        {
          method: "POST",
          body: payload,
        }
      );

      let data: any;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }

      if (!res.ok) {
        const errorMsg =
          typeof data === "string"
            ? data
            : data.detail ||
              data.message ||
              (typeof data === "object" &&
                data !== null &&
                Object.values(data)[0]) ||
              "Signup failed";
        toast.error(errorMsg);
        return;
      }

      toast.success("Signup successful! OTP sent to your email.");
      setShowOtpSection(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(err.message || "Server error during signup");
    } finally {
      setLoading(false);
    }
  };

  // --- Verify OTP ---
  const handleVerifyOtp = async () => {
    if (!form.email) return toast.error("Email required for OTP verification");
    if (otp.length < 6) return toast.error("Enter a valid 6-digit OTP");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, otp }),
        }
      );

      let data: any;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }

      if (!res.ok) {
        const errorMsg =
          typeof data === "string"
            ? data
            : data.message || data.detail || "OTP verification failed";
        toast.error(errorMsg);
        return;
      }

      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      }

      toast.success("OTP verified! Redirecting to Login...");
      router.push("/login");
    } catch (err: any) {
      console.error("OTP verify error:", err);
      toast.error(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-inter p-4"
      style={{ backgroundImage: "url('/icons/screen.png')" }}
    >
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row transform hover:scale-[1.01] transition-transform duration-300">
        {/* Left Banner */}
        <div className="hidden lg:flex lg:w-1/3 p-8 text-white bg-gradient-to-b from-[#26696D] to-[#368A8D] flex-col justify-center items-center backdrop-blur-sm">
          <svg
            className="w-20 h-20 text-white mb-6"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </svg>
          <h2 className="text-3xl font-bold text-center">
            Industrial Registration Portal
          </h2>
          <p className="text-sm text-center mt-2 opacity-80">
            Secure your manufacturing account in minutes.
          </p>
        </div>

        {/* Form Section */}
        <div className="lg:w-2/3 p-8 md:p-12 bg-white/95 backdrop-blur-sm">
          <h1 className="text-3xl font-extrabold text-center text-[#26696D] mb-8 border-b pb-4">
            Sign Up
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Owner Name */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="owner_name"
                type="text"
                placeholder="Full Name"
                value={form.owner_name}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="confirm_password"
                type="password"
                placeholder="Confirm Password"
                value={form.confirm_password}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
                required
              />
            </div>

            {/* Mobile */}
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="mobile"
                type="text"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
                required
              />
            </div>

            {/* Factory Name */}
            <div className="relative">
              <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="factory_name"
                type="text"
                placeholder="Factory Name"
                value={form.factory_name}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
                required
              />
            </div>

            {/* GSTIN */}
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="gstin"
                type="text"
                placeholder="GSTIN"
                value={form.gstin}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
              />
            </div>

            {/* IEC */}
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                name="iec"
                type="text"
                placeholder="IEC"
                value={form.iec}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <textarea
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="pl-10 border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-[#26696D] focus:border-[#26696D] w-full h-15 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                disabled={loading || showOtpSection}
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </form>

          {/* OTP Section */}
          {showOtpSection && (
            <div
              ref={otpSectionRef}
              className="mt-8 border-t border-gray-200 pt-6"
            >
              <h3 className="font-bold text-xl text-gray-700 mb-3">
                🔐 OTP Verification
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter the OTP sent to your registered email (
                <span className="font-semibold text-[#26696D]">
                  {form.email}
                </span>
                ).
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  type="text"
                  className="border border-gray-300 p-3 rounded-lg flex-grow focus:ring-[#26696D] focus:border-[#26696D] transition duration-150 text-center tracking-widest text-lg font-mono"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="flex-shrink-0 px-6 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || otp.length < 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
