"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface VerificationStatus {
  status: string;
  admin_comment?: string;
}

export default function Status() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          toast.error("Please login first.");
          router.push("/login");
          return;
        }

        // Decode JWT token to extract user_id
        let userId: number | undefined;
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.user_id || payload.id;
        } catch (err) {
          toast.error("Invalid token. Please login again.");
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        if (!userId) {
          toast.error("Unable to determine user ID from token.");
          router.push("/login");
          return;
        }

        // 👇 Force refresh after upload (check ?refresh=true param)
        const forceRefresh = searchParams.get("refresh") === "true";

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/seller/status/${userId}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: forceRefresh ? "no-store" : "default",
          }
        );

        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();

        // ✅ FIX: if user just reuploaded (recent_reupload flag or ?refresh)
        const recentlyUploaded =
          localStorage.getItem("recent_reupload") || forceRefresh;

        if (recentlyUploaded) {
          // Clear the flag immediately so we don’t override future fetches
          localStorage.removeItem("recent_reupload");

          // If backend hasn’t yet updated (still returns rejected), override locally
          if (data.status.toLowerCase() === "rejected") {
            data.status = "pending";
            data.admin_comment = "";
          }
        }

        setStatus(data);
      } catch (err) {
        console.error("Error fetching status:", err);
        toast.error("Error fetching status.");
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [router, refreshKey, searchParams]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="w-10 h-10 text-green-600" />;
      case "pending":
        return <Clock className="w-10 h-10 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-10 h-10 text-red-500" />;
      default:
        return <Clock className="w-10 h-10 text-gray-400" />;
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: "url('/icons/screen.png')",
      }}
    >
      {/* Toast container */}
      <Toaster position="top-center" />

      {/* Overlay tint */}
      <div className="absolute inset-0 bg-[#cde3e1]/70 backdrop-blur-[2px]" />

      {/* Status Card */}
      <div
        className="relative z-10 w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-md bg-cover bg-center text-center"
        style={{
          backgroundImage: "url('/icons/card-bg.png')",
        }}
      >
        <h1 className="text-3xl font-bold text-[#26696D] mb-6 border-b pb-3">
          Verification Status
        </h1>

        {loading ? (
          <p className="text-gray-500 text-lg">Loading status...</p>
        ) : status ? (
          <>
            <div className="flex flex-col items-center mb-4">
              {getStatusIcon(status.status)}
              <p className="mt-3 text-xl font-semibold text-[#26696D] capitalize">
                {status.status}
              </p>
            </div>

            {/* Admin Comment (only for rejected) */}
            {status.status.toLowerCase() === "rejected" &&
              status.admin_comment && (
                <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg mb-6 text-left">
                  <p className="text-sm font-semibold">Admin Comment:</p>
                  <p className="text-xs mt-1 italic">
                    “{status.admin_comment}”
                  </p>
                </div>
              )}

            {/* Approved */}
            {status.status.toLowerCase() === "approved" && (
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-md hover:scale-[1.03] transition-transform duration-200 inline-block"
              >
                Go to Dashboard
              </Link>
            )}

            {/* Pending */}
            {status.status.toLowerCase() === "pending" && (
              <div className="text-[#26696D] mt-2">
                <p className="text-md font-bold">
                  Your documents are under review.
                </p>
              </div>
            )}

            {/* Rejected */}
            {status.status.toLowerCase() === "rejected" && (
              <Link
                href="/upload"
                onClick={() => {
                  localStorage.setItem("recent_reupload", "true");
                  setRefreshKey((prev) => prev + 1);
                }}
                className="mt-4 px-8 py-3 bg-gradient-to-b from-red-600 to-red-700 text-white font-bold rounded-xl shadow-md hover:scale-[1.03] transition-transform duration-200 inline-block"
              >
                Reupload Documents
              </Link>
            )}
          </>
        ) : (
          <p className="text-gray-500">Unable to fetch status.</p>
        )}
      </div>
    </div>
  );
}
