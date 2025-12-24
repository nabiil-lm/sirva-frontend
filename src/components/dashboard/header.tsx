"use client";

import { useAuth } from "@/contexts/auth.context";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search Bar (Visual only for now) */}
        <div className="hidden md:flex items-center relative max-w-md w-64">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <Input 
            placeholder="Search dossiers..." 
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name || user?.email}</p>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
