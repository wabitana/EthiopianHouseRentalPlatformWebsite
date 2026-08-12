"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ShieldCheck, CreditCard, ArrowRight, CheckCircle2, Info, Sparkles, Wallet, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function RentCalculatorSection() {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(35000);
  const [depositMonths, setDepositMonths] = useState<number>(2);
  const [includeUtilities, setIncludeUtilities] = useState<boolean>(true);
  const [paymentGateway, setPaymentGateway] = useState<"chapa" | "bank">("chapa");

  // Calculations
  const firstMonthRent = monthlyBudget;
  const securityDeposit = monthlyBudget * depositMonths;
  const estimatedUtilities = includeUtilities ? 2500 : 0;
  const platformFee = 0; // Free for tenants
  const totalMoveInEtb = firstMonthRent + securityDeposit + estimatedUtilities + platformFee;

  return (
    <section className="bg-[#0c1427] text-white py-24 relative overflow-hidden border-t border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Calculator className="h-4 w-4" /> Move-In Cost Transparency
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Interactive Rent & Deposit <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Budget Calculator
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Calculate your total move-in ETB cost with zero hidden fees. Includes refundable security deposit terms & digital Chapa payment verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Box (6 columns) */}
          <div className="lg:col-span-6 bg-[#070c19] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Monthly Rent Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Target Monthly Rent (ETB)</label>
                <span className="text-lg font-black text-emerald-400 font-mono">{formatCurrency(monthlyBudget)}</span>
              </div>
              <input
                type="range"
                min={15000}
                max={100000}
                step={2500}
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>15,000 ETB</span>
                <span>50,000 ETB</span>
                <span>100,000 ETB</span>
              </div>
            </div>

            {/* Deposit Terms Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Security Deposit Requirement</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(months => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setDepositMonths(months)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      depositMonths === months
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md"
                        : "bg-[#0c1427] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {months} {months === 1 ? "Month" : "Months"} Deposit
                  </button>
                ))}
              </div>
            </div>

            {/* Utility & Option Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0c1427] border border-slate-800 cursor-pointer select-none">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Include Estimated Utility Reserve (+2,500 ETB)
                </span>
                <input
                  type="checkbox"
                  checked={includeUtilities}
                  onChange={e => setIncludeUtilities(e.target.checked)}
                  className="rounded accent-emerald-500 h-4 w-4"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c1427] border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" /> Preferred Payment Method
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway("chapa")}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      paymentGateway === "chapa" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Chapa Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway("bank")}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      paymentGateway === "bank" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Line Items Breakdown Inside Controls */}
            <div className="bg-[#0c1427] border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>First Month Rent</span>
                <span className="font-mono font-bold text-white">{formatCurrency(firstMonthRent)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Refundable Deposit ({depositMonths} Mo)</span>
                <span className="font-mono font-bold text-white">{formatCurrency(securityDeposit)}</span>
              </div>
              {includeUtilities && (
                <div className="flex justify-between text-slate-300">
                  <span>Utility Reserve</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(estimatedUtilities)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                <span>Total Move-In ETB</span>
                <span className="font-mono text-emerald-400">{formatCurrency(totalMoveInEtb)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: PHOTOGRAPHIC PERSON GRAPHIC WITH EXACT SECTION COLOR (6 columns) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md sm:max-w-lg">
              {/* Photo Graphic Frame Matching Section BG #0c1427 */}
              <div className="relative h-[440px] sm:h-[480px] rounded-3xl overflow-hidden bg-[#0c1427] flex items-center justify-center">
                <img
                  src="/images/ethiopian_calculator_person_nobg.png"
                  alt="Ethiopian Tenant Calculating Rent Budget"
                  className="w-full h-full object-contain bg-[#0c1427]"
                />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#070c19]/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Instant Budget Total</span>
                    <span className="text-xl font-black text-white font-mono">{formatCurrency(totalMoveInEtb)} ETB</span>
                  </div>

                  <a href={`/browse-houses?price=${monthlyBudget}`}>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">
                      Find Homes <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Floating Badge Graphic 1 (Top Right) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-2 sm:-right-4 z-20 bg-[#070c19]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center gap-3 text-white"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black">Chapa Escrow Verified</h5>
                  <p className="text-[10px] text-slate-400 font-semibold">100% Refundable Deposit</p>
                </div>
              </motion.div>

              {/* Floating Badge Graphic 2 (Bottom Left) */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: [0, 10, 0], opacity: 1 }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-2 sm:-left-4 z-20 bg-[#070c19]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center gap-3 text-white"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black">Zero Tenant Fees</h5>
                  <p className="text-[10px] text-slate-400 font-semibold">Transparent Pricing</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
