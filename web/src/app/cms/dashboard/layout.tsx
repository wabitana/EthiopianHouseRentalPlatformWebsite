import { redirect } from "next/navigation";
import { getSession, clearAuthCookie } from "@/lib/auth";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";

export default async function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role?.toLowerCase() !== "admin") redirect("/cms/login");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-emerald-400" />
            <h1 className="font-bold text-lg tracking-wide">
              Delala <span className="text-emerald-400">CMS</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span>Welcome, {session.name}</span>
            <form action={async () => {
              "use server";
              await clearAuthCookie();
              redirect("/cms/login");
            }}>
              <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
