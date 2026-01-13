"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Check } from "lucide-react";
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
import { toast } from "sonner";
import dossierService, { Question, QuestionnaireTemplate } from "@/services/dossier.service";

export default function TemplateEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const tmpl = await dossierService.getTemplate(Number(id));
      setTemplate(tmpl);
      const data = await dossierService.getTemplateWithQuestions(Number(id));
      setQuestions(data.questions);
      setNewQuestion(prev => ({ ...prev, order: data.questions.length + 1 }));
    } catch (error) {
      toast.error("Failed to load template data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!template) return;
    try {
      const newStatus = template.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await dossierService.updateTemplate(template.id, { status: newStatus });
      setTemplate({ ...template, status: newStatus as any });
      toast.success(`Template ${newStatus === 'PUBLISHED' ? 'Published' : 'Unpublished'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text) return toast.error("Question text required");
    
    // Process choices
    const choices = newQuestion.question_type === 'TRUE_FALSE' || newQuestion.question_type === 'TEXT' 
      ? [] 
      : choicesInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await dossierService.createQuestion(Number(id), {
        ...newQuestion,
        choices_json: choices
      });
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
    } catch (error) {
      toast.error("Failed to add question");
    }
  };

  const deleteQuestion = async (qId: number) => {
    if (!confirm("Delete this question?")) return;
    try {
      await dossierService.deleteQuestion(Number(id), qId);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  if (isLoading || !template) return <div className="p-10 text-center">Loading...</div>;

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
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {template.status}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-sm text-slate-500">{questions.length} Questions</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={handlePublish}
          variant={template.status === 'PUBLISHED' ? "outline" : "default"}
          className={template.status === 'PUBLISHED' ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "bg-emerald-600 hover:bg-emerald-700"}
        >
          {template.status === 'PUBLISHED' ? "Revert to Draft" : "Publish Template"}
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-4 flex gap-4 items-start group hover:border-blue-200 transition-colors">
            <div className="mt-1 text-slate-400">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium text-slate-900 dark:text-white">
                  <span className="text-slate-400 mr-2">#{idx + 1}</span>
                  {q.text}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-1 rounded dark:bg-slate-800">{q.question_type}</span>
                {q.is_mandatory && <span className="text-red-500 font-medium flex items-center"><span className="mr-1">*</span> Mandatory</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Question Form */}
      {isAdding ? (
        <Card className="p-6 border-blue-200 shadow-lg ring-1 ring-blue-500/20">
          <h3 className="font-semibold mb-4 text-slate-900">New Question</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Input 
                  value={newQuestion.text} 
                  onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                  placeholder="Ask something..." 
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={newQuestion.question_type} 
                  onValueChange={v => setNewQuestion({...newQuestion, question_type: v})}
                >
                  <SelectTrigger>
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
                <Label>Choices (comma separated)</Label>
                <Input 
                  value={choicesInput}
                  onChange={e => setChoicesInput(e.target.value)}
                  placeholder="Option A, Option B, Option C" 
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Help Text (Optional)</Label>
              <Input 
                value={newQuestion.help_text} 
                onChange={e => setNewQuestion({...newQuestion, help_text: e.target.value})}
                placeholder="Guidance for the user..." 
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="mandatory" 
                checked={newQuestion.is_mandatory} 
                onCheckedChange={c => setNewQuestion({...newQuestion, is_mandatory: c})} 
              />
              <Label htmlFor="mandatory">Mandatory Response</Label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={handleAddQuestion}>Save Question</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-16 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-5 h-5 mr-2" /> Add Question
        </Button>
      )}
    </div>
  );
}
