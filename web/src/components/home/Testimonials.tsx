"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials({ testimonials = [] }: { testimonials?: any[] }) {
  const displayTestimonials =
    testimonials.length > 0
      ? testimonials
      : [
          {
            name: "Yonas Mekonnen",
            role: "Software Engineer",
            company: "Addis Ababa",
            content:
              "Finding an apartment in Bole used to take weeks of calling random brokers. With this platform, I scheduled a verified walkthrough and signed my lease digitally in 24 hours.",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          },
          {
            name: "Hanna Tadesse",
            role: "Property Owner",
            company: "Kazanchis",
            content:
              "The tenant background verification and Chapa escrow deposit protection give me complete peace of mind. Rent is deposited directly without chasing late payments.",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
          },
          {
            name: "Dawit Haile",
            role: "Expat Consultant",
            company: "Old Airport",
            content:
              "The pre-move inventory report and bilingual contracts made moving into our family villa completely transparent. Highly recommended for anyone relocating to Ethiopia.",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          },
        ];

  return (
    <section className="py-20 sm:py-24 bg-white border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        {/* Enclosing Container with clean slate backdrop matching overall design */}
        <div className="w-full px-6 sm:px-10 py-14 sm:py-16 border border-slate-200/80 rounded-[2.5rem] bg-slate-50/60 shadow-sm relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              What Our Clients Say
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              Real experiences from tenants, homeowners, and real estate professionals across Ethiopia.
            </p>
          </div>

          {/* Animated Testimonial Marquee */}
          <div className="overflow-hidden w-full relative">
            {/* Edge gradients for smooth fade */}
            <div className="absolute top-0 left-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 25, repeat: Infinity }}
              className="flex w-max gap-8 items-stretch"
            >
              {[...displayTestimonials, ...displayTestimonials].map((t, i) => (
                <div key={i} className="flex flex-col items-center w-[320px] md:w-[380px] flex-shrink-0">
                  {/* Clean White Card for all reviews */}
                  <div className="p-8 mb-6 w-full bg-white text-slate-800 border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-all flex-1 flex flex-col justify-between">
                    <p className="text-slate-700 text-sm md:text-base text-center leading-relaxed font-normal italic">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>

                  {/* Profile Image & Info */}
                  <div className="text-center">
                    <img
                      src={t.image || `https://i.pravatar.cc/150?u=${encodeURIComponent(t.name || String(i))}`}
                      alt={t.name}
                      className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-white shadow-md object-cover"
                    />
                    <h5 className="font-bold text-slate-900 text-base">{t.name}</h5>
                    <p className="text-xs text-slate-500 mb-2">{t.role}</p>
                    <div className="flex justify-center text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}