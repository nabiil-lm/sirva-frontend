"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { userRole, logout } = useAuth();

  const isSO = userRole === 'security_officer' || userRole === 'SO';

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Dossiers", href: "/dashboard/dossiers", icon: FolderOpen },
    // SO specific links
    ...(isSO ? [
      { name: "Risk Registers", href: "/dashboard/risks", icon: ShieldAlert },
      { name: "Templates", href: "/dashboard/templates", icon: FileText },
    ] : [
      // AM specific links
      { name: "My Documents", href: "/dashboard/documents", icon: FileText },
    ]),
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 bg-slate-950">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-gradient-to-br from-blue-500 to-blue-600">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SIRVA</span>
        </Link>
      </div>

      {/* User Role Badge */}
      <div className="px-6 py-4">
        <div className={cn(
          "px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border",
          isSO 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
        )}>
          {isSO ? "Security Officer" : "Application Manager"}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
