"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials({ testimonials = [] }: { testimonials?: any[] }) {
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    { name: "Client Name", role: "Profession", company: "Company", content: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.", image: "" },
  ];

  return (
    <section className="py-20 bg-white">
      {/* Container with enhanced shadow and blue-tinted filter */}
      <div className="max-w-7xl mx-auto px-6 py-16 border border-slate-100 rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] bg-blue-50/30">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">Testimonial</h4>
          <h2 className="text-4xl font-black text-slate-900">Our Clients Say!</h2>
        </div>

        {/* Animated Testimonial Marquee */}
        <div className="overflow-hidden w-full relative">
          {/* Edge gradients for smooth fade out */}
          <div className="absolute top-0 left-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-[#eff6ff] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-[#eff6ff] to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 15, repeat: Infinity }}
            className="flex w-max gap-8"
          >
            {[...displayTestimonials, ...displayTestimonials].map((t, i) => (
              <div key={i} className="flex flex-col items-center w-[320px] md:w-[400px] flex-shrink-0">
              {/* Individual Card with deep shadow */}
              <div className={`p-8 mb-6 w-full border border-slate-100 shadow-xl 
                rounded-t-3xl rounded-bl-3xl 
                ${i === 1 ? "bg-blue-600 text-white" : "bg-white text-slate-800"}`}
              >
                <p className="text-center leading-relaxed font-medium">{t.content}</p>
              </div>
              
              {/* Profile Image & Info */}
              <div className="text-center">
                <img 
                  src={t.image || `https://i.pravatar.cc/150?u=${t.name.replace(' ', '')}`} 
                  alt={t.name} 
                  className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover" 
                />
                <h5 className="font-bold text-slate-900">{t.name}</h5>
                <p className="text-sm text-slate-500 mb-2">{t.role}</p>
                <div className="flex justify-center text-orange-400">
                  {[...Array(5)].map((_, index) => <Star key={index} size={14} fill="currentColor" />)}
                </div>
              </div>
            </div>
          ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}