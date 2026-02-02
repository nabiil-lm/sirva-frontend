"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Send, Loader2, FileText, HelpCircle, 
  LayoutDashboard, BrainCircuit, UploadCloud, ShieldAlert, CheckCircle2, Lock, AlertTriangle,
  ShieldCheck, Plus // Added Plus icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dossierService, { Question } from "@/services/dossier.service";
import { Dossier, DossierStatus } from "@/types/dossier";
import { AnalysisResults } from "@/components/dashboard/AnalysisResults";
import { ArchitectureUpload } from "@/components/dashboard/ArchitectureUpload";
import { IA2Results } from "@/components/dashboard/IA2Results";
import { RiskRegister } from "@/components/dashboard/RiskRegister"; // Import RiskRegister
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth.context"; // Import useAuth

type TabType = 'questionnaire' | 'ia1' | 'documents' | 'ia2' | 'risks';

export default function DossierDetailPage() {
  const { userRole, user } = useAuth(); // Get user role and user object
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidationConfirmOpen, setIsValidationConfirmOpen] = useState(false);
  const [isCreatingRegister, setIsCreatingRegister] = useState(false); // Added state
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('questionnaire');

  // Helper to determine if a tab is "past" (completed stage)
  const isTabPast = (tab: TabType, currentStatus: string): boolean => {
    const stages: TabType[] = ['questionnaire', 'ia1', 'documents', 'ia2', 'risks'];
    
    // Map status to current active stage index
    let currentStageIndex = 0;
    if (currentStatus === DossierStatus.EN_EDITION) currentStageIndex = 0;
    else if ([DossierStatus.QUESTIONNAIRE_SOUMIS, DossierStatus.IA1_INCOHERENT, DossierStatus.IA1_COHERENT].includes(currentStatus as DossierStatus)) currentStageIndex = 1;
    else if (currentStatus === DossierStatus.ARCHI_UPLOAD_EN_COURS) currentStageIndex = 2;
    else if ([DossierStatus.IA2_INCOHERENT, DossierStatus.IA2_COHERENT].includes(currentStatus as DossierStatus)) currentStageIndex = 3;
    else if ([DossierStatus.RISQUES_EN_COURS, DossierStatus.PRET_VALIDATION, DossierStatus.VALIDE].includes(currentStatus as DossierStatus)) currentStageIndex = 4;

    const tabIndex = stages.indexOf(tab);
    return tabIndex < currentStageIndex;
  };

  useEffect(() => {
    if (id) fetchDossierData();
  }, [id]);

  const fetchDossierData = async () => {
    try {
      setIsLoading(true);
      const dossierData = await dossierService.getDossier(id);
      setDossier(dossierData);

      // Determine initial tab based on status if it's the first load
      if (dossierData.status === DossierStatus.EN_EDITION) {
        setActiveTab('questionnaire');
      } else if (dossierData.status === DossierStatus.QUESTIONNAIRE_SOUMIS || 
                 dossierData.status === DossierStatus.IA1_COHERENT || 
                 dossierData.status === DossierStatus.IA1_INCOHERENT) {
        setActiveTab('ia1');
      } else if (dossierData.status === DossierStatus.ARCHI_UPLOAD_EN_COURS) {
        setActiveTab('documents');
      } else if (dossierData.status === DossierStatus.IA2_COHERENT || 
                 dossierData.status === DossierStatus.IA2_INCOHERENT) {
        setActiveTab('ia2');
      } else if (dossierData.status === DossierStatus.RISQUES_EN_COURS) {
        setActiveTab('risks');
      }

      if (dossierData.questionnaire_template) {
        const templateData = await dossierService.getTemplateWithQuestions(dossierData.questionnaire_template);
        setQuestions(templateData.questions);

        const answersData = await dossierService.getDossierAnswers(id);
        const answersMap: Record<number, string> = {};
        answersData.forEach(a => {
          answersMap[a.question] = a.answer_value;
        });
        setAnswers(answersMap);
      }
    } catch (error) {
      console.error("Failed to load dossier", error);
      toast.error("Failed to load dossier details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiChoiceChange = (questionId: number, choice: string, checked: boolean) => {
    const currentVal = answers[questionId] ? answers[questionId].split(',') : [];
    let newVal: string[];
    if (checked) {
      newVal = [...currentVal, choice];
    } else {
      newVal = currentVal.filter(c => c !== choice);
    }
    handleAnswerChange(questionId, newVal.join(','));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const answersList = Object.entries(answers).map(([qId, val]) => ({
        question: parseInt(qId),
        answer_value: val
      }));
      await dossierService.saveAnswers(id, answersList);
      toast.success("Progress saved successfully");
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save progress");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    const missingMandatory = questions.filter(q => 
      q.is_mandatory && (!answers[q.id] || answers[q.id].trim() === "")
    );

    if (missingMandatory.length > 0) {
      toast.error(`Please answer all mandatory questions (${missingMandatory.length} remaining)`);
      return;
    }

    setIsSubmitConfirmOpen(true);
  };

  const executeSubmit = async () => {
    setIsSubmitConfirmOpen(false);
    setIsSubmitting(true);
    try {
      const answersList = Object.entries(answers).map(([qId, val]) => ({
        question: parseInt(qId),
        answer_value: val
      }));
      await dossierService.saveAnswers(id, answersList);
      await dossierService.submitDossier(id);
      toast.success("Dossier submitted successfully!");
      await fetchDossierData();
      setActiveTab('ia1');
    } catch (error) {
      console.error("Submit failed", error);
      toast.error("Failed to submit dossier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRiskRegister = async () => {
    setIsCreatingRegister(true);
    try {
      await dossierService.createRiskRegister(id);
      toast.success("Risk Register initialized successfully");
      await fetchDossierData();
    } catch (error) {
      console.error("Failed to create register", error);
      toast.error("Failed to create Risk Register");
    } finally {
      setIsCreatingRegister(false);
    }
  };

  const handleValidation = async () => {
    setIsValidationConfirmOpen(false);
    setIsValidating(true);
    try {
      await dossierService.validateDossier(id);
      toast.success("Dossier validated successfully!");
      await fetchDossierData();
    } catch (error) {
      console.error("Validation failed", error);
      toast.error("Failed to validate dossier");
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!dossier) return <div className="p-8 text-center">Dossier not found</div>;

  const isSO = userRole === 'SO' || userRole === 'security_officer';
  // Force read-only if status is not EN_EDITION OR if user is an SO
  const isReadOnly = dossier.status !== DossierStatus.EN_EDITION || isSO;
  const isCurrentTabPast = isTabPast(activeTab, dossier.status);

  const navItems = [
    {
      id: 'questionnaire',
      label: 'Questionnaire',
      icon: LayoutDashboard,
      enabled: true,
      description: isReadOnly ? 'View answers' : 'Fill out assessment'
    },
    {
      id: 'ia1',
      label: 'IA1 Analysis',
      icon: BrainCircuit,
      enabled: dossier.status !== DossierStatus.EN_EDITION,
      description: 'Coherence check results'
    },
    {
      id: 'documents',
      label: 'Architecture Docs',
      icon: UploadCloud,
      enabled: [
        DossierStatus.ARCHI_UPLOAD_EN_COURS,
        DossierStatus.IA2_INCOHERENT,
        DossierStatus.IA2_COHERENT,
        DossierStatus.RISQUES_EN_COURS,
        DossierStatus.PRET_VALIDATION,
        DossierStatus.VALIDE
      ].includes(dossier.status as DossierStatus),
      description: 'Upload & review docs'
    },
    {
      id: 'ia2',
      label: 'IA2 Analysis',
      icon: ShieldAlert,
      enabled: [
        DossierStatus.IA2_INCOHERENT,
        DossierStatus.IA2_COHERENT,
        DossierStatus.RISQUES_EN_COURS,
        DossierStatus.PRET_VALIDATION,
        DossierStatus.VALIDE
      ].includes(dossier.status as DossierStatus),
      description: 'Cross-check results'
    },
    {
      id: 'risks',
      label: 'Risk Register',
      icon: Lock,
      enabled: [
        DossierStatus.RISQUES_EN_COURS,
        DossierStatus.PRET_VALIDATION,
        DossierStatus.VALIDE
      ].includes(dossier.status as DossierStatus),
      description: 'Manage identified risks'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{dossier.title}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <FileText className="h-3.5 w-3.5" />
                <span>{dossier.questionnaire_template_name || "Untitled Template"}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className={`font-medium ${isReadOnly ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {dossier.status_display || dossier.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isReadOnly && activeTab === 'questionnaire' && (
              <>
                <Button variant="outline" onClick={handleSave} disabled={isSaving || isSubmitting}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Draft
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submit Assessment
                </Button>
              </>
            )}

            {/* Create Risk Register Button for SO */}
            {isSO && activeTab === 'risks' && !dossier.risk_register && (
              <Button 
                onClick={handleCreateRiskRegister} 
                disabled={isCreatingRegister} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isCreatingRegister ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Initialize Risk Register
              </Button>
            )}

            {/* Validation Button for SO */}
            {isSO && (
              dossier.status === DossierStatus.PRET_VALIDATION || 
              (dossier.status === DossierStatus.RISQUES_EN_COURS && !dossier.risk_register)
            ) && (
              <Button 
                onClick={() => setIsValidationConfirmOpen(true)} 
                disabled={isValidating} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Validate Dossier
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3 space-y-2">
            <div className="sticky top-24 space-y-2">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 dark:text-slate-400">
                Dossier Stages
              </h3>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.enabled && setActiveTab(item.id as TabType)}
                  disabled={!item.enabled}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                    activeTab === item.id 
                      ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" 
                      : "hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-400",
                    !item.enabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 p-1.5 rounded-md",
                    activeTab === item.id ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs opacity-80">{item.description}</div>
                  </div>
                  {activeTab === item.id && (
                    <div className="ml-auto self-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            
            {/* TAB: QUESTIONNAIRE */}
            {activeTab === 'questionnaire' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Questionnaire</h2>
                  {isReadOnly && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900/30 dark:text-emerald-400">
                      {isSO ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          Read-Only View (Security Officer)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Submitted (Read-Only)
                        </>
                      )}
                    </span>
                  )}
                </div>

                {questions.map((q, index) => (
                  <div 
                    key={q.id} 
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-800"
                  >
                    {/* Question Header */}
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-slate-900 dark:text-white">{q.text}</h3>
                          {q.is_mandatory && (
                            <span className="text-xs font-medium text-red-500">*Required</span>
                          )}
                        </div>
                        {q.help_text && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{q.help_text}</p>
                        )}
                      </div>
                    </div>

                    {/* Question Input Area */}
                    <div className="pl-12">
                      {/* TRUE / FALSE */}
                      {q.question_type === 'TRUE_FALSE' && (
                        <div className="flex gap-4">
                          {['True', 'False'].map((option) => (
                            <label key={option} className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                              isReadOnly ? "cursor-default" : "hover:bg-slate-50 dark:hover:bg-slate-800",
                              answers[q.id] === option.toLowerCase() 
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500" 
                                : "border-slate-200 dark:border-slate-700"
                            )}>
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={option.toLowerCase()}
                                checked={answers[q.id] === option.toLowerCase()}
                                onChange={(e) => !isReadOnly && handleAnswerChange(q.id, e.target.value)}
                                disabled={isReadOnly}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800"
                              />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* SINGLE CHOICE */}
                      {q.question_type === 'SINGLE_CHOICE' && (
                        <div className="space-y-3">
                          {q.choices_json.map((choice) => (
                            <label key={choice} className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                              isReadOnly ? "cursor-default" : "hover:bg-slate-50 dark:hover:bg-slate-800",
                              answers[q.id] === choice 
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500" 
                                : "border-slate-200 dark:border-slate-700"
                            )}>
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={choice}
                                checked={answers[q.id] === choice}
                                onChange={(e) => !isReadOnly && handleAnswerChange(q.id, e.target.value)}
                                disabled={isReadOnly}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">{choice}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* MULTIPLE CHOICE */}
                      {q.question_type === 'MULTIPLE_CHOICE' && (
                        <div className="space-y-3">
                          {q.choices_json.map((choice) => {
                            const isChecked = (answers[q.id] || '').split(',').includes(choice);
                            return (
                              <label key={choice} className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                                isReadOnly ? "cursor-default" : "hover:bg-slate-50 dark:hover:bg-slate-800",
                                isChecked 
                                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500" 
                                  : "border-slate-200 dark:border-slate-700"
                              )}>
                                <input
                                  type="checkbox"
                                  value={choice}
                                  checked={isChecked}
                                  onChange={(e) => !isReadOnly && handleMultiChoiceChange(q.id, choice, e.target.checked)}
                                  disabled={isReadOnly}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-800"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{choice}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* TEXT */}
                      {q.question_type === 'TEXT' && (
                        <Textarea
                          placeholder="Type your answer here..."
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          disabled={isReadOnly}
                          className="min-h-[120px] resize-y border-slate-200 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-600 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                        />
                      )}
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center dark:bg-slate-900 dark:border-slate-800">
                    <HelpCircle className="mb-4 h-10 w-10 text-slate-400" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No questions found</h3>
                    <p className="text-slate-500 dark:text-slate-400">This template doesn&apos;t have any questions yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: IA1 ANALYSIS */}
            {activeTab === 'ia1' && (
              <AnalysisResults 
                dossier={dossier} 
                onContinue={() => setActiveTab('documents')}
                // ReadOnly if tab is past OR if user is SO (SO cannot click "Proceed")
                isReadOnly={(isCurrentTabPast && dossier.status !== DossierStatus.ARCHI_UPLOAD_EN_COURS) || isSO} 
              />
            )}

            {/* TAB: DOCUMENTS */}
            {activeTab === 'documents' && (
              <ArchitectureUpload 
                dossier={dossier}
                onUploadComplete={fetchDossierData}
                onSubmitComplete={() => {
                  fetchDossierData();
                  setActiveTab('ia2');
                }}
                // ReadOnly if tab is past OR if user is SO (SO cannot upload/submit)
                isReadOnly={isCurrentTabPast || isSO} 
              />
            )}

            {/* TAB: IA2 ANALYSIS */}
            {activeTab === 'ia2' && (
              <IA2Results 
                dossier={dossier}
                onContinue={() => setActiveTab('risks')}
                // ReadOnly if tab is past OR if user is SO (SO cannot click "Proceed")
                // Allow proceed if status is RISQUES_EN_COURS (next stage) so AM can move forward
                isReadOnly={(isCurrentTabPast && dossier.status !== DossierStatus.RISQUES_EN_COURS) || isSO} 
              />
            )}

            {/* TAB: RISKS */}
            {activeTab === 'risks' && (
              dossier.risk_register ? (
                <RiskRegister 
                  dossier={dossier}
                  userRole={userRole}
                  currentUser={user}
                  onUpdate={fetchDossierData}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 dark:bg-slate-800">
                    <Lock className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Risk Register Not Initialized</h3>
                  <p className="text-slate-500 max-w-md text-center mt-2 dark:text-slate-400">
                    The risk register has not been created yet. 
                    {isSO ? " Please initialize it using the button above to start identifying risks." : " Waiting for the Security Officer to initialize it."}
                  </p>
                </div>
              )
            )}

          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Submission */}
      <Dialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
        <DialogContent className="sm:max-w-[450px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 dark:bg-amber-900/30">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            </div>
            <DialogTitle className="text-center text-xl dark:text-white">Confirm Submission</DialogTitle>
            <DialogDescription className="text-center pt-2 dark:text-slate-400">
              Are you sure you want to submit this assessment?
              <br /><br />
              <span className="font-medium text-slate-900 dark:text-white">This action cannot be undone.</span>
              <br />
              Once submitted, you will no longer be able to edit your answers, and the IA1 analysis will begin immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsSubmitConfirmOpen(false)}
              className="w-full sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={executeSubmit}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              Yes, Submit Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Validation */}
      <Dialog open={isValidationConfirmOpen} onOpenChange={setIsValidationConfirmOpen}>
        <DialogContent className="sm:max-w-[450px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 dark:bg-emerald-900/30">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <DialogTitle className="text-center text-xl dark:text-white">Confirm Final Validation</DialogTitle>
            <DialogDescription className="text-center pt-2 dark:text-slate-400">
              Are you sure you want to validate this dossier?
              <br /><br />
              This will mark the assessment as <strong>VALIDATED</strong> and complete the process.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsValidationConfirmOpen(false)}
              className="w-full sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleValidation}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Validation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
