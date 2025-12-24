"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center justify-center align-middle">
        <input
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-slate-200 ring-offset-white transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-slate-950 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            checked ? "bg-slate-900 text-slate-50 border-slate-900" : "bg-white",
            className
          )}
        >
          {checked && <Check className="h-3 w-3" strokeWidth={3} />}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
