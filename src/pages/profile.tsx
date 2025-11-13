"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Building2,
  FileText,
  Hash,
  Phone,
  MapPin,
  Save,
  User,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // ✅ Check token and fetch profile
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/me/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 401) {
          setIsAuthenticated(false);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data.profile || data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Redirect unauthenticated users
  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/update/${profile.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }
      );

      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully!");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: "url('/icons/screen.png')",
      }}
    >
      <Toaster position="top-center" />
      <div className="absolute inset-0 bg-[#cde3e1]/70 backdrop-blur-[2px]" />

      {/* Profile Card */}
      <div
        className="relative z-10 w-full max-w-xl bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-md bg-cover bg-center"
        style={{
          backgroundImage: "url('/icons/card-bg.png')",
        }}
      >
    
        <h1 className="text-3xl font-bold text-[#26696D] text-center mb-6 border-b pb-3 flex items-center justify-center gap-2">
          <User className="w-7 h-7 text-[#26696D]" />
          My Profile
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-6"
        >
          {/* Factory Name */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-1">
              Factory Name
            </label>
            <div className="flex items-center border rounded-xl px-3 py-3 bg-gray-50 shadow-sm">
              <Building2 className="text-[#26696D] mr-3 w-5 h-5" />
              <input
                type="text"
                name="factory_name"
                value={profile?.factory_name || ""}
                onChange={handleChange}
                className="w-full  bg-transparent outline-none text-gray-800 placeholder-gray-400"
                placeholder="Enter your factory name"
              />
            </div>
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-1">
              GSTIN
            </label>
            <div className="flex items-center border rounded-xl px-3 py-3 bg-gray-50 shadow-sm">
              <FileText className="text-[#26696D] mr-3 w-5 h-5" />
              <input
                type="text"
                name="gstin"
                value={profile?.gstin || ""}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                placeholder="Enter your GSTIN"
              />
            </div>
          </div>

          {/* IEC Code */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-1">
              IEC Code
            </label>
            <div className="flex items-center border rounded-xl px-3 py-3 bg-gray-50 shadow-sm">
              <Hash className="text-[#26696D] mr-3 w-5 h-5" />
              <input
                type="text"
                name="iec"
                value={profile?.iec || ""}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                placeholder="Enter your IEC Code"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-1">
              Mobile Number
            </label>
            <div className="flex items-center border rounded-xl px-3 py-3 bg-gray-50 shadow-sm">
              <Phone className="text-[#26696D] mr-3 w-5 h-5" />
              <input
                type="text"
                name="mobile"
                value={profile?.mobile || ""}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                placeholder="Enter your mobile number"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-1">
              Address
            </label>
            <div className="flex items-start border rounded-xl px-3 py-2 bg-gray-50 shadow-sm">
              <MapPin className="text-[#26696D] mr-3 w-5 h-5 mt-1" />
              <textarea
                name="address"
                rows={3}
                value={profile?.address || ""}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 resize-none"
                placeholder="Enter your address"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full mt-4 flex items-center justify-center gap-2 font-semibold text-white py-3 rounded-xl shadow-md transition-all duration-200 ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-b from-[#26696D] to-[#368A8D] hover:scale-[1.02]"
            }`}
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
