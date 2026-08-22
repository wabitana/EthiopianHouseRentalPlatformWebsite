"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate an API call
    setTimeout(() => {
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };
  return (
    // 'id' allows the link to find this spot. 
    // 'scroll-mt-24' prevents the sticky header from covering the top of the section.
    <section id="contact" className="relative py-24 bg-white overflow-hidden scroll-mt-24">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60 -z-0" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-slate-900 mb-6"
          >
            Let's Start a Conversation
          </motion.h2>
          <p className="text-slate-500 max-w-lg mx-auto text-lg">
            Have a project in mind or want to discuss opportunities? I'm ready to turn your vision into reality.
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-12 gap-0 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden"
        >
          
          {/* Form Side */}
          <div className="md:col-span-7 p-8 md:p-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <Input 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input 
                  placeholder="Email Address" 
                  type="email" 
                  value={formData.email}
                  onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <Input 
                placeholder="Subject of your message" 
                value={formData.subject}
                onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })}
              />
              <textarea 
                placeholder="How can I help you?" 
                rows={5} 
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all resize-none"
                value={formData.message}
                onChange={(e: any) => setFormData({ ...formData, message: e.target.value })}
                required
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-blue-600/20 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"} <Send size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="md:col-span-5 bg-blue-600 p-8 md:p-12 text-white flex flex-col justify-center gap-10">
            <h3 className="text-2xl font-bold">Contact Details</h3>
            
            <div className="space-y-8">
              <InfoRow icon={<Mail />} title="Email" text="rentals@delala.com" />
              <InfoRow icon={<Phone />} title="Phone" text="+251 987 888 333" />
              <InfoRow icon={<Send />} title="Telegram Bot" text="@EthioHouseRentalBot" />
              <InfoRow icon={<MapPin />} title="Location" text="Addis Ababa, Ethiopia" />
              <InfoRow icon={<Clock />} title="Hours" text="Mon - Fri, 9AM - 6PM PST" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Reusable UI Components
const Input = ({ placeholder, type = "text", value, onChange }: { placeholder: string, type?: string, value?: string, onChange?: any }) => (
  <input 
    type={type} 
    placeholder={placeholder} 
    value={value}
    onChange={onChange}
    required
    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all" 
  />
);

const InfoRow = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
  <div className="flex items-start gap-4">
    <div className="p-3 bg-white/10 rounded-xl">{icon}</div>
    <div>
      <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="font-semibold text-lg">{text}</p>
    </div>
  </div>
);