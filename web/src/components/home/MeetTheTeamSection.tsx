"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  dept?: string;
  bio?: string;
  photo?: string;
}

interface MeetTheTeamSectionProps {
  members?: TeamMember[];
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    name: "Nathan Embakom",
    role: "Chief Executive Officer",
    dept: "Executive Leadership",
    bio: "Ex-fintech architect directing corporate tech growth and secure ecosystem partnerships across East Africa.",
  },
  {
    name: "Amara Belay",
    role: "Chief Technology Officer",
    dept: "Engineering",
    bio: "Specialist in high-scale cloud clusters, data structures, and core real-time telemetry streaming platforms.",
  },
  {
    name: "Dawit Kebede",
    role: "Head of Product Infrastructure",
    dept: "Product Management",
    bio: "Translates high-level property rental and sales platform visions into intuitive, user-centric system interfaces.",
  },
  {
    name: "Selam Kebede",
    role: "VP of Logistics Operations",
    dept: "Operations",
    bio: "Optimizes end-to-end multi-party shipping pipelines, supply network visibility, and automated merchant routing.",
  },
];

function TeamCard({ member, className = "" }: { member: TeamMember; className?: string }) {
  return (
    <div className={`group relative flex flex-col justify-between bg-white border border-slate-200 hover:border-emerald-200 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 ${className}`}>
      <div>
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 relative mb-5 border border-slate-100">
          <img src={member.photo || `https://i.pravatar.cc/300?u=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <p className="text-xs text-white leading-relaxed italic font-medium">
              &quot;{member.bio || member.role}&quot;
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          {member.dept || "Team"}
        </span>
        <h4 className="text-lg font-bold text-slate-900 tracking-tight mt-3 group-hover:text-emerald-600 transition-colors duration-200">
          {member.name}
        </h4>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {member.role}
        </p>
      </div>
      <div className="flex items-center gap-3 border-t border-slate-100 mt-6 pt-4 text-slate-400">
        <a href="#linkedin" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
          <FaLinkedin className="h-4 w-4" />
        </a>
        <a href="#twitter" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
          <FaXTwitter className="h-4 w-4" />
        </a>
        <a href="#email" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
          <Mail className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default function MeetTheTeamSection({ members }: MeetTheTeamSectionProps) {
  const teamMembers = members || DEFAULT_MEMBERS;

  return (
    <div className="my-16 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
      <section className="w-full bg-white py-16 md:py-24 relative overflow-hidden rounded-[32px] md:rounded-[48px] border border-slate-100 shadow-2xl">
        {/* Ambient Background */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-100 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50 pointer-events-none" />

        <div className="px-6 sm:px-10 lg:px-12 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 md:mb-24">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-600 tracking-wide uppercase">
            Innovators & Builders
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Meet the Minds Behind <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-purple-600 bg-clip-text text-transparent">
              Delala Home Rentals
            </span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Our elite team combines real estate expertise with digital innovation to deliver Ethiopia&apos;s premier home rental ecosystem.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, i) => (
            <TeamCard key={i} member={member} />
          ))}
        </div>

        {/* Mobile Auto-Scrolling Marquee */}
        <div className="sm:hidden overflow-hidden w-full relative">
          <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 18, repeat: Infinity }}
            className="flex w-max gap-5"
          >
            {[...Array(2)].flatMap((_, dupeIdx) =>
              teamMembers.map((member, i) => (
                <TeamCard
                  key={`${dupeIdx}-${i}`}
                  member={member}
                  className="flex-shrink-0 w-[280px]"
                />
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  </div>
);
}
