"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Settings,
  LogOut,
  Users,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMemo, useEffect } from "react";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const { user, userRole, logout } = useAuth();

  // ADD LOGGING
  useEffect(() => {
    console.log('[DashboardSidebar] Component mounted/updated', {
      pathname,
      userRole,
      user: user?.email,
      isOpen
    });
  }, [pathname, userRole, user, isOpen]);

  const avatarUrl = useMemo(() => {
    if (!user?.avatar) return null;
    
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")
      .replace(/\/api$/, "")
      .replace(/\/$/, "");
    
    return user.avatar.startsWith("http")
      ? user.avatar
      : `${apiUrl}${user.avatar}`;
  }, [user]);

  const isAdmin = userRole === "ADMIN" || userRole === "admin";
  const isSO = userRole === "SO" || userRole === "security_officer";

  const navigationItems = useMemo(() => [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/dossiers", label: "My Dossiers", icon: FolderOpen },
    ...(isAdmin || isSO
      ? [{ href: "/dashboard/admin/templates", label: "Templates", icon: FileText }]
      : []),
    ...(isAdmin
      ? [{ href: "/dashboard/admin/users", label: "Users", icon: Users }]
      : []),
  ], [isAdmin, isSO]);

  const bottomNavigationItems = [
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/help", label: "Help", icon: HelpCircle },
  ];

  // ADD LOGGING FOR NAVIGATION ITEMS
  useEffect(() => {
    console.log('[DashboardSidebar] Navigation items:', {
      mainItems: navigationItems.map(i => i.label),
      bottomItems: bottomNavigationItems.map(i => i.label),
      totalMainItems: navigationItems.length,
      totalBottomItems: bottomNavigationItems.length
    });
  }, [navigationItems, bottomNavigationItems]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  console.log('[DashboardSidebar] Rendering with bottom items:', bottomNavigationItems);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - MODIFIED: Changed to dark blue gradient background */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Header - MODIFIED: Adjusted colors for dark sidebar */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              SIRVA
            </h1>
            <p className="text-xs text-slate-400">
              Security Assessment
            </p>
          </div>
        </div>

        {/* Main Navigation - MODIFIED: Updated text colors for dark sidebar */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              console.log('[DashboardSidebar] Rendering main nav item:', item.label);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation - MODIFIED: Updated colors */}
        <div className="border-t border-slate-700">
          <nav className="px-4 py-4">
            <ul className="space-y-1">
              {bottomNavigationItems.map((item) => {
                console.log('[DashboardSidebar] Rendering bottom nav item:', item.label, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile Section - MODIFIED: Updated colors */}
          <div className="border-t border-slate-700 px-4 py-4">
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={avatarUrl || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Role Badge - MODIFIED: Updated colors */}
            <div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Current Role
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {isAdmin
                  ? "Administrator"
                  : isSO
                  ? "Security Officer"
                  : "Application Manager"}
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;