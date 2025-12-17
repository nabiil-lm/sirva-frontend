"use client";

import { Card } from "@/components/ui/card";
import {
  FileText,
  CheckCircle2,
  Users,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Questionnaire",
    description:
      "Complete structured security questionnaires with AI-powered coherence validation",
  },
  {
    icon: Zap,
    title: "Instant AI Analysis",
    description:
      "Real-time validation of questionnaire answers and architecture documents",
  },
  {
    icon: CheckCircle2,
    title: "Risk Management",
    description:
      "Create, delegate, and accept security risks with complete audit trails",
  },
  {
    icon: Users,
    title: "Collaborative Workflows",
    description:
      "Seamless coordination between Application Managers and Security Officers",
  },
  {
    icon: Shield,
    title: "Trust & Compliance",
    description:
      "Build verified security credentials and maintain regulatory compliance",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Reporting",
    description:
      "Detailed security score calculations and actionable recommendations",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Powerful Features for Modern Security Assessments
          </h2>
          <p className="text-xl text-slate-600">
            Everything you need to streamline your security validation process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                className="p-8 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/10 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:from-blue-500/20 group-hover:to-emerald-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
