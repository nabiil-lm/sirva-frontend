"use client";

import React from "react";
import { ScoreGauge } from "./ScoreGauge";
import { AlertCircle, CheckCircle2, FileText, ArrowRight, ShieldCheck, AlertTriangle, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dossier } from "@/types/dossier";

interface Finding {
  summary?: string;
  analysis?: string;
  analysis_text?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  raw_response?: string;
  [key: string]: string | string[] | undefined;
}

// Helper to render text with bold formatting (**text**)
const renderBoldText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

interface IA2ResultsProps {
  dossier: Dossier;
  onContinue?: () => void;
  isReadOnly?: boolean; // NEW PROP
}

export function IA2Results({ dossier, onContinue, isReadOnly = false }: IA2ResultsProps) {
  // Safe access to IA2 results
  const iaResult = dossier.ia2_result || {
    secure_score: 0,
    findings: { summary: "Analysis pending or unavailable." },
    status: "PENDING",
    raw_response: ""
  };

  const score = iaResult.secure_score || 0;
  const isPassing = score >= 50; // Higher threshold for IA2 usually
  
  let findings = (typeof iaResult.findings === 'string' 
    ? { summary: iaResult.findings } 
    : (iaResult.findings || {})) as Finding;

  // Fallback parsing logic
  if ((!findings.strengths || !findings.weaknesses) && (iaResult.raw_response || findings.raw_response)) {
    try {
      const raw = (iaResult.raw_response || findings.raw_response) as string;
      const cleanJson = raw.replace(/```json\s*|\s*```/g, '').trim();
      const jsonMatch = cleanJson.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanJson;
      const parsed = JSON.parse(jsonString);
      findings = { ...findings, ...parsed };
    } catch (e) {
      console.warn("Failed to parse raw_response in frontend fallback", e);
    }
  }

  let summaryText = findings.summary || findings.analysis || findings.analysis_text;
  if (!summaryText && (iaResult.raw_response || findings.raw_response)) {
      const raw = (iaResult.raw_response || findings.raw_response) as string;
      summaryText = raw.replace(/```json|```/g, '');
  }
  if (!summaryText) summaryText = "No summary available.";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">IA2 Cross-Check Results</h2>
        <p className="text-slate-500">
          Comparison between questionnaire responses and architecture documents.
        </p>
      </div>

      <Card className="p-8 border-slate-200 shadow-sm bg-white flex flex-col items-center justify-center min-h-[300px]">
        <ScoreGauge score={score} size={280} />
        <div className="mt-12 text-center max-w-md">
          {isPassing ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Architecture Validated</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-600 font-medium mb-2">
              <AlertCircle className="w-5 h-5" />
              <span>Inconsistencies Detected</span>
            </div>
          )}
          <p className="text-slate-600">
            {isPassing 
              ? "Your architecture documentation supports your security claims."
              : "Discrepancies found between your answers and the provided documents."}
          </p>
        </div>
      </Card>

      <Card className="p-8 border-slate-200 shadow-sm bg-white">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900">Analysis Summary</h3>
        </div>
        <div className="space-y-8">
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Executive Summary</h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
              {renderBoldText(summaryText)}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {findings.strengths && findings.strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Validated Points</h4>
                </div>
                <ul className="space-y-2">
                  {findings.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>{renderBoldText(s)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {findings.weaknesses && findings.weaknesses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm font-bold text-red-700 uppercase tracking-wide">Discrepancies</h4>
                </div>
                <ul className="space-y-2">
                  {findings.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{renderBoldText(w)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-8 border-slate-200 shadow-sm bg-white">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-bold text-slate-900">Recommendations</h3>
        </div>
        <div className="space-y-6">
           {findings.recommendations && findings.recommendations.length > 0 ? (
              <div className="grid gap-3">
                {findings.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{renderBoldText(rec)}</p>
                  </div>
                ))}
              </div>
           ) : (
             <div className="text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center">
               No specific recommendations generated.
             </div>
           )}
           
           {isPassing && onContinue && (
            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
              <Button 
                onClick={onContinue} 
                disabled={isReadOnly} // Disable if viewing history
                size="lg" 
                className={`text-white group px-8 ${isReadOnly ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isReadOnly ? "Step Completed" : "Proceed to Risk Register"}
                {!isReadOnly && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
