"use client";

import Header from "../components/Header";
import Link from "next/link";
import { CheckCircle2, FileText, Settings, Upload } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f9f9] to-[#dff3f3]">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="bg-white/90 rounded-2xl shadow-lg p-8 text-center border border-[#cde3e1]">
          <h1 className="text-3xl font-bold text-[#26696D] mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your profile, upload documents, and track approval status — all in one place.
          </p>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          <div className="bg-white/95 rounded-2xl shadow-md p-6 flex items-center gap-4 border-l-4 border-green-500">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-[#26696D]">Profile Status</h3>
              <p className="text-gray-700">Your account is verified and active.</p>
            </div>
          </div>

          <div className="bg-white/95 rounded-2xl shadow-md p-6 flex items-center gap-4 border-l-4 border-blue-500">
            <FileText className="w-10 h-10 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-[#26696D]">Documents</h3>
              <p className="text-gray-700">All documents approved by admin.</p>
            </div>
          </div>

          <div className="bg-white/95 rounded-2xl shadow-md p-6 flex items-center gap-4 border-l-4 border-yellow-500">
            <Settings className="w-10 h-10 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-[#26696D]">Next Steps</h3>
              <p className="text-gray-700">Update details or upload new documents.</p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/upload"
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-b from-[#26696D] to-[#368A8D] text-white font-bold rounded-xl shadow-md hover:scale-[1.05] transition-transform duration-200"
          >
            <Upload className="w-5 h-5" />
            Upload New Documents
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-2 px-8 py-3 bg-white text-[#26696D] border-2 border-[#26696D] font-bold rounded-xl shadow-md hover:bg-[#26696D] hover:text-white transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            Manage Profile
          </Link>
        </div>
      </main>
    </div>
  );
}
