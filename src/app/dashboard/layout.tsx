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
  Shield,
  FolderKanban,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { UserNav } from "@/components/dashboard/UserNav";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userRole } = useAuth();

  const isAdmin = userRole === 'admin' || userRole === 'ADMIN';
  const isSO = userRole === 'security_officer' || userRole === 'SO';

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { name: "My Dossiers", href: "/dashboard/dossiers", icon: FolderKanban, show: true },
    { name: "Templates", href: "/dashboard/admin/templates", icon: FileText, show: isAdmin || isSO },
    { name: "Users", href: "/dashboard/admin/users", icon: Users, show: isAdmin },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, show: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white border-r border-slate-800 transition-colors duration-300">
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 h-20 border-b border-slate-800">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">SIRVA</span>
            <p className="text-xs text-slate-400 mt-0.5">Security Assessment</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-6 py-8 space-y-1">
          {navigation.map((item) => {
            if (!item.show) return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"}
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
               {userRole === 'AM' || userRole === 'application_manager' ? 'Application Manager' : 
                userRole === 'SO' || userRole === 'security_officer' ? 'Security Officer' : 
                userRole === 'ADMIN' || userRole === 'admin' ? 'Administrator' :
                userRole?.replace('_', ' ') || 'User'}
             </p>
           </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {navigation.find(n => n.href === pathname && n.show)?.name || "Dashboard"}
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
