"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth.context";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils";

export function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Logic to determine what to display
  const hasName = user.first_name || user.last_name;

  // Line 1: Name (if exists) OR Email
  const displayName = hasName
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : user.email;

  // Line 2: Email (if name exists) OR Role/Empty
  const secondaryText = hasName
    ? user.email
    : user.role?.replace("_", " ") || "User";

  // Initials for fallback
  const initials = hasName
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 px-3 flex items-center gap-4 rounded-full bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <div className="flex flex-col items-end text-right hidden md:flex space-y-0.5">
            <span className="text-sm font-semibold text-slate-900 leading-none">
              {displayName}
            </span>
            <span className="text-xs text-slate-500 truncate max-w-[180px] capitalize leading-none">
              {secondaryText}
            </span>
          </div>
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarImage
              src={getMediaUrl(user.avatar)}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none dark:text-white">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground dark:text-slate-400">
              {/* CHANGED: Force lowercase for email display */}
              {user?.email?.toLowerCase()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="w-full cursor-pointer dark:text-slate-200 dark:focus:bg-slate-800"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuItem
          onClick={() => logout()}
          className="text-red-600 cursor-pointer dark:text-red-400 dark:focus:bg-slate-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
