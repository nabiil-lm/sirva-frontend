"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { UserNav } from "@/components/dashboard/UserNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userRole } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Dossiers", href: "/dashboard/dossiers", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      {/* CHANGED: dark:bg-slate-800 for better contrast against the dark background */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white dark:bg-slate-800 dark:border-r dark:border-slate-700 transition-colors duration-300">
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 h-20 border-b border-slate-800">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SIRVA</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-6 py-8 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section (Bottom Sidebar) */}
        <div className="p-6 border-t border-slate-800">
           <div className="px-4 py-3 bg-slate-800/50 rounded-xl">
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Role</p>
             <p className="text-sm font-medium text-slate-200 capitalize">
               {userRole === 'AM' ? 'Application Manager' : userRole === 'SO' ? 'Security Officer' : userRole?.replace('_', ' ') || 'User'}
             </p>
           </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* CHANGED: dark:bg-slate-900 for header to distinguish from main content */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {navigation.find(n => n.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            {/* User Profile Dropdown */}
            <UserNav />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
