"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Shield, Lock, Zap } from "lucide-react";

export function HeroSection() {
  const [progressFilled, setProgressFilled] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setProgressFilled(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToExplanation = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-sm font-medium text-blue-900">
                  Streamline Your Security Assessments
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900">
                Build Trust Faster with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Intelligent Validation
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                SIRVA simplifies security assessments through AI-powered analysis
                and collaborative workflows. Enable faster validation while
                maintaining complete audit accountability.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-3">
              {[
                "AI-powered coherence validation",
                "Real-time collaborative workflows",
                "Complete audit trails",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <a href="/auth/login">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToExplanation}
                className="border-slate-300 hover:bg-slate-50"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Column - Enhanced Illustration */}
          <div className="relative h-96 lg:h-full flex items-center justify-center">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute bottom-20 left-5 w-40 h-40 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Main illustration container */}
            <div className="relative space-y-6 w-full px-6 z-10">
              {/* Top decorative element - Shield with checkmark */}
              <div className="flex justify-end mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-lg opacity-30 w-16 h-16"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Buyer/Vendor Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      B
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Buyer/Vendor
                      </p>
                      <p className="text-xs text-slate-500">Assessment Ready</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    VALIDATED
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Security assessment status verified
                </p>
                {/* Animated Progress bar */}
                <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out ${
                      progressFilled ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Connecting arrow with icon */}
              <div className="flex justify-center py-2">
                <div className="flex flex-col items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-full"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-emerald-500 flex items-center justify-center text-white shadow-md">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full"></div>
                </div>
              </div>

              {/* Security Officer Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                      SO
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Security Officer
                      </p>
                      <p className="text-xs text-slate-500">Full Oversight</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    APPROVED
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Complete assessment workflow oversight
                </p>
                {/* Animated Progress bar */}
                <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-1000 ease-out ${
                      progressFilled ? "w-5/6" : "w-0"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Bottom decorative element */}
              <div className="flex justify-start mt-8">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-slate-600">
                    Live Validation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
