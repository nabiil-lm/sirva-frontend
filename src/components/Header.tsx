"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 w-full border-b border-slate-200 bg-white/95 backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 group-hover:shadow-lg transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">SIRVA</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              asChild
              className="border-slate-300 hover:bg-slate-50"
            >
              <a href="/auth/login">Log In</a>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <a href="/auth/login">Get Started</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
