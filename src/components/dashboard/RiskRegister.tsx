"use client";

import { useState } from "react";
import { 
  AlertTriangle, HelpCircle, ShieldAlert, 
  UserPlus, Gavel, Plus, Trash2, Edit, Send,
  Share2 // Added Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import dossierService, { SecurityOfficer } from "@/services/dossier.service";
import { 
  Dossier, RiskItem, RiskItemStatus, RiskStatus, 
  RiskLikelihood, RiskImpact 
} from "@/types/dossier";
import { cn } from "@/lib/utils";
import { User } from "@/contexts/auth.context";

interface RiskRegisterProps {
  dossier: Dossier;
  userRole: string | null;
  currentUser: User | null;
  onUpdate: () => void;
}

export function RiskRegister({ dossier, userRole, currentUser, onUpdate }: RiskRegisterProps) {
  const riskRegister = dossier.risk_register;
  const isSO = userRole === 'SO' || userRole === 'security_officer';
  const isAM = userRole === 'AM' || userRole === 'application_manager';
  
  // User info for delegation
  // const [availableUsers, setAvailableUsers] = useState<SecurityOfficer[]>([]); // Using SO type for generic user list
  
  // Action States
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // SO Draft Management States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // AM Action States
  const [isDelegateOpen, setIsDelegateOpen] = useState(false);
  const [isContestOpen, setIsContestOpen] = useState(false);
  const [contestReason, setContestReason] = useState("");
  const [selectedDelegate, setSelectedDelegate] = useState("");

  // SO Review State
  const [isSoReviewOpen, setIsSoReviewOpen] = useState(false);

  // Form Data for Add/Edit Risk
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    likelihood: "POSSIBLE",
    impact: "MODERATE",
    level: "MEDIUM",
    mitigation: ""
  });

  if (!riskRegister) return null;

  const isDraft = riskRegister.status === RiskStatus.DRAFT;

  // --- Helpers ---

  const calculateRiskLevel = (likelihood: string, impact: string): string => {
    const lMap: Record<string, number> = { RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5 };
    const iMap: Record<string, number> = { MINOR: 1, MODERATE: 2, MAJOR: 3, SEVERE: 4, CATASTROPHIC: 5 };
    
    const score = (lMap[likelihood] || 0) * (iMap[impact] || 0);
    
    if (score >= 15) return "CRITICAL";
    if (score >= 9) return "HIGH";
    if (score >= 4) return "MEDIUM";
    return "LOW";
  };

  const handleFormChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    
    // Auto-calculate level if likelihood or impact changes
    if (field === 'likelihood' || field === 'impact') {
      newData.level = calculateRiskLevel(newData.likelihood, newData.impact);
    }
    
    setFormData(newData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      likelihood: "POSSIBLE",
      impact: "MODERATE",
      level: "MEDIUM",
      mitigation: ""
    });
  };

  // --- SO Actions (Draft Mode) ---

  const handleAddRisk = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await dossierService.createRiskItem(dossier.id.toString(), riskRegister.id, formData);
      toast.success("Risk item added");
      setIsAddOpen(false);
      resetForm();
      onUpdate();
    } catch (error) {
      toast.error("Failed to add risk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditRisk = (item: RiskItem) => {
    setSelectedRisk(item);
    setFormData({
      title: item.title,
      description: item.description,
      likelihood: item.likelihood,
      impact: item.impact,
      level: item.level,
      mitigation: item.mitigation
    });
    setIsEditOpen(true);
  };

  const handleEditRisk = async () => {
    if (!selectedRisk || !formData.title) return;
    setIsSubmitting(true);
    try {
      await dossierService.updateRiskItem(dossier.id.toString(), riskRegister.id, selectedRisk.id, formData);
      toast.success("Risk item updated");
      setIsEditOpen(false);
      resetForm();
      onUpdate();
    } catch (error) {
      toast.error("Failed to update risk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRisk = async () => {
    if (!selectedRisk) return;
    setIsSubmitting(true);
    try {
      await dossierService.deleteRiskItem(dossier.id.toString(), riskRegister.id, selectedRisk.id);
      toast.success("Risk item deleted");
      setIsDeleteOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete risk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishRegister = async () => {
    setIsSubmitting(true);
    try {
      await dossierService.submitRiskRegister(dossier.id.toString(), riskRegister.id);
      toast.success("Risk Register published successfully");
      setIsPublishOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to publish register");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- AM Actions ---

  const handleAcceptRisk = async (item: RiskItem) => {
    try {
      // If delegated to current user
      if (item.delegated_to === parseInt(dossier.am.id.toString()) || (dossier.am.email === userRole)) { // Fallback check
         // Logic handled by backend permission check mostly
      }

      if (item.delegated_to) {
        await dossierService.performDelegationAction(dossier.id.toString(), riskRegister.id, {
          risk_item_id: item.id,
          action: 'accept'
        });
      } else {
        await dossierService.performAmRiskAction(dossier.id.toString(), riskRegister.id, {
          risk_item_id: item.id,
          action: 'accept'
        });
      }
      toast.success("Risk accepted");
      onUpdate();
    } catch (error) {
      toast.error("Failed to accept risk");
    }
  };

  const handleDelegateRisk = async () => {
    if (!selectedRisk || !selectedDelegate) return;
    try {
      await dossierService.performAmRiskAction(dossier.id.toString(), riskRegister.id, {
        risk_item_id: selectedRisk.id,
        action: 'delegate',
        delegate_user_email: selectedDelegate
      });
      toast.success(`Risk delegated to ${selectedDelegate}`);
      setIsDelegateOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to delegate risk");
    }
  };

  const handleContestRisk = async () => {
    if (!selectedRisk || !contestReason) return;
    try {
      await dossierService.performAmRiskAction(dossier.id.toString(), riskRegister.id, {
        risk_item_id: selectedRisk.id,
        action: 'contest',
        contest_reason: contestReason
      });
      toast.success("Risk contested");
      setIsContestOpen(false);
      setContestReason("");
      onUpdate();
    } catch (error) {
      toast.error("Failed to contest risk");
    }
  };

  const handleRefuseDelegation = async (item: RiskItem) => {
    try {
      await dossierService.performDelegationAction(dossier.id.toString(), riskRegister.id, {
        risk_item_id: item.id,
        action: 'refuse'
      });
      toast.success("Delegation refused");
      onUpdate();
    } catch (error) {
      toast.error("Failed to refuse delegation");
    }
  };

  // --- SO Review Actions ---

  const handleSoReview = async (action: 'accept' | 'refuse') => {
    if (!selectedRisk) return;
    try {
      await dossierService.reviewContest(dossier.id.toString(), riskRegister.id, selectedRisk.id, action);
      toast.success(action === 'accept' ? "Contestation accepted (Risk Invalidated)" : "Contestation refused");
      setIsSoReviewOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to review contestation");
    }
  };

  // --- Render Helpers ---

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return <Badge className={colors[level] || "bg-slate-100 dark:bg-slate-800"}>{level}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      DELEGATED_PENDING: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
      ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
      CONTESTED: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
      REFUSED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
      INVALIDATED: "bg-gray-100 text-gray-500 border-gray-200 line-through dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getBorderColor = (level: string): string => {
    if (level === "CRITICAL") return "border-l-red-500";
    if (level === "HIGH") return "border-l-orange-500";
    if (level === "MEDIUM") return "border-l-blue-500";
    return "border-l-blue-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Risk Register
            <Badge variant="outline" className="ml-2 dark:text-slate-300 dark:border-slate-700">
              {riskRegister.status.replace('_', ' ')}
            </Badge>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isDraft 
              ? "Draft mode: Define risks before publishing to the Application Manager." 
              : "Manage and mitigate identified security risks."}
          </p>
        </div>
        
        {isSO && isDraft && (
          <div className="flex gap-2">
            <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add Risk
            </Button>
            {riskRegister.items.length > 0 && (
              <Button 
                onClick={() => setIsPublishOpen(true)} 
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Send className="w-4 h-4 mr-2" /> Publish Register
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Risk List */}
      <div className="space-y-4">
        {riskRegister.items.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No risks identified</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {isSO && isDraft ? "Click 'Add Risk' to start populating the register." : "The risk register is currently empty."}
            </p>
          </div>
        ) : (
          riskRegister.items.map((item) => {
            // Determine user permissions for this item
            // Note: userRole is passed as string (e.g. 'AM' or 'SO') or email sometimes depending on context
            // Ideally we check against user ID, but for now we use role checks
            
            // Check if current user is the delegatee
            // Robust check using both email and ID if available
            const isDelegatedToMe = Boolean(
              (currentUser?.email && item.delegated_to_user?.email === currentUser.email) ||
              (currentUser?.id && item.delegated_to === Number(currentUser.id))
            );
            
            const canEdit = isSO && isDraft;
            const canAction = isAM && !isDraft && item.status !== RiskItemStatus.ACCEPTED && item.status !== RiskItemStatus.INVALIDATED;
            
            return (
              <Card key={item.id} className={cn(
                "overflow-hidden transition-all border-l-4 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100",
                item.status === RiskItemStatus.ACCEPTED ? "border-l-emerald-500" : getBorderColor(item.level)
              )}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getLevelBadge(item.level)}
                        {getStatusBadge(item.status)}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEditRisk(item)}>
                            <Edit className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedRisk(item); setIsDeleteOpen(true); }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      )}

                      {/* AM Actions - Only for owner or if not delegated */}
                      {canAction && item.status === RiskItemStatus.PENDING && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedRisk(item); setIsContestOpen(true); }}>
                            Contest
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedRisk(item); setIsDelegateOpen(true); }}>
                            Delegate
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAcceptRisk(item)}>
                            Accept
                          </Button>
                        </div>
                      )}

                      {/* Delegation Actions - Only visible to the delegatee */}
                      {/* Removed isAM check here to ensure delegatee sees buttons regardless of role string quirks */}
                      {item.status === RiskItemStatus.DELEGATED_PENDING && isDelegatedToMe && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleRefuseDelegation(item)}>
                            Refuse
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAcceptRisk(item)}>
                            Accept Risk
                          </Button>
                        </div>
                      )}

                      {/* Pending Delegation Indicator for Owner (or anyone who is NOT the delegatee) */}
                      {item.status === RiskItemStatus.DELEGATED_PENDING && !isDelegatedToMe && (
                         <div className="text-sm text-slate-500 italic flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                            <UserPlus className="w-3 h-3" />
                            Waiting for delegatee...
                         </div>
                      )}

                      {/* SO Review Action */}
                      {isSO && !isDraft && item.status === RiskItemStatus.CONTESTED && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setSelectedRisk(item); setIsSoReviewOpen(true); }}>
                          <Gavel className="w-4 h-4 mr-2" /> Review
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Risk Assessment</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-xs text-slate-500 block">Likelihood</span>
                          <span className="font-medium text-slate-900">{item.likelihood}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-xs text-slate-500 block">Impact</span>
                          <span className="font-medium text-slate-900">{item.impact}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mitigation Plan</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg min-h-[60px]">
                        {item.mitigation}
                      </p>
                    </div>
                    
                    {/* Contextual Info Boxes */}
                    {(item.status === RiskItemStatus.CONTESTED || item.contestation_reason) && (
                      <div className="md:col-span-2 bg-amber-50 border border-amber-100 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Contestation Reason
                        </h4>
                        <p className="text-sm text-amber-800">{item.contestation_reason || item.contest_reason}</p>
                      </div>
                    )}
                    {item.delegated_to_user && (
                      <div className="md:col-span-2 bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                          <UserPlus className="w-4 h-4" /> Delegation
                        </h4>
                        <p className="text-sm text-blue-800">
                          Delegated to: <span className="font-medium">{item.delegated_to_user.email}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* --- DIALOGS --- */}

      {/* Add/Edit Risk Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }
      }}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader className="p-6 pb-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                {isEditOpen ? <Edit className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-900 dark:text-white">{isEditOpen ? "Edit Risk" : "Add New Risk"}</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                  Define the risk parameters and mitigation strategy.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium">Risk Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => handleFormChange('title', e.target.value)} 
                placeholder="e.g. Unauthorized Access to DB" 
                className="h-10 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
              <Textarea 
                id="desc" 
                value={formData.description} 
                onChange={(e) => handleFormChange('description', e.target.value)} 
                placeholder="Detailed description of the risk..." 
                className="min-h-[80px] resize-none dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Likelihood</Label>
                <Select value={formData.likelihood} onValueChange={(val) => handleFormChange('likelihood', val)}>
                  <SelectTrigger className="h-10 dark:bg-slate-950 dark:border-slate-700 dark:text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                    {Object.keys(RiskLikelihood).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Impact</Label>
                <Select value={formData.impact} onValueChange={(val) => handleFormChange('impact', val)}>
                  <SelectTrigger className="h-10 dark:bg-slate-950 dark:border-slate-700 dark:text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                    {Object.keys(RiskImpact).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Calculated Risk Level</span>
              <div className="scale-110">
                {getLevelBadge(formData.level)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mitigation" className="text-slate-700 dark:text-slate-300 font-medium">Mitigation Plan</Label>
              <Textarea 
                id="mitigation" 
                value={formData.mitigation} 
                onChange={(e) => handleFormChange('mitigation', e.target.value)} 
                placeholder="Steps to mitigate this risk..." 
                className="min-h-[80px] resize-none dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-2 bg-slate-50/30 dark:bg-slate-900/30">
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="h-10 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button 
              onClick={isEditOpen ? handleEditRisk : handleAddRisk} 
              disabled={isSubmitting}
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditOpen ? "Save Changes" : "Add Risk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl dark:text-white">Delete Risk</DialogTitle>
            <DialogDescription className="text-center pt-2 dark:text-slate-400">
              Are you sure you want to delete this risk item?
              <br />
              <span className="font-medium text-slate-900 dark:text-white">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRisk} disabled={isSubmitting} className="w-full sm:w-auto">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation */}
      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent className="sm:max-w-[450px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-center text-xl dark:text-white">Publish Risk Register</DialogTitle>
            <DialogDescription className="text-center pt-2 dark:text-slate-400">
              Are you sure you want to publish this register? 
              <br/><br/>
              The Application Manager will be notified and can start reviewing the risks. <span className="font-medium text-slate-900 dark:text-white">You will no longer be able to add or remove risks.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPublishOpen(false)} className="w-full sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePublishRegister} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Publish Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delegate Dialog */}
      <Dialog open={isDelegateOpen} onOpenChange={setIsDelegateOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader className="p-6 pb-4 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-900 dark:text-white">Delegate Risk</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                  Assign this risk to another user for acceptance.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk Item</span>
              <p className="font-medium text-slate-900 dark:text-white truncate">{selectedRisk?.title}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delegate-email" className="text-slate-700 dark:text-slate-300 font-medium">Assignee Email</Label>
              <Input 
                id="delegate-email"
                placeholder="colleague@example.com" 
                value={selectedDelegate} 
                onChange={(e) => setSelectedDelegate(e.target.value)} 
                className="h-10 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                The user will be notified and must accept or refuse this risk.
              </p>
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-2 bg-slate-50/30 dark:bg-slate-900/30">
            <Button variant="outline" onClick={() => setIsDelegateOpen(false)} className="h-10 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleDelegateRisk} className="h-10 bg-blue-600 hover:bg-blue-700 text-white">
              <Share2 className="w-4 h-4 mr-2" />
              Delegate Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contest Dialog */}
      <Dialog open={isContestOpen} onOpenChange={setIsContestOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader className="p-6 pb-4 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-900 dark:text-white">Contest Risk</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                  Explain why you believe this risk is invalid or incorrect.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contesting Risk</span>
              <p className="font-medium text-slate-900 dark:text-white truncate">{selectedRisk?.title}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-reason" className="text-slate-700 dark:text-slate-300 font-medium">Reason for Contestation <span className="text-red-500">*</span></Label>
              <Textarea 
                id="contest-reason"
                value={contestReason} 
                onChange={(e) => setContestReason(e.target.value)} 
                placeholder="I believe this risk is invalid because..." 
                className="min-h-[120px] resize-none focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will be sent to the Security Officer for review.
              </p>
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-2 bg-slate-50/30 dark:bg-slate-900/30">
            <Button variant="outline" onClick={() => setIsContestOpen(false)} className="h-10 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleContestRisk} className="h-10 bg-amber-600 hover:bg-amber-700 text-white border-amber-600">
              Submit Contestation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SO Review Dialog */}
      <Dialog open={isSoReviewOpen} onOpenChange={setIsSoReviewOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 dark:bg-slate-900 dark:border-slate-800">
          <div className="bg-purple-50 dark:bg-purple-950/20 p-6 border-b border-purple-100 dark:border-purple-900 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-3">
              <Gavel className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <DialogTitle className="text-xl text-purple-900 dark:text-purple-100">Review Contestation</DialogTitle>
            <DialogDescription className="text-purple-700 dark:text-purple-300 mt-1">
              Reviewing contestation for: <span className="font-medium text-purple-900 dark:text-purple-100">{selectedRisk?.title}</span>
            </DialogDescription>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Contestation Reason:</h4>
              <p className="text-sm text-amber-800 dark:text-amber-300 italic">&quot;{selectedRisk?.contestation_reason || selectedRisk?.contest_reason}&quot;</p>
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p><strong>Accept Contestation:</strong> The risk will be marked as INVALIDATED and removed from the active risk list.</p>
              <p><strong>Refuse Contestation:</strong> The risk will be returned to the AM, who must then accept or delegate it. They cannot contest it again.</p>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIsSoReviewOpen(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={() => handleSoReview('refuse')}
              >
                Refuse (Return to AM)
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleSoReview('accept')}
              >
                Accept (Invalidate Risk)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
