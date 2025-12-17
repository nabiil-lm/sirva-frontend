"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                Ready to streamline your security assessments?
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Start Your Security Assessment Today
            </h2>

            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join organizations that trust SIRVA for faster, more reliable
              security validations. Get started free—no credit card required.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all font-semibold px-8"
          >
            <a href="/auth/login">
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
