"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadCloud, FileText, CheckCircle2, XCircle, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface UploadedFile {
  key: string;
  label: string;
  file: File | null;
}

// 🔄 Refresh Access Token Helper
async function refreshAccessToken(router: any) {
  const refreshToken = typeof window !== "undefined"
    ? localStorage.getItem("refresh_token")
    : null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!refreshToken) {
    router.replace("/login");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.replace("/login");
      return null;
    }

    const data = await res.json();
    const newAccessToken =
      data.tokens?.access || data.access || data.access_token;

    if (newAccessToken) {
      localStorage.setItem("access_token", newAccessToken);
      return newAccessToken;
    }

    return null;
  } catch {
    router.replace("/login");
    return null;
  }
}

export default function UploadDocs() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { key: "Business License", label: "Business License", file: null },
    { key: "GST Certificate", label: "GST Certificate", file: null },
    { key: "IEC Document", label: "IEC Document", file: null },
    { key: "Cancelled Cheque", label: "Cancelled Cheque", file: null },
    { key: "Factory Photo", label: "Factory Photo", file: null },
  ]);

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => setIsClient(true), []);

  // 🧠 Token retrieval
  useEffect(() => {
    if (!isClient) return;

    const urlToken = searchParams.get("accessToken");
    const storedToken = localStorage.getItem("access_token");

    if (urlToken) {
      localStorage.setItem("access_token", urlToken);
      setToken(urlToken);
      router.replace(window.location.pathname);
    } else if (storedToken) {
      setToken(storedToken);
    } else {
      router.replace("/login");
    }
  }, [isClient, router, searchParams]);

  // 💬 Load rejection reason
  useEffect(() => {
    if (!isClient) return;

    const comment = localStorage.getItem("admin_comment");
    if (comment) {
      setAdminComment(comment);
      localStorage.removeItem("admin_comment");
    }
  }, [isClient]);

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...files];
    updated[index].file = file;
    setFiles(updated);
  };

  // 🟡 Update backend status to Pending
  const updateStatusToPending = async (uploadToken: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/update-status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uploadToken}`,
          },
          body: JSON.stringify({ status: "pending" }),
        }
      );
      if (res.ok) localStorage.setItem("seller_status", "pending");
    } catch (err) {
      console.error("⚠️ Failed to update status:", err);
    }
  };

  // 📤 Core Upload Function
  const executeUpload = async (uploadToken: string) => {
    const formData = new FormData();
    files.forEach((f) => f.file && formData.append(f.key, f.file));

    const missing = files.filter((f) => !f.file);
    if (missing.length > 0) {
      toast.error("Please upload all required documents before submitting.");
      return null;
    }

    try {
      return await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/upload-doc/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${uploadToken}` },
          body: formData,
        }
      );
    } catch {
      return null;
    }
  };

  // 🚀 Upload Handler
  const handleUpload = async () => {
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    let currentToken = token;

    try {
      let res = await executeUpload(currentToken);

      if (!res || res.status === 401) {
        const newToken = await refreshAccessToken(router);
        if (!newToken) return;

        currentToken = newToken;
        setToken(newToken);

        res = await executeUpload(currentToken);
      }

      // ❗ THIS WAS THE ERROR LINE → FIXED
      if (!res || !res.ok) {
        const data = await res?.json().catch(() => ({}));
        throw new Error(data?.detail || "Upload failed.");
      }

      // 🚀 Update instantly to pending
      await updateStatusToPending(currentToken);

      localStorage.removeItem("admin_comment");
      setAdminComment(null);

      setRedirecting(true);
      toast.success("Documents uploaded successfully! Awaiting Approval", {
        style: {
          borderRadius: "10px",
          background: "#E6F7F7",
          color: "#155E63",
          fontWeight: "600",
        },
        iconTheme: { primary: "#155E63", secondary: "#fff" },
      });

      router.replace("/status?refresh=true");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || redirecting) return null;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold text-[#26696D]">
          Loading session...
        </h2>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6 relative"
      style={{ backgroundImage: "url('/icons/screen.png')" }}
    >
      <Toaster position="top-center" />
      <div className="absolute inset-0 bg-[#cde3e1]/70 backdrop-blur-[2px]" />

      <div
        className="relative z-10 w-full max-w-3xl bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-md bg-cover bg-center"
        style={{ backgroundImage: "url('/icons/card-bg.png')" }}
      >
        {/* 🔴 Rejection Banner */}
        {adminComment && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-600 px-5 py-3 rounded-lg relative flex items-center gap-3 shadow-sm">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium truncate">
              <b>Rejected:</b> {adminComment}
            </p>
            <button
              onClick={() => setAdminComment(null)}
              className="absolute top-2 right-3 text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-center mb-8">
          <UploadCloud className="text-[#26696D] w-10 h-10 mr-3" />
          <h1 className="text-3xl font-bold text-[#26696D]">
            Upload KYC Documents
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {files.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow bg-gray-50/90 hover:bg-white/90"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-[#368A8D] w-6 h-6" />
                <span className="text-lg font-medium text-gray-700">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {item.file ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">Selected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">No file</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  id={`file-${idx}`}
                  onChange={(e) =>
                    handleFileChange(
                      idx,
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                />

                <label
                  htmlFor={`file-${idx}`}
                  className="px-4 py-2 text-sm bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white rounded-lg font-semibold cursor-pointer hover:scale-105 transition-transform"
                >
                  {item.file ? "Change" : "Upload"}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-10 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Submit for Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
