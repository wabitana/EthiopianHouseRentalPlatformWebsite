"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, Download, Store, Wrench, Sparkles } from "lucide-react";

interface AppSectionConfig {
  badge?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  features?: string[];
  playStoreLink?: string;
  appStoreLink?: string;
}

interface AppDownloadSectionProps {
  config: AppSectionConfig;
}

const DEFAULT_FEATURES = [
  "Real-time rental availability alerts",
  "Instant Chapa rent payments & receipts",
  "24/7 direct landlord & maintenance chat",
  "Move-in service booking & contract history",
];

const APK_URL = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || "https://github.com/wabitana/EthiopianHouseRentalPlatformWebsite/releases/latest/download/app-release.apk";

export default function AppDownloadSection({ config: appSection }: AppDownloadSectionProps) {
  return (
    <div className="my-16 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
      <section className="w-full bg-white py-16 md:py-24 relative overflow-hidden rounded-[32px] md:rounded-[48px] border border-slate-100 shadow-sm">
        {/* Fine grid design layer overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-60 pointer-events-none" />

        <div className="px-6 sm:px-10 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* LEFT COLUMN: TEXTS & DOWNLOAD CALL TO ACTIONS */}
            <div className="w-full lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  {appSection.title || "Delala Home Rentals App"} <br />
                  <span className="bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-500 bg-clip-text text-transparent">
                    {appSection.titleHighlight || "In the Palm of Your Hand"}
                  </span>
                </h2>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {appSection.subtitle || "Discover new rental listings, chat directly with property owners, pay monthly rent via Chapa, and request maintenance services right from your smartphone."}
                </p>
              </div>

              {/* Bullet Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 text-left">
                {(appSection.features || DEFAULT_FEATURES).map((text: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-lime-500 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Native App Store Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                {/* Google Play / Android APK Download Button */}
                <a
                  href={APK_URL}
                  download="ethiopian-house-rental.apk"
                  className="flex items-center gap-3 bg-slate-900 border border-slate-900 hover:border-lime-500/50 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl transition-all shadow-lg group hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-6 h-6 fill-current text-white group-hover:text-lime-400 transition-colors" viewBox="0 0 24 24">
                    <path d="M3,5.27V18.73L16.55,12L3,5.27M17.87,11.33L14.3,9.5L3.63,4.12C3.43,4.02 3.22,3.97 3,4V4C3.41,4 3.8,4.13 4.13,4.35L17.87,11.33M17.87,12.67L4.13,19.65C3.8,19.87 3.41,20 3,20V20C3.22,20.03 3.43,19.98 3.63,19.88L14.3,14.5L17.87,12.67M20.33,12L16.5,10.12V13.88L20.33,12C20.76,11.79 21,11.4 21,11C21,10.6 20.76,10.21 20.33,12Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-lime-400 font-bold">Direct Download</p>
                    <p className="text-sm font-extrabold -mt-0.5">Android APK (79MB)</p>
                  </div>
                </a>

                {/* App Store Button */}
                <a
                  href="/launch-app"
                  className="flex items-center gap-3 bg-slate-900 border border-slate-900 hover:border-lime-500/50 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl transition-all shadow-lg group hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-6 h-6 fill-current text-white group-hover:text-lime-400 transition-colors" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Download on the</p>
                    <p className="text-sm font-extrabold -mt-0.5">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: ANIMATED MOBILE PHONE MOCKUP */}
            <div className="w-full lg:col-span-6 flex justify-center relative select-none">
              <div className="relative w-[290px] h-[580px] sm:w-[310px] sm:h-[620px]">

                {/* Phone Shell */}
                <div className="absolute inset-0 bg-slate-900 rounded-[50px] p-3.5 shadow-2xl border-4 border-slate-800">
                  {/* Speaker Notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full z-30 flex items-start justify-center pt-1">
                    <div className="w-12 h-1 bg-slate-800 rounded-full" />
                  </div>

                  {/* Inner Screen */}
                  <div className="w-full h-full rounded-[36px] bg-slate-950 overflow-hidden relative border border-slate-900 flex flex-col pt-12 pb-4 px-4 text-white">

                    {/* Animated Store UI */}
                    <motion.div
                      className="w-full h-full flex flex-col justify-between"
                      initial="initial"
                      animate="animate"
                      variants={{
                        animate: {
                          transition: { staggerChildren: 3.5, delayChildren: 0.5 }
                        }
                      }}
                    >
                      {/* Header Cards */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center font-black text-xs text-slate-950">D</div>
                            <div>
                              <h4 className="text-xs font-bold tracking-tight">Delala Rentals</h4>
                              <p className="text-[9px] text-slate-400">Delala Tech PLC</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">Official</span>
                        </div>

                        {/* Download Animation */}
                        <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800 relative overflow-hidden">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400 font-medium">Status</span>
                            <motion.span
                              className="text-lime-400 font-bold tracking-wide"
                              variants={{
                                initial: { opacity: 1 },
                                animate: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 1.5 } }
                              }}
                            >
                              Syncing Setup...
                            </motion.span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 via-lime-400 to-emerald-400 rounded-full"
                              variants={{
                                initial: { width: "10%" },
                                animate: {
                                  width: ["10%", "45%", "85%", "100%", "100%"],
                                  transition: { repeat: Infinity, duration: 7, ease: "easeInOut" }
                                }
                              }}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>M-PWA v2.6</span>
                            <motion.span
                              variants={{
                                initial: { opacity: 1 },
                                animate: { opacity: [1, 0, 1], transition: { repeat: Infinity, duration: 7 } }
                              }}
                            >
                              Verified Secure
                            </motion.span>
                          </div>
                        </div>
                      </div>

                      {/* App Home Preview */}
                      <motion.div
                        className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-3 border border-slate-800/80 space-y-3 flex-1 mt-4 flex flex-col justify-center"
                        variants={{
                          initial: { y: 15, opacity: 0.6 },
                          animate: { y: [15, 0, 0, 15], opacity: [0.6, 1, 1, 0.6], transition: { repeat: Infinity, duration: 7, ease: "easeInOut" } }
                        }}
                      >
                        <div className="h-6 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-between px-2 text-[10px]">
                          <span className="text-lime-400 font-bold">Ethiopia Connected Ecosystem</span>
                          <Sparkles className="h-3 w-3 text-lime-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-xl bg-slate-850 border border-slate-800 text-center">
                            <Store className="h-4 w-4 text-lime-400 mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-slate-200">Marketplace</p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-850 border border-slate-800 text-center">
                            <Wrench className="h-4 w-4 text-lime-400 mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-slate-200">Services</p>
                          </div>
                        </div>

                        <a
                          href={APK_URL}
                          download="ethiopian-house-rental.apk"
                          className="p-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-center text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-lime-400/10 cursor-pointer transition-transform active:scale-95"
                        >
                          <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                          Download Android APK
                        </a>
                      </motion.div>

                      {/* Bottom Nav indicator */}
                      <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto mt-3 shrink-0" />
                    </motion.div>

                  </div>
                </div>

                {/* Glass sheen */}
                <div className="absolute inset-4 rounded-[44px] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
