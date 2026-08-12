"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Download } from "lucide-react";

export default function LaunchAppPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <Smartphone className="w-8 h-8 text-emerald-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Delala Home Rentals App
        </h1>
        <p className="text-slate-600 mb-8">
          The app is currently available for download. Experience the full platform from your mobile device.
        </p>

        <div className="space-y-4">
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2" size="lg">
            <Download className="w-5 h-5" />
            Download for iOS
          </Button>
          
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2" size="lg">
            <Download className="w-5 h-5" />
            Download for Android
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link href="/">
            <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
