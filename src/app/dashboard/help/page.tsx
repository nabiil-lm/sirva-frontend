"use client";

import { useAuth } from "@/contexts/auth.context";
import { Card } from "@/components/ui/card";
import { 
  HelpCircle, 
  Users, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  FileText,
  Upload,
  GitBranch,
  UserCheck,
  Lock,
  Workflow,
  Target,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HelpPage() {
  const { user, userRole } = useAuth();

  // Determine user role for content filtering
  const isAM = userRole === 'AM' || userRole === 'application_manager';
  const isSO = userRole === 'SO' || userRole === 'security_officer';
  const isAdmin = userRole === 'admin' || userRole === 'ADMIN';

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 sm:px-6 dark:text-slate-100">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Help Center</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Everything you need to know about using SIRVA
            </p>
          </div>
        </div>
        
        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Your Role:</span>
          <Badge className={`${
            isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
            isSO ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          } border-0`}>
            {isAdmin ? 'Administrator' : isSO ? 'Security Officer' : 'Application Manager'}
          </Badge>
        </div>
      </div>

      {/* Content based on role */}
      <div className="space-y-8">
        {/* Admin Content */}
        {isAdmin && <AdminHelpContent />}

        {/* Security Officer Content */}
        {isSO && <SecurityOfficerHelpContent />}

        {/* Application Manager Content */}
        {isAM && <ApplicationManagerHelpContent />}

        {/* Common sections for all roles */}
        <CommonHelpContent />
      </div>
    </div>
  );
}

// ============================================================================
// Application Manager Help Content
// ============================================================================

