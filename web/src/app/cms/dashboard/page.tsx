"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Upload, Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";

// ----------- HELPERS -----------
function Txt({ label, value, onChange, multiline = false, placeholder = "" }: any) {
  const cls = "w-full border border-slate-200 p-2 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400";
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      {multiline
        ? <textarea className={cls} rows={3} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={cls} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border border-slate-200 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 rounded-t-xl transition-colors"
      >
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && <CardContent className="pt-0 pb-6 px-6 border-t border-slate-100 space-y-4">{children}</CardContent>}
    </Card>
  );
}

// ----------- MAIN COMPONENT -----------
export default function CMSDashboard() {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(key);
    try {
      const res = await fetch(`/api/cms/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) alert("✅ Saved successfully!");
      else alert("❌ Failed to save.");
    } catch { alert("❌ Network error."); }
    finally { setSaving(null); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url as string;
    } catch { alert("Upload failed."); return null; }
    finally { setUploading(false); }
  };

  const setKey = (key: string, val: any) => setConfig(c => ({ ...c, [key]: val }));
  const setNested = (key: string, field: string, val: any) =>
    setConfig(c => ({ ...c, [key]: { ...(c[key] || {}), [field]: val } }));

  const SaveBtn = ({ cmsKey }: { cmsKey: string }) => (
    <Button
      disabled={saving === cmsKey}
      onClick={() => handleSave(cmsKey, config[cmsKey])}
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
    >
      {saving === cmsKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Save Changes
    </Button>
  );

  const UploadBtn = ({ onUploaded, accept = "image/*", labelText = "Upload Image" }: { onUploaded: (url: string) => void, accept?: string, labelText?: string }) => (
    <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
      <Upload className="w-4 h-4" />
      {uploading ? "Uploading..." : labelText}
      <input type="file" accept={accept} className="hidden" onChange={async e => {
        const url = await handleFileUpload(e);
        if (url) onUploaded(url);
      }} />
    </label>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <span className="ml-3 text-slate-600">Loading CMS data...</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Website Content Editor</h1>
        <p className="text-slate-500 mt-1">Manage every section of the public-facing website.</p>
      </div>

      {/* ====== THEME COLORS ====== */}
      <Section title="🎨 Theme Colors">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Primary Color", field: "primaryColor" },
            { label: "Secondary Color", field: "secondaryColor" },
            { label: "Accent Color", field: "accentColor" },
            { label: "Hero Gradient Start", field: "heroGradientFrom" },
            { label: "Hero Gradient End", field: "heroGradientTo" },
            { label: "Navbar Background", field: "navbarBg" },
            { label: "Footer Background", field: "footerBg" },
          ].map(({ label, field }) => (
            <div key={field} className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.cms_theme_colors?.[field] || "#000000"}
                  onChange={e => setNested("cms_theme_colors", field, e.target.value)}
                  className="h-9 w-14 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={config.cms_theme_colors?.[field] || ""}
                  onChange={e => setNested("cms_theme_colors", field, e.target.value)}
                  className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
        <SaveBtn cmsKey="cms_theme_colors" />
      </Section>

      {/* ====== NAVBAR ====== */}
      <Section title="🔗 Navbar">
        <div className="grid grid-cols-2 gap-4">
          <Txt label="Site Name" value={config.cms_navbar?.siteName} onChange={(v: string) => setNested("cms_navbar", "siteName", v)} placeholder="Delala Rentals" />
          <Txt label="Site Tagline" value={config.cms_navbar?.siteTagline} onChange={(v: string) => setNested("cms_navbar", "siteTagline", v)} placeholder="Ethiopian Home Rental Platform" />
          <Txt label="Logo Letter" value={config.cms_navbar?.logoLetter} onChange={(v: string) => setNested("cms_navbar", "logoLetter", v)} placeholder="H" />
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Logo Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={config.cms_navbar?.logoColor || "#059669"} onChange={e => setNested("cms_navbar", "logoColor", e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
              <input type="text" value={config.cms_navbar?.logoColor || ""} onChange={e => setNested("cms_navbar", "logoColor", e.target.value)} className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-xs font-mono" />
            </div>
          </div>
        </div>
        <SaveBtn cmsKey="cms_navbar" />
      </Section>

      {/* ====== HERO ====== */}
      <Section title="🚀 Hero Section">
        <div className="space-y-3">
          <Txt label="Badge Text" value={config.cms_hero?.badge} onChange={(v: string) => setNested("cms_hero", "badge", v)} placeholder="Ethiopia's Premier Home Rental Platform" />
          <Txt label="Headline Title" value={config.cms_hero?.title} onChange={(v: string) => setNested("cms_hero", "title", v)} multiline placeholder="Find & Rent Your Next Dream Home in Ethiopia" />
          <Txt label="Subtitle" value={config.cms_hero?.subtitle} onChange={(v: string) => setNested("cms_hero", "subtitle", v)} multiline placeholder="Delala connects..." />
          <div className="grid grid-cols-2 gap-4">
            <Txt label="Primary Button Text" value={config.cms_hero?.primaryButtonText} onChange={(v: string) => setNested("cms_hero", "primaryButtonText", v)} />
            <Txt label="Primary Button Link" value={config.cms_hero?.primaryButtonLink} onChange={(v: string) => setNested("cms_hero", "primaryButtonLink", v)} />
            <Txt label="Secondary Button Text" value={config.cms_hero?.secondaryButtonText} onChange={(v: string) => setNested("cms_hero", "secondaryButtonText", v)} />
            <Txt label="Secondary Button Link" value={config.cms_hero?.secondaryButtonLink} onChange={(v: string) => setNested("cms_hero", "secondaryButtonLink", v)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 mt-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Background Type</label>
              <select
                className="w-full border border-slate-200 p-2 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={config.cms_hero?.backgroundType || "animation"}
                onChange={(e) => setNested("cms_hero", "backgroundType", e.target.value)}
              >
                <option value="animation">3D Animation (Default)</option>
                <option value="color">Solid Color</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            {(config.cms_hero?.backgroundType === "color") && (
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.cms_hero?.backgroundColor || "#059669"} onChange={e => setNested("cms_hero", "backgroundColor", e.target.value)} className="h-9 w-14 rounded border cursor-pointer" />
                  <input type="text" value={config.cms_hero?.backgroundColor || "#059669"} onChange={e => setNested("cms_hero", "backgroundColor", e.target.value)} className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-xs font-mono" />
                </div>
              </div>
            )}

            {(config.cms_hero?.backgroundType === "image") && (
              <div className="col-span-2 flex items-center gap-4">
                <div className="flex-1">
                  <Txt label="Background Image URL" value={config.cms_hero?.backgroundImage} onChange={(v: string) => setNested("cms_hero", "backgroundImage", v)} placeholder="https://..." />
                </div>
                <div className="mt-6">
                  <UploadBtn onUploaded={(url) => setNested("cms_hero", "backgroundImage", url)} />
                </div>
              </div>
            )}

            {(config.cms_hero?.backgroundType === "video") && (
              <div className="col-span-2 flex items-center gap-4">
                <div className="flex-1">
                  <Txt label="Background Video URL" value={config.cms_hero?.backgroundVideo} onChange={(v: string) => setNested("cms_hero", "backgroundVideo", v)} placeholder="https://..." />
                </div>
              </div>
            )}
          </div>
        </div>
        <SaveBtn cmsKey="cms_hero" />
      </Section>

      {/* ====== FEATURES ====== */}
      <Section title="✨ Features Section (4 Cards)">
        {(config.cms_features || []).map((f: any, i: number) => (
          <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
            <p className="text-xs font-bold text-slate-500 uppercase">Card {i + 1}</p>
            <div className="grid grid-cols-2 gap-3">
              <Txt label="Title" value={f.title} onChange={(v: string) => {
                const arr = [...config.cms_features]; arr[i] = { ...arr[i], title: v }; setKey("cms_features", arr);
              }} />
              <Txt label="Icon Name" value={f.icon} onChange={(v: string) => {
                const arr = [...config.cms_features]; arr[i] = { ...arr[i], icon: v }; setKey("cms_features", arr);
              }} placeholder="Store / Wrench / CreditCard / Smartphone" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Txt label="Image URL (Overrides Icon)" value={f.image} onChange={(v: string) => {
                  const arr = [...config.cms_features]; arr[i] = { ...arr[i], image: v }; setKey("cms_features", arr);
                }} placeholder="https://..." />
              </div>
              <div className="mt-6">
                <UploadBtn onUploaded={url => {
                  const arr = [...config.cms_features]; arr[i] = { ...arr[i], image: url }; setKey("cms_features", arr);
                }} />
              </div>
            </div>
            <Txt label="Description" value={f.desc} multiline onChange={(v: string) => {
              const arr = [...config.cms_features]; arr[i] = { ...arr[i], desc: v }; setKey("cms_features", arr);
            }} />
          </div>
        ))}
        <SaveBtn cmsKey="cms_features" />
      </Section>

      {/* ====== PLATFORM HIGHLIGHTS ====== */}
      <Section title="🌟 Platform Highlights">
        {(config.cms_platform_highlights || []).map((h: any, i: number) => (
          <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase">Highlight {i + 1}</p>
              <Button variant="danger" size="sm" onClick={() => {
                const arr = (config.cms_platform_highlights || []).filter((_: any, idx: number) => idx !== i);
                setKey("cms_platform_highlights", arr);
              }}><Trash className="w-3 h-3" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Txt label="Category" value={h.category} onChange={(v: string) => {
                const arr = [...config.cms_platform_highlights]; arr[i] = { ...arr[i], category: v }; setKey("cms_platform_highlights", arr);
              }} />
              <Txt label="Name" value={h.name} onChange={(v: string) => {
                const arr = [...config.cms_platform_highlights]; arr[i] = { ...arr[i], name: v }; setKey("cms_platform_highlights", arr);
              }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Txt label="Image URL (Overrides Icon)" value={h.image} onChange={(v: string) => {
                  const arr = [...config.cms_platform_highlights]; arr[i] = { ...arr[i], image: v }; setKey("cms_platform_highlights", arr);
                }} placeholder="https://..." />
              </div>
              <div className="mt-6">
                <UploadBtn onUploaded={url => {
                  const arr = [...config.cms_platform_highlights]; arr[i] = { ...arr[i], image: url }; setKey("cms_platform_highlights", arr);
                }} />
              </div>
            </div>
            <Txt label="Description" value={h.desc} multiline onChange={(v: string) => {
              const arr = [...config.cms_platform_highlights]; arr[i] = { ...arr[i], desc: v }; setKey("cms_platform_highlights", arr);
            }} />
          </div>
        ))}
        <div className="flex gap-3">
          <Button size="sm" variant="secondary" onClick={() => setKey("cms_platform_highlights", [...(config.cms_platform_highlights || []), { category: "New", name: "New Highlight", desc: "Description" }])}>
            <Plus className="w-4 h-4 mr-1" /> Add Highlight
          </Button>
          <SaveBtn cmsKey="cms_platform_highlights" />
        </div>
      </Section>

      {/* ====== COUNTER STATS ====== */}
      <Section title="📊 Statistics Counters">
        {(config.cms_counters || []).map((c: any, i: number) => (
          <div key={i} className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50">
            <div className="flex-1">
              <Txt label="Value (number)" value={String(c.value)} onChange={(v: string) => {
                const arr = [...config.cms_counters]; arr[i] = { ...arr[i], value: Number(v) || 0 }; setKey("cms_counters", arr);
              }} />
            </div>
            <div className="flex-1">
              <Txt label="Label" value={c.label} onChange={(v: string) => {
                const arr = [...config.cms_counters]; arr[i] = { ...arr[i], label: v }; setKey("cms_counters", arr);
              }} />
            </div>
            <Button variant="danger" size="sm" className="mt-4" onClick={() => {
              setKey("cms_counters", config.cms_counters.filter((_: any, idx: number) => idx !== i));
            }}><Trash className="w-4 h-4" /></Button>
          </div>
        ))}
        <div className="flex gap-3">
          <Button size="sm" variant="secondary" onClick={() => setKey("cms_counters", [...(config.cms_counters || []), { value: 100, label: "New Stat" }])}>
            <Plus className="w-4 h-4 mr-1" /> Add Counter
          </Button>
          <SaveBtn cmsKey="cms_counters" />
        </div>
      </Section>

      {/* ====== CTA SECTION ====== */}
      <Section title="📣 CTA Banner Section">
        <div className="space-y-3">
          <Txt label="Title" value={config.cms_cta?.title} onChange={(v: string) => setNested("cms_cta", "title", v)} multiline />
          <Txt label="Subtitle" value={config.cms_cta?.subtitle} onChange={(v: string) => setNested("cms_cta", "subtitle", v)} multiline />
          <div className="grid grid-cols-2 gap-4">
            <Txt label="Button Text" value={config.cms_cta?.buttonText} onChange={(v: string) => setNested("cms_cta", "buttonText", v)} />
            <Txt label="Button Link" value={config.cms_cta?.buttonLink} onChange={(v: string) => setNested("cms_cta", "buttonLink", v)} />
          </div>
        </div>
        <SaveBtn cmsKey="cms_cta" />
      </Section>

      {/* ====== ABOUT US ====== */}
      <Section title="🏢 About Us Section">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Txt label="Badge" value={config.cms_about?.badge} onChange={(v: string) => setNested("cms_about", "badge", v)} />
            <Txt label="Section Title" value={config.cms_about?.title} onChange={(v: string) => setNested("cms_about", "title", v)} />
          </div>
          <Txt label="Mission Statement" value={config.cms_about?.mission} multiline onChange={(v: string) => setNested("cms_about", "mission", v)} />
          <Txt label="Vision Statement" value={config.cms_about?.vision} multiline onChange={(v: string) => setNested("cms_about", "vision", v)} />
          <Txt label="Paragraph 1" value={config.cms_about?.paragraph1} multiline onChange={(v: string) => setNested("cms_about", "paragraph1", v)} />
          <Txt label="Paragraph 2" value={config.cms_about?.paragraph2} multiline onChange={(v: string) => setNested("cms_about", "paragraph2", v)} />
          <Txt label="Paragraph 3" value={config.cms_about?.paragraph3} multiline onChange={(v: string) => setNested("cms_about", "paragraph3", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Txt label="Contact Phone" value={config.cms_about?.phone} onChange={(v: string) => setNested("cms_about", "phone", v)} />
            <Txt label="Explore Button Text" value={config.cms_about?.explorebuttonText} onChange={(v: string) => setNested("cms_about", "explorebuttonText", v)} />
            <Txt label="Explore Button Link" value={config.cms_about?.exploreButtonLink} onChange={(v: string) => setNested("cms_about", "exploreButtonLink", v)} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Txt label="Background Video URL" value={config.cms_about?.videoUrl} onChange={(v: string) => setNested("cms_about", "videoUrl", v)} placeholder="https://..." />
            </div>
            <div className="mt-6">
              <UploadBtn onUploaded={(url) => setNested("cms_about", "videoUrl", url)} accept="video/*" labelText="Upload Video" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Services List</label>
            <div className="space-y-2 mt-2">
              {(config.cms_about?.services || []).map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-sm"
                    value={s}
                    onChange={e => {
                      const arr = [...(config.cms_about?.services || [])];
                      arr[i] = e.target.value;
                      setNested("cms_about", "services", arr);
                    }}
                  />
                  <Button variant="danger" size="sm" onClick={() => {
                    const arr = (config.cms_about?.services || []).filter((_: any, idx: number) => idx !== i);
                    setNested("cms_about", "services", arr);
                  }}><Trash className="w-3 h-3" /></Button>
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => setNested("cms_about", "services", [...(config.cms_about?.services || []), "New Service"])}>
                <Plus className="w-4 h-4 mr-1" /> Add Service
              </Button>
            </div>
          </div>
        </div>
        <SaveBtn cmsKey="cms_about" />
      </Section>

      {/* ====== HOW IT WORKS ====== */}
      <Section title="⚙️ How Delala Works">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Txt label="Badge" value={config.cms_how_it_works?.badge} onChange={(v: string) => setNested("cms_how_it_works", "badge", v)} />
            <Txt label="Section Title" value={config.cms_how_it_works?.title} onChange={(v: string) => setNested("cms_how_it_works", "title", v)} />
          </div>
          <Txt label="Subtitle" value={config.cms_how_it_works?.subtitle} multiline onChange={(v: string) => setNested("cms_how_it_works", "subtitle", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Txt label="CTA Button Text" value={config.cms_how_it_works?.ctaText} onChange={(v: string) => setNested("cms_how_it_works", "ctaText", v)} />
            <Txt label="CTA Button Link" value={config.cms_how_it_works?.ctaLink} onChange={(v: string) => setNested("cms_how_it_works", "ctaLink", v)} />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase mt-2">Steps</p>
          {(config.cms_how_it_works?.steps || []).map((step: any, i: number) => (
            <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50">
              <p className="text-xs font-bold text-slate-400">Step {i + 1}</p>
              <div className="grid grid-cols-2 gap-2">
                <Txt label="Step Number" value={step.step} onChange={(v: string) => {
                  const arr = [...(config.cms_how_it_works?.steps || [])]; arr[i] = { ...arr[i], step: v };
                  setNested("cms_how_it_works", "steps", arr);
                }} />
                <Txt label="Title" value={step.title} onChange={(v: string) => {
                  const arr = [...(config.cms_how_it_works?.steps || [])]; arr[i] = { ...arr[i], title: v };
                  setNested("cms_how_it_works", "steps", arr);
                }} />
              </div>
              <Txt label="Description" value={step.description} multiline onChange={(v: string) => {
                const arr = [...(config.cms_how_it_works?.steps || [])]; arr[i] = { ...arr[i], description: v };
                setNested("cms_how_it_works", "steps", arr);
              }} />
            </div>
          ))}
        </div>
        <SaveBtn cmsKey="cms_how_it_works" />
      </Section>

      {/* ====== APP DOWNLOAD ====== */}
      <Section title="📱 App Download Section">
        <div className="space-y-3">
          <Txt label="Badge" value={config.cms_app_section?.badge} onChange={(v: string) => setNested("cms_app_section", "badge", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Txt label="Title" value={config.cms_app_section?.title} onChange={(v: string) => setNested("cms_app_section", "title", v)} />
            <Txt label="Title Highlight (gradient)" value={config.cms_app_section?.titleHighlight} onChange={(v: string) => setNested("cms_app_section", "titleHighlight", v)} />
          </div>
          <Txt label="Subtitle" value={config.cms_app_section?.subtitle} multiline onChange={(v: string) => setNested("cms_app_section", "subtitle", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Txt label="Google Play Link" value={config.cms_app_section?.playStoreLink} onChange={(v: string) => setNested("cms_app_section", "playStoreLink", v)} />
            <Txt label="App Store Link" value={config.cms_app_section?.appStoreLink} onChange={(v: string) => setNested("cms_app_section", "appStoreLink", v)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Bullet Features</label>
            <div className="space-y-2 mt-2">
              {(config.cms_app_section?.features || []).map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-sm"
                    value={f}
                    onChange={e => {
                      const arr = [...(config.cms_app_section?.features || [])];
                      arr[i] = e.target.value;
                      setNested("cms_app_section", "features", arr);
                    }}
                  />
                  <Button variant="danger" size="sm" onClick={() => {
                    const arr = (config.cms_app_section?.features || []).filter((_: any, idx: number) => idx !== i);
                    setNested("cms_app_section", "features", arr);
                  }}><Trash className="w-3 h-3" /></Button>
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => setNested("cms_app_section", "features", [...(config.cms_app_section?.features || []), "New Feature"])}>
                <Plus className="w-4 h-4 mr-1" /> Add Feature
              </Button>
            </div>
          </div>
        </div>
        <SaveBtn cmsKey="cms_app_section" />
      </Section>

      {/* ====== VENDOR CTA ====== */}
      <Section title="🏪 Vendor CTA Section">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Txt label="Badge" value={config.cms_vendor_cta?.badge} onChange={(v: string) => setNested("cms_vendor_cta", "badge", v)} />
            <Txt label="Title" value={config.cms_vendor_cta?.title} onChange={(v: string) => setNested("cms_vendor_cta", "title", v)} />
          </div>
          <Txt label="Subtitle" value={config.cms_vendor_cta?.subtitle} multiline onChange={(v: string) => setNested("cms_vendor_cta", "subtitle", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Txt label="Button Text" value={config.cms_vendor_cta?.buttonText} onChange={(v: string) => setNested("cms_vendor_cta", "buttonText", v)} />
            <Txt label="Button Link" value={config.cms_vendor_cta?.buttonLink} onChange={(v: string) => setNested("cms_vendor_cta", "buttonLink", v)} />
          </div>
        </div>
        <SaveBtn cmsKey="cms_vendor_cta" />
      </Section>

      {/* ====== MEET THE MINDS ====== */}
      <Section title="👥 Meet the Minds (Team)">
        {(config.cms_meet_the_minds || []).map((member: any, i: number) => (
          <div key={member.id || i} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div className="flex-shrink-0">
              {member.photo && <img src={member.photo} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" alt="" />}
              <UploadBtn onUploaded={url => {
                const arr = [...config.cms_meet_the_minds]; arr[i] = { ...arr[i], photo: url }; setKey("cms_meet_the_minds", arr);
              }} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Txt label="Name" value={member.name} onChange={(v: string) => {
                const arr = [...config.cms_meet_the_minds]; arr[i] = { ...arr[i], name: v }; setKey("cms_meet_the_minds", arr);
              }} />
              <Txt label="Role / Title" value={member.role} onChange={(v: string) => {
                const arr = [...config.cms_meet_the_minds]; arr[i] = { ...arr[i], role: v }; setKey("cms_meet_the_minds", arr);
              }} />
              <Txt label="Department" value={member.dept} onChange={(v: string) => {
                const arr = [...config.cms_meet_the_minds]; arr[i] = { ...arr[i], dept: v }; setKey("cms_meet_the_minds", arr);
              }} />
              <Txt label="LinkedIn URL" value={member.linkedin} onChange={(v: string) => {
                const arr = [...config.cms_meet_the_minds]; arr[i] = { ...arr[i], linkedin: v }; setKey("cms_meet_the_minds", arr);
              }} />
              <div className="col-span-2">
                <Txt label="Bio" value={member.bio} multiline onChange={(v: string) => {
                  const arr = [...config.cms_meet_the_minds]; arr[i] = { ...arr[i], bio: v }; setKey("cms_meet_the_minds", arr);
                }} />
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => {
              setKey("cms_meet_the_minds", config.cms_meet_the_minds.filter((_: any, idx: number) => idx !== i));
            }}><Trash className="w-4 h-4" /></Button>
          </div>
        ))}
        <div className="flex gap-3">
          <Button size="sm" variant="secondary" onClick={() => setKey("cms_meet_the_minds", [...(config.cms_meet_the_minds || []), { id: Date.now().toString(), name: "New Member", role: "Role", dept: "Department", bio: "", photo: "", linkedin: "" }])}>
            <Plus className="w-4 h-4 mr-1" /> Add Member
          </Button>
          <SaveBtn cmsKey="cms_meet_the_minds" />
        </div>
      </Section>

      {/* ====== PARTNER COMPANIES ====== */}
      <Section title="🤝 Partner Companies">
        {(config.cms_partner_companies || []).map((partner: any, i: number) => (
          <div key={partner.id || i} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
            {partner.logo && <img src={partner.logo} className="h-12 w-24 object-contain rounded border bg-white p-1" alt="" />}
            <div className="flex-1">
              <Txt label="Company Name" value={partner.name} onChange={(v: string) => {
                const arr = [...config.cms_partner_companies]; arr[i] = { ...arr[i], name: v }; setKey("cms_partner_companies", arr);
              }} />
            </div>
            <UploadBtn onUploaded={url => {
              const arr = [...config.cms_partner_companies]; arr[i] = { ...arr[i], logo: url }; setKey("cms_partner_companies", arr);
            }} />
            <Button variant="danger" size="sm" onClick={() => {
              setKey("cms_partner_companies", config.cms_partner_companies.filter((_: any, idx: number) => idx !== i));
            }}><Trash className="w-4 h-4" /></Button>
          </div>
        ))}
        <div className="flex gap-3">
          <Button size="sm" variant="secondary" onClick={() => setKey("cms_partner_companies", [...(config.cms_partner_companies || []), { id: Date.now().toString(), name: "New Partner", logo: "" }])}>
            <Plus className="w-4 h-4 mr-1" /> Add Partner
          </Button>
          <SaveBtn cmsKey="cms_partner_companies" />
        </div>
      </Section>

      {/* ====== TESTIMONIALS ====== */}
      <Section title="💬 Our Clients Say! (Testimonials)">
        {(config.cms_testimonials || []).map((t: any, i: number) => (
          <div key={t.id || i} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
            <div className="flex items-center gap-4">
              {t.image && <img src={t.image} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" alt="" />}
              <UploadBtn onUploaded={url => {
                const arr = [...config.cms_testimonials]; arr[i] = { ...arr[i], image: url }; setKey("cms_testimonials", arr);
              }} />
              <Button variant="danger" size="sm" className="ml-auto" onClick={() => setKey("cms_testimonials", config.cms_testimonials.filter((_: any, idx: number) => idx !== i))}>
                <Trash className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Txt label="Name" value={t.name} onChange={(v: string) => {
                const arr = [...config.cms_testimonials]; arr[i] = { ...arr[i], name: v }; setKey("cms_testimonials", arr);
              }} />
              <Txt label="Role" value={t.role} onChange={(v: string) => {
                const arr = [...config.cms_testimonials]; arr[i] = { ...arr[i], role: v }; setKey("cms_testimonials", arr);
              }} />
              <Txt label="Company" value={t.company} onChange={(v: string) => {
                const arr = [...config.cms_testimonials]; arr[i] = { ...arr[i], company: v }; setKey("cms_testimonials", arr);
              }} />
            </div>
            <Txt label="Testimonial Content" value={t.content} multiline onChange={(v: string) => {
              const arr = [...config.cms_testimonials]; arr[i] = { ...arr[i], content: v }; setKey("cms_testimonials", arr);
            }} />
          </div>
        ))}
        <div className="flex gap-3">
          <Button size="sm" variant="secondary" onClick={() => setKey("cms_testimonials", [...(config.cms_testimonials || []), { id: Date.now().toString(), name: "Client", role: "Role", company: "Company", image: "", content: "Great service!" }])}>
            <Plus className="w-4 h-4 mr-1" /> Add Testimonial
          </Button>
          <SaveBtn cmsKey="cms_testimonials" />
        </div>
      </Section>

      {/* ====== FOOTER ====== */}
      <Section title="🦶 Footer Configuration">
        <div className="grid grid-cols-2 gap-4">
          <Txt label="Address" value={config.cms_footer?.address} onChange={(v: string) => setNested("cms_footer", "address", v)} />
          <Txt label="Phone" value={config.cms_footer?.phone} onChange={(v: string) => setNested("cms_footer", "phone", v)} />
          <Txt label="Email" value={config.cms_footer?.email} onChange={(v: string) => setNested("cms_footer", "email", v)} />
          <Txt label="Copyright Text" value={config.cms_footer?.copyright} onChange={(v: string) => setNested("cms_footer", "copyright", v)} />
          <Txt label="Weekday Hours" value={config.cms_footer?.officeHoursWeekday} onChange={(v: string) => setNested("cms_footer", "officeHoursWeekday", v)} />
          <Txt label="Weekend Hours" value={config.cms_footer?.officeHoursWeekend} onChange={(v: string) => setNested("cms_footer", "officeHoursWeekend", v)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Footer Services List</label>
          <div className="space-y-2 mt-2">
            {(config.cms_footer?.services || []).map((s: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-sm"
                  value={s}
                  onChange={e => {
                    const arr = [...(config.cms_footer?.services || [])];
                    arr[i] = e.target.value;
                    setNested("cms_footer", "services", arr);
                  }}
                />
                <Button variant="danger" size="sm" onClick={() => {
                  const arr = (config.cms_footer?.services || []).filter((_: any, idx: number) => idx !== i);
                  setNested("cms_footer", "services", arr);
                }}><Trash className="w-3 h-3" /></Button>
              </div>
            ))}
            <Button size="sm" variant="secondary" onClick={() => setNested("cms_footer", "services", [...(config.cms_footer?.services || []), "New Service"])}>
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          </div>
        </div>
        <SaveBtn cmsKey="cms_footer" />
      </Section>
    </div>
  );
}
