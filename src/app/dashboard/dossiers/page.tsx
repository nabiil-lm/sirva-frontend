"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Loader2, Folder, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DossierCard } from "@/components/dashboard/DossierCard";
import dossierService, { SecurityOfficer } from "@/services/dossier.service";
import { Dossier, QuestionnaireTemplate } from "@/types/dossier";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth.context";

export default function DossiersPage() {
  const { userRole } = useAuth();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [availableSOs, setAvailableSOs] = useState<SecurityOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDossierTitle, setNewDossierTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedSO, setSelectedSO] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const isAM = userRole === 'AM' || userRole === 'application_manager';

  useEffect(() => {
    fetchData();
  }, [userRole]);

  const fetchData = async () => {
    try {
      const dossiersPromise = dossierService.getDossiers();
      const templatesPromise = dossierService.getAvailableTemplates();
      
      setDossiers(await dossiersPromise);
      setTemplates((await templatesPromise).templates);
      
      // Only fetch SOs if user is AM
      if (isAM) {
        const sosPromise = dossierService.getAvailableSOs();
        setAvailableSOs(await sosPromise);
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load dossiers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    // CHANGED: Added check for selectedSO
    if (!newDossierTitle || !selectedTemplate || !selectedSO) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      await dossierService.createDossier({
        title: newDossierTitle,
        questionnaire_template: parseInt(selectedTemplate),
        responsible_so: parseInt(selectedSO), // CHANGED: Parse ID to integer
      });
      toast.success("Dossier created successfully");
      setIsCreateOpen(false);
      setNewDossierTitle("");
      setSelectedTemplate("");
      setSelectedSO("");
      fetchData(); // Refresh list
    } catch (error) {
      toast.error("Failed to create dossier");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredDossiers = dossiers.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dossiers</h1>
          <p className="text-slate-500">Manage and track your security assessments</p>
        </div>
        
        {/* Create Dossier Dialog - Only for AM */}
        {isAM && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                New Dossier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
              <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100">
                <DialogTitle className="text-xl text-slate-900">Create New Assessment</DialogTitle>
                <DialogDescription className="text-slate-500 mt-1.5">
                  Start a new security assessment by selecting a template and assigning a Security Officer.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDossier} className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 font-medium">Dossier Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g., Q3 Payment Gateway Assessment"
                    value={newDossierTitle}
                    onChange={(e) => setNewDossierTitle(e.target.value)}
                    className="h-11 border-slate-200 focus-visible:ring-blue-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-slate-700 font-medium">Questionnaire Template <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <select
                      id="template"
                      className="flex h-11 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                    >
                      <option value="" disabled>Select a template...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.question_count} questions)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="so" className="text-slate-700 font-medium">
                    Responsible Security Officer <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="so"
                      className="flex h-11 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                      value={selectedSO}
                      onChange={(e) => setSelectedSO(e.target.value)}
                      required // HTML5 validation
                    >
                      <option value="" disabled>Select a Security Officer</option>
                      {availableSOs.map((so) => (
                        <option key={so.id} value={so.id}> {/* CHANGED: Use ID as value */}
                          {so.name} ({so.email})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-500">The selected officer will oversee this assessment.</p>
                </div>

                <DialogFooter className="pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateOpen(false)}
                    className="mr-2 h-11 border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating}
                    className="h-11 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Dossier
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search dossiers..." 
            className="pl-10 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="text-slate-600 border-slate-200">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredDossiers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDossiers.map((dossier) => (
            <DossierCard key={dossier.id} dossier={dossier} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No dossiers found</h3>
          <p className="text-slate-500 mt-1">
            {searchQuery ? "Try adjusting your search terms" : (isAM ? "Get started by creating your first assessment" : "You have no assigned assessments yet")}
          </p>
        </div>
      )}
    </div>
  );
}
