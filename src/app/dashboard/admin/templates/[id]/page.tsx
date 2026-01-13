"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, GripVertical, Check, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface Question {
  id: number;
  text: string;
  question_type: string;
  is_mandatory: boolean;
  choices_json: string[];
  help_text: string;
  order: number;
}

interface QuestionnaireTemplate {
  id: number;
  name: string;
  description: string;
  status: string;
  question_count: number;
}

export default function TemplateEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit question state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete confirmation state
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Question State
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    question_type: "TRUE_FALSE",
    is_mandatory: true,
    choices_json: [] as string[],
    help_text: "",
    order: 0
  });
  const [choicesInput, setChoicesInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const tmplResponse = await apiClient.get(`/questionnaires/${id}/`);
      setTemplate(tmplResponse.data);
      
      const dataResponse = await apiClient.get(`/questionnaires/${id}/with_questions/`);
      setQuestions(dataResponse.data.questions || []);
      setNewQuestion(prev => ({ ...prev, order: (dataResponse.data.questions?.length || 0) + 1 }));
    } catch (error) {
      console.error("Failed to load template data", error);
      toast.error("Failed to load template data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!template) return;
    try {
      const newStatus = template.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await apiClient.patch(`/questionnaires/${template.id}/`, { status: newStatus });
      setTemplate({ ...template, status: newStatus });
      toast.success(`Template ${newStatus === 'PUBLISHED' ? 'Published' : 'Unpublished'}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) {
      toast.error("Question text is required");
      return;
    }
    
    // Process choices
    const choices = newQuestion.question_type === 'TRUE_FALSE' || newQuestion.question_type === 'TEXT' 
      ? [] 
      : choicesInput.split(',').map(s => s.trim()).filter(Boolean);

    if ((newQuestion.question_type === 'SINGLE_CHOICE' || newQuestion.question_type === 'MULTIPLE_CHOICE') && choices.length === 0) {
      toast.error("Please provide at least one choice option");
      return;
    }

    setIsCreating(true);
    try {
      // Backend expects 'template' field instead of being inferred from URL
      const payload = {
        text: newQuestion.text,
        question_type: newQuestion.question_type,
        is_mandatory: newQuestion.is_mandatory,
        choices_json: choices,
        help_text: newQuestion.help_text,
        order: newQuestion.order,
        template: parseInt(id as string) // Add template field
      };
      
      console.log("Creating question with payload:", payload); // Debug log
      
      await apiClient.post(`/questionnaires/${id}/questions/`, payload);
      toast.success("Question added");
      setIsAdding(false);
      // Reset form
      setNewQuestion({
        text: "",
        question_type: "TRUE_FALSE",
        is_mandatory: true,
        choices_json: [],
        help_text: "",
        order: questions.length + 2
      });
      setChoicesInput("");
      fetchData();
    } catch (error: any) {
      console.error("Failed to add question", error);
      console.error("Error response:", error.response?.data); // Debug log
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.text?.[0] || 
                       JSON.stringify(error.response?.data) ||
                       "Failed to add question";
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
    setChoicesInput(question.choices_json.join(', '));
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !editingQuestion.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    const choices = editingQuestion.question_type === 'TRUE_FALSE' || editingQuestion.question_type === 'TEXT' 
      ? [] 
      : choicesInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const payload = {
        text: editingQuestion.text,
        question_type: editingQuestion.question_type,
        is_mandatory: editingQuestion.is_mandatory,
        choices_json: choices,
        help_text: editingQuestion.help_text,
        order: editingQuestion.order
      };
      
      console.log("Updating question with payload:", payload); // Debug log
      
      await apiClient.patch(`/questionnaires/${id}/questions/${editingQuestion.id}/`, payload);
      toast.success("Question updated");
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      setChoicesInput("");
      fetchData();
    } catch (error: any) {
      console.error("Failed to update question", error);
      console.error("Error response:", error.response?.data); // Debug log
      const errorMsg = error.response?.data?.detail || 
                       JSON.stringify(error.response?.data) ||
                       "Failed to update question";
      toast.error(errorMsg);
    }
  };

  const handleDeleteClick = (question: Question) => {
    setDeletingQuestionId(question.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingQuestionId) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/questionnaires/${id}/questions/${deletingQuestionId}/`);
      toast.success("Question deleted");
      setIsDeleteDialogOpen(false);
      setDeletingQuestionId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete question", error);
      toast.error("Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !template) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{template.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                template.status === 'PUBLISHED' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {template.status}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{questions.length} Questions</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={handlePublish}
          variant={template.status === 'PUBLISHED' ? "outline" : "default"}
          className={template.status === 'PUBLISHED' 
            ? "text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20" 
            : "bg-emerald-600 hover:bg-emerald-700"
          }
        >
          {template.status === 'PUBLISHED' ? "Revert to Draft" : "Publish Template"}
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-4 flex gap-4 items-start group hover:border-blue-200 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-800">
            <div className="mt-1 text-slate-400">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    <span className="text-slate-400 mr-2">#{idx + 1}</span>
                    {q.text}
                  </h3>
                  {q.help_text && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{q.help_text}</p>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded dark:bg-slate-800">
                      {q.question_type.replace('_', ' ')}
                    </span>
                    {q.is_mandatory && (
                      <span className="text-red-500 font-medium flex items-center">
                        <span className="mr-1">*</span> Mandatory
                      </span>
                    )}
                    {q.choices_json.length > 0 && (
                      <span className="text-slate-400">
                        {q.choices_json.length} choices
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditQuestion(q)}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteClick(q)} 
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Question Form */}
      {isAdding ? (
        <Card className="p-6 border-blue-200 shadow-lg ring-1 ring-blue-500/20 dark:bg-slate-900 dark:border-blue-800">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">New Question</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Question Text <span className="text-red-500">*</span></Label>
                <Input 
                  value={newQuestion.text} 
                  onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                  placeholder="Ask something..."
                  className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Type</Label>
                <Select 
                  value={newQuestion.question_type} 
                  onValueChange={v => setNewQuestion({...newQuestion, question_type: v})}
                >
                  <SelectTrigger className="dark:bg-slate-950 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                    <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                    <SelectItem value="TEXT">Text Explanation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(newQuestion.question_type === 'SINGLE_CHOICE' || newQuestion.question_type === 'MULTIPLE_CHOICE') && (
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Choices (comma separated) <span className="text-red-500">*</span></Label>
                <Input 
                  value={choicesInput}
                  onChange={e => setChoicesInput(e.target.value)}
                  placeholder="Option A, Option B, Option C"
                  className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Help Text (Optional)</Label>
              <Input 
                value={newQuestion.help_text} 
                onChange={e => setNewQuestion({...newQuestion, help_text: e.target.value})}
                placeholder="Guidance for the user..."
                className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="mandatory" 
                checked={newQuestion.is_mandatory} 
                onCheckedChange={c => setNewQuestion({...newQuestion, is_mandatory: c})} 
              />
              <Label htmlFor="mandatory" className="dark:text-slate-300">Mandatory Response</Label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsAdding(false);
                  setNewQuestion({
                    text: "",
                    question_type: "TRUE_FALSE",
                    is_mandatory: true,
                    choices_json: [],
                    help_text: "",
                    order: questions.length + 1
                  });
                  setChoicesInput("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddQuestion} disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Question
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-16 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-5 h-5 mr-2" /> Add Question
        </Button>
      )}

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0 dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Edit Question</DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
              Make changes to this question
            </DialogDescription>
          </DialogHeader>
          
          {editingQuestion && (
            <div className="px-6 py-6 space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Question Text <span className="text-red-500">*</span></Label>
                <Textarea 
                  value={editingQuestion.text} 
                  onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  className="min-h-[80px] dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="dark:text-slate-300">Type</Label>
                <Select 
                  value={editingQuestion.question_type} 
                  onValueChange={v => setEditingQuestion({...editingQuestion, question_type: v})}
                >
                  <SelectTrigger className="dark:bg-slate-950 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                    <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                    <SelectItem value="TEXT">Text Explanation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(editingQuestion.question_type === 'SINGLE_CHOICE' || editingQuestion.question_type === 'MULTIPLE_CHOICE') && (
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">Choices (comma separated)</Label>
                  <Input 
                    value={choicesInput}
                    onChange={e => setChoicesInput(e.target.value)}
                    placeholder="Option A, Option B, Option C"
                    className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="dark:text-slate-300">Help Text</Label>
                <Input 
                  value={editingQuestion.help_text || ""} 
                  onChange={e => setEditingQuestion({...editingQuestion, help_text: e.target.value})}
                  className="dark:bg-slate-950 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={editingQuestion.is_mandatory} 
                  onCheckedChange={c => setEditingQuestion({...editingQuestion, is_mandatory: c})} 
                />
                <Label className="dark:text-slate-300">Mandatory Response</Label>
              </div>
            </div>
          )}

          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingQuestion(null);
                setChoicesInput("");
              }}
              className="flex-1 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0 dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-red-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Delete Question
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="px-6 py-6">
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to delete this question? This will permanently remove it from the template.
            </p>
            {deletingQuestionId && questions.find(q => q.id === deletingQuestionId) && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {questions.find(q => q.id === deletingQuestionId)?.text}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingQuestionId(null);
              }}
              disabled={isDeleting}
              className="flex-1 h-11 border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Question
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