function ApplicationManagerHelpContent() {
  return (
    <>
      {/* Introduction */}
      <Card className="p-8 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 dark:text-white">Welcome, Application Manager</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-300">
              As an Application Manager (AM), you are responsible for creating and managing security assessment 
              dossiers for your applications. You'll work closely with Security Officers to ensure your applications 
              meet security standards through a structured validation process.
            </p>
          </div>
        </div>
      </Card>

      {/* Your Workflow */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Workflow className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Your Workflow
        </h3>
        
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Create a Dossier",
              description: "Start by creating a new security assessment dossier. Give it a clear title and select the appropriate Security Officer who will review your submission.",
              icon: FileText,
              color: "blue"
            },
            {
              step: 2,
              title: "Complete the Questionnaire",
              description: "Answer all mandatory security questions. The AI (IA1) will automatically analyze your responses for coherence. Aim for a score above 15/100 to proceed.",
              icon: CheckCircle,
              color: "emerald"
            },
            {
              step: 3,
              title: "Upload Architecture Documents",
              description: "Once your questionnaire is approved, upload your application's architecture documentation (diagrams, technical specs, etc.). The AI (IA2) will cross-check these against your questionnaire answers.",
              icon: Upload,
              color: "amber"
            },
            {
              step: 4,
              title: "Manage Risk Items",
              description: "Review risk items created by the Security Officer. You can accept risks, delegate them to team members, or contest them if you disagree with the assessment.",
              icon: AlertCircle,
              color: "red"
            },
            {
              step: 5,
              title: "Final Validation",
              description: "Once all risks are resolved, your dossier will be ready for final validation by the Security Officer. You'll receive your security certification!",
              icon: Shield,
              color: "purple"
            }
          ].map((item) => (
            <Card key={item.step} className="p-6 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${
                  item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  item.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  item.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    item.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    item.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">STEP {item.step}</span>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Working with Security Officers */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Working with Security Officers
        </h3>
        
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Assignment</h4>
                <p className="text-slate-600 dark:text-slate-400">When creating a dossier, you'll select a Security Officer to oversee your assessment. They will review your submissions and create risk items.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Risk Creation</h4>
                <p className="text-slate-600 dark:text-slate-400">Security Officers will create risk items based on their review. Each risk will have a title, description, severity level, and recommended mitigation.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Communication</h4>
                <p className="text-slate-600 dark:text-slate-400">Use the contestation feature to discuss risks you disagree with. Provide clear reasoning - the SO will review and make a final decision.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Risk Management Actions */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <GitBranch className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Risk Management Actions
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 dark:bg-emerald-900/30">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Accept</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Acknowledge the risk and confirm you'll implement the recommended mitigation measures.</p>
          </Card>
          
          <Card className="p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3 dark:bg-blue-900/30">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Delegate</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Assign the risk to another team member who is better positioned to handle it. They must accept or refuse.</p>
          </Card>
          
          <Card className="p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3 dark:bg-amber-900/30">
              <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Contest</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Disagree with the risk assessment? Provide your reasoning and the SO will review your contestation.</p>
          </Card>
        </div>
      </section>
    </>
  );
}

// ============================================================================
// Security Officer Help Content
// ============================================================================

function SecurityOfficerHelpContent() {
  return (
    <>
      {/* Introduction */}
      <Card className="p-8 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 dark:text-white">Welcome, Security Officer</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-300">
              As a Security Officer (SO), you play a critical role in validating security assessments and ensuring 
              applications meet organizational security standards. You'll review submissions, create risk registers, 
              and guide Application Managers through the validation process.
            </p>
          </div>
        </div>
      </Card>

      {/* Your Responsibilities */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Your Responsibilities
        </h3>
        
        <div className="space-y-4">
          {[
            {
              title: "Dossier Assignment",
              description: "Application Managers will assign dossiers to you. You'll receive notifications when new submissions are ready for review.",
              icon: FileText,
              color: "blue"
            },
            {
              title: "Review AI Analysis Results",
              description: "Monitor IA1 (questionnaire coherence) and IA2 (architecture cross-check) results. These AI-powered analyses help identify potential issues early.",
              icon: CheckCircle,
              color: "emerald"
            },
            {
              title: "Create Risk Registers",
              description: "After reviewing the dossier, create a risk register with identified security issues. Each risk should have clear mitigation recommendations.",
              icon: AlertCircle,
              color: "red"
            },
            {
              title: "Review Risk Responses",
              description: "Application Managers will respond to risks by accepting, delegating, or contesting them. Review their actions and provide guidance.",
              icon: MessageSquare,
              color: "amber"
            },
            {
              title: "Handle Contestations",
              description: "When AMs contest a risk, carefully review their reasoning. You can accept the contestation (invalidating the risk) or refuse it (sending it back).",
              icon: GitBranch,
              color: "purple"
            },
            {
              title: "Final Validation",
              description: "Once all risks are resolved, perform final validation and issue security certification. This moves the dossier to VALIDATED status.",
              icon: Lock,
              color: "emerald"
            }
          ].map((item, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${
                  item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  item.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  item.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    item.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    item.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2 dark:text-white">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Working with Application Managers */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Working with Application Managers
        </h3>
        
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Clear Communication</h4>
                <p className="text-slate-600 dark:text-slate-400">When creating risk items, provide clear descriptions and actionable mitigation recommendations. Help AMs understand what needs to be addressed.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Timely Reviews</h4>
                <p className="text-slate-600 dark:text-slate-400">Review submissions promptly to avoid blocking AMs. They depend on your feedback to move forward with their applications.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Contestation Resolution</h4>
                <p className="text-slate-600 dark:text-slate-400">When AMs contest risks, review their arguments objectively. It's okay to invalidate a risk if their reasoning is valid.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Risk Register Management */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Workflow className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Risk Register Best Practices
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3 dark:bg-blue-900/30">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Be Specific</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avoid vague descriptions. Clearly identify the vulnerability, its potential impact, and concrete steps for mitigation.</p>
          </Card>
          
          <Card className="p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3 dark:bg-emerald-900/30">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Prioritize</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Use severity levels appropriately (Critical, High, Medium, Low) to help AMs prioritize which risks to address first.</p>
          </Card>
          
          <Card className="p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3 dark:bg-amber-900/30">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Reference Standards</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">When applicable, reference security frameworks (OWASP, NIST, ISO) to support your risk assessments.</p>
          </Card>
          
          <Card className="p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3 dark:bg-purple-900/30">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Track Progress</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Monitor risk acceptance rates and follow up on items that remain in PENDING status for extended periods.</p>
          </Card>
        </div>
      </section>
    </>
  );
}

// ============================================================================
// Admin Help Content
// ============================================================================

function AdminHelpContent() {
  return (
    <>
      {/* Introduction */}
      <Card className="p-8 border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-900 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/30">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 dark:text-white">Welcome, Administrator</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-300">
              As an Administrator, you have full access to all platform features including user management, 
              template creation, and system oversight. You can view all dossiers and perform administrative 
              actions across the entire system.
            </p>
          </div>
        </div>
      </Card>

      {/* Admin Capabilities */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Lock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          Administrative Capabilities
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 dark:bg-purple-900/30">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">User Management</h4>
            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">Create, edit, and deactivate user accounts. Assign roles (AM, SO, Admin) and manage permissions across the platform.</p>
            <span className="text-xs text-purple-600 font-medium dark:text-purple-400">Dashboard → Users</span>
          </Card>
          
          <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 dark:bg-blue-900/30">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Template Management</h4>
            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">Create and manage questionnaire templates. Define questions, set mandatory fields, and publish templates for use.</p>
            <span className="text-xs text-blue-600 font-medium dark:text-blue-400">Dashboard → Templates</span>
          </Card>
          
          <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 dark:bg-emerald-900/30">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">System Oversight</h4>
            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">View all dossiers across the organization. Monitor progress, intervene when needed, and ensure smooth operations.</p>
            <span className="text-xs text-emerald-600 font-medium dark:text-emerald-400">Dashboard → Dossiers</span>
          </Card>
          
          <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 dark:bg-amber-900/30">
              <Workflow className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">Status Control</h4>
            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">Manually change dossier statuses when needed. Useful for resolving edge cases or correcting workflow issues.</p>
            <span className="text-xs text-amber-600 font-medium dark:text-amber-400">Dossier Detail → Change Status</span>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Target className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          Administrative Best Practices
        </h3>
        
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-purple-900/30">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Delegate Appropriately</h4>
                <p className="text-slate-600 dark:text-slate-400">While you have full access, avoid micromanaging. Trust your SOs to handle their assigned dossiers unless intervention is needed.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-purple-900/30">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Maintain Template Quality</h4>
                <p className="text-slate-600 dark:text-slate-400">Regularly review and update questionnaire templates to reflect evolving security standards and organizational needs.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-purple-900/30">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 dark:text-white">Monitor System Health</h4>
                <p className="text-slate-600 dark:text-slate-400">Keep an eye on dashboard statistics. Look for bottlenecks (too many pending reviews) or unusual patterns that might need attention.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}

// ============================================================================
// Common Help Content (All Roles)
// ============================================================================

function CommonHelpContent() {
  return (
    <>
      {/* Understanding Dossier Statuses */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <Workflow className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Understanding Dossier Statuses
        </h3>
        
        <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-3">
            {[
              { status: 'EN_EDITION', label: 'In Editing', color: 'slate', description: 'Questionnaire is being completed by the AM' },
              { status: 'QUESTIONNAIRE_SOUMIS', label: 'Questionnaire Submitted', color: 'blue', description: 'Submitted for IA1 analysis' },
              { status: 'IA1_COHERENT', label: 'IA1 Approved', color: 'emerald', description: 'Questionnaire passed coherence check (score ≥15)' },
              { status: 'IA1_INCOHERENT', label: 'IA1 Failed', color: 'red', description: 'Questionnaire needs revision (score <15)' },
              { status: 'ARCHI_UPLOAD_EN_COURS', label: 'Architecture Upload', color: 'amber', description: 'AM is uploading architecture documents' },
              { status: 'IA2_COHERENT', label: 'IA2 Approved', color: 'emerald', description: 'Architecture matches questionnaire' },
              { status: 'IA2_INCOHERENT', label: 'IA2 Failed', color: 'red', description: 'Inconsistencies found between docs and questionnaire' },
              { status: 'RISQUES_EN_COURS', label: 'Risk Management', color: 'amber', description: 'SO creates risks, AM responds to them' },
              { status: 'PRET_VALIDATION', label: 'Ready for Validation', color: 'blue', description: 'All risks resolved, awaiting final approval' },
              { status: 'VALIDE', label: 'Validated', color: 'emerald', description: 'Assessment complete and certified' },
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Badge className={`${
                  item.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  item.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  item.color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  item.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                } border-0 font-medium`}>
                  {item.label}
                </Badge>
                <p className="text-sm text-slate-600 flex-1 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* AI Analysis Explained */}
      <section>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 dark:text-white">
          <CheckCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          AI Analysis Explained
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white">IA1: Questionnaire Coherence</h4>
            </div>
            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">
              Analyzes questionnaire responses for completeness, consistency, and security best practices. 
              Provides a secure score (0-100) and detailed feedback on strengths and areas for improvement.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">Pass Threshold:</strong> 15/100 required to proceed
              </p>
            </div>
          </Card>
          
          <Card className="p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white">IA2: Architecture Cross-Check</h4>
            </div>
            <p className="text-sm text-slate-600 mb-3 dark:text-slate-400">
              Cross-validates architecture documents against questionnaire answers. Identifies discrepancies, 
              missing information, or inconsistencies between documentation and stated practices.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">Pass Threshold:</strong> 15/100 required to proceed
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Need More Help? */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200 dark:from-blue-900/10 dark:to-emerald-900/10 dark:border-blue-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md dark:bg-slate-800">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3 dark:text-white">Still Need Help?</h3>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6 dark:text-slate-400">
            If you have questions that aren't covered in this guide, or if you encounter any issues 
            while using SIRVA, please contact your system administrator or the support team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 py-2 px-4">
              📧 support@sirva.com
            </Badge>
          </div>
        </div>
      </Card>
    </>
  );
}
