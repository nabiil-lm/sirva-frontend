"use client";

import { Card } from "@/components/ui/card";
import {
  FileUp,
  Brain,
  CheckCheck,
  AlertCircle,
  Trophy,
} from "lucide-react";

const phases = [
  {
    icon: FileUp,
    number: "1",
    title: "Questionnaire & Initial Assessment",
    description:
      "Application Managers fill out security questionnaires. Our AI (IA1) automatically analyzes responses for coherence and completeness.",
    points: [
      "Structured security questionnaire templates",
      "Real-time validation feedback",
      "Automatic coherence scoring",
      "Detailed findings and recommendations",
    ],
  },
  {
    icon: Brain,
    number: "2",
    title: "Architecture Documentation & Cross-Check",
    description:
      "Upload architecture documents for AI-powered cross-verification against questionnaire answers. Ensure consistency and completeness.",
    points: [
      "Document upload and management",
      "AI cross-validation analysis (IA2)",
      "Discrepancy identification",
      "Revision guidance for accuracy",
    ],
  },
  {
    icon: CheckCheck,
    number: "3",
    title: "Risk Register & Acceptance Workflow",
    description:
      "Security Officers create risk items. Application Managers review, accept, delegate, or contest risks with complete traceability.",
    points: [
      "Collaborative risk management",
      "Delegation and approval workflows",
      "Risk status tracking",
      "Complete audit history",
    ],
  },
  {
    icon: Trophy,
    number: "4",
    title: "Validation & Certification",
    description:
      "Once all risks are accepted, the assessment is ready for final validation and your organization receives formal certification.",
    points: [
      "Final security validation",
      "Certification issuance",
      "Trust badge generation",
      "Ongoing compliance monitoring",
    ],
  },
];

const roles = [
  {
    icon: AlertCircle,
    role: "Application Manager (AM)",
    description: "Create dossiers, answer questionnaires, manage assessments",
    responsibilities: [
      "Submit security questionnaires",
      "Upload architecture documents",
      "Review and accept/contest risks",
      "Ensure assessment completion",
    ],
  },
  {
    icon: Trophy,
    role: "Security Officer (SO)",
    description: "Oversee and validate security assessments",
    responsibilities: [
      "Review submitted questionnaires",
      "Create risk items",
      "Approve final assessments",
      "Issue security certifications",
    ],
  },
];

export function ExplanationSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Process */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              How SIRVA Works
            </h2>
            <p className="text-xl text-slate-600">
              A streamlined 4-phase process for comprehensive security assessments
            </p>
          </div>

          <div className="space-y-8">
            {phases.map((phase, i) => {
              const Icon = phase.icon;
              return (
                <Card
                  key={i}
                  className="overflow-hidden border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  <div className="grid md:grid-cols-3 gap-6 p-8">
                    {/* Icon & Number */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur opacity-30"></div>
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center">
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          Phase {phase.number}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                          {phase.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {phase.description}
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 pt-2">
                        {phase.points.map((point, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                            </div>
                            <span className="text-sm text-slate-700">
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Roles */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              Key Roles & Responsibilities
            </h3>
            <p className="text-slate-600">
              SIRVA enables seamless collaboration between different user types
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <Card
                  key={i}
                  className="p-8 border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500/10 to-emerald-500/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {role.role}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    {role.responsibilities.map((resp, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                        <span className="text-sm text-slate-700">{resp}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
