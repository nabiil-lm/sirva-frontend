"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, CheckCircle2, Circle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dossierService, { QuestionnaireTemplate } from "@/services/dossier.service";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await dossierService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.name) return toast.error("Name is required");
    try {
      await dossierService.createTemplate(newTemplate);
      toast.success("Template created");
      setIsCreateOpen(false);
      setNewTemplate({ name: "", description: "" });
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await dossierService.deleteTemplate(id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Questionnaire Templates</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage security questionnaires standards</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={newTemplate.name} 
                  onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g., Cloud Security Assessment v2" 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newTemplate.description} 
                  onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Brief description of when to use this template" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="p-6 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                template.status === 'PUBLISHED' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}>
                {template.status}
              </div>
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{template.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">
              {template.description || "No description provided."}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {template.question_count} questions
              </span>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/admin/templates/${template.id}`}>
                    Manage <Edit className="w-3 h-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
