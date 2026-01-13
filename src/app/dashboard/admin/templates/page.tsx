"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface QuestionnaireTemplate {
  id: number;
  name: string;
  description: string;
  status: string;
  question_count: number;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/questionnaires/');
      const data = response.data.results || response.data;
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.name) {
      toast.error("Name is required");
      return;
    }

    setIsCreating(true);
    try {
      await apiClient.post('/questionnaires/', newTemplate);
      toast.success("Template created");
      setIsCreateOpen(false);
      setNewTemplate({ name: "", description: "" });
      fetchTemplates();
    } catch (error) {
      console.error("Failed to create template", error);
      toast.error("Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/questionnaires/${id}/`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template", error);
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0 dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Create New Template
              </DialogTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Create a new questionnaire template for security assessments.
              </p>
            </DialogHeader>
            
            <div className="px-6 py-6 space-y-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Template Name
                  <span className="text-red-500 text-base">*</span>
                </Label>
                <Input 
                  value={newTemplate.name} 
                  onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g., Cloud Security Assessment v2"
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Description
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">(Optional)</span>
                </Label>
                <Textarea 
                  value={newTemplate.description} 
                  onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Provide context about when this template should be used..."
                  className="min-h-[120px] resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                  rows={5}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="text-blue-500 mt-0.5">ℹ</span>
                  Help users understand when to select this template.
                </p>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex-row gap-3 sm:gap-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewTemplate({ name: "", description: "" });
                }}
                className="flex-1 h-11 border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={isCreating || !newTemplate.name.trim()}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-700">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No templates found</h3>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Get started by creating your first questionnaire template
          </p>
        </div>
      ) : (
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(template.id)} 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    asChild 
                    className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Link href={`/dashboard/admin/templates/${template.id}`}>
                      Manage <Edit className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
