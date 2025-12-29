"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreGauge({ score, size = 200, strokeWidth = 20 }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Determine color based on score
  const getColor = (value: number) => {
    if (value < 15) return "text-red-500";
    if (value < 50) return "text-orange-500";
    return "text-emerald-500";
  };

  const getGradientId = (value: number) => {
    if (value < 15) return "gradient-red";
    if (value < 50) return "gradient-orange";
    return "gradient-emerald";
  };

  const colorClass = getColor(score);
  
  // SVG calculations for semi-circle
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size / 2 + strokeWidth}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress Arc */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
          fill="none"
          stroke={`url(#${getGradientId(score)})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Score Text */}
      <div className="absolute bottom-0 flex flex-col items-center translate-y-1/4">
        <span className={cn("text-5xl font-bold transition-colors duration-500", colorClass)}>
          {Math.round(displayScore)}
        </span>
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1 dark:text-slate-400">
          Secure Score
        </span>
      </div>
    </div>
  );
}
