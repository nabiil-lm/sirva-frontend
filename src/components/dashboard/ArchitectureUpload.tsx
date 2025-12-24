"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, Loader2, Lock, AlertTriangle, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { Dossier } from "@/types/dossier";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DossierWithArchitecture extends Dossier {
  architecture_docs?: ArchitectureDoc[];
  architecture_docs_submitted?: boolean;
}

interface ArchitectureDoc {
  id: string;
  display_name?: string;
  filename: string;
  description?: string;
  size: number;
  uploaded_at: string;
  rssi_confirmed: boolean;
}

interface ArchitectureUploadProps {
  dossier: Dossier;
  onUploadComplete: () => void;
  onSubmitComplete: () => void;
  isReadOnly?: boolean;
}

export function ArchitectureUpload({ dossier: baseDossier, onUploadComplete, onSubmitComplete, isReadOnly = false }: ArchitectureUploadProps) {
  const dossier = baseDossier as DossierWithArchitecture;
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [rssiConfirmed, setRssiConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // NEW
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null); // NEW
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setFile(selectedFile);
      if (!displayName) {
        setDisplayName(selectedFile.name.replace(".pdf", ""));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setFile(selectedFile);
      if (!displayName) {
        setDisplayName(selectedFile.name.replace(".pdf", ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !rssiConfirmed) {
      toast.error("Please select a file and confirm RSSI validation");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("display_name", displayName);
    formData.append("description", description);
    formData.append("rssi_confirmed", "true");

    try {
      await apiClient.post(`/dossiers/${dossier.id}/documents/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully");
      setFile(null);
      setDisplayName("");
      setDescription("");
      setRssiConfirmed(false);
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onUploadComplete(); // Refresh parent data
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  // CHANGED: Open dialog instead of window.confirm
  const handleDelete = (docId: string) => {
    setDocumentToDelete(docId);
    setIsDeleteConfirmOpen(true);
  };

  // NEW: Execute delete after confirmation
  const executeDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      await apiClient.delete(`/dossiers/${dossier.id}/documents/${documentToDelete}/`);
      toast.success("Document deleted successfully");
      onUploadComplete();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = async (doc: ArchitectureDoc) => {
    try {
      const response = await apiClient.get(`/dossiers/${dossier.id}/documents/${doc.id}/download/`, {
        responseType: 'blob',
      });
      
      // Create blob link to download
      const urlBlob = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', doc.filename);
      // Open in new tab for viewing if possible, otherwise download
      window.open(urlBlob, '_blank');
      
      // Cleanup
      setTimeout(() => window.URL.revokeObjectURL(urlBlob), 100);
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download document");
    }
  };

  const handleSubmitAll = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    try {
      await apiClient.post(`/dossiers/${dossier.id}/documents/submit_documents/`);
      toast.success("Documents submitted. Analysis started.");
      onSubmitComplete();
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  const docs = dossier.architecture_docs || [];
  const isLocked = dossier.architecture_docs_submitted || isReadOnly; // Treat as locked if read-only

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Architecture Documents</h2>
          <p className="text-slate-500">Upload technical documentation for cross-check analysis.</p>
        </div>
        {isLocked && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
            <Lock className="w-4 h-4" />
            {isReadOnly ? "Stage Completed" : "Uploads Locked"}
          </div>
        )}
      </div>

      {!isLocked && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form - Takes up 2 columns */}
          <Card className="lg:col-span-2 p-0 border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Add New Document</h3>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {/* Drag & Drop Area */}
              <div 
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out",
                  dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50",
                  file ? "bg-blue-50/50 border-blue-200" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  id="file" 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  {file ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-blue-600 hover:text-blue-700 z-20 pointer-events-auto" onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        // Reset input value if needed via ref or id
                        const fileInput = document.getElementById('file') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}>
                        Change File
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        <span className="text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PDF files only (max 50MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Document Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Network Architecture Diagram" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-slate-700 font-medium">Description (Optional)</Label>
                  <Textarea 
                    id="desc" 
                    placeholder="Briefly describe what this document contains..." 
                    className="min-h-[80px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-100 mb-6">
                  <input 
                    id="rssi" 
                    type="checkbox"
                    checked={rssiConfirmed}
                    onChange={(e) => setRssiConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
                  />
                  <label
                    htmlFor="rssi"
                    className="text-sm text-slate-700 cursor-pointer select-none"
                  >
                    <span className="font-medium text-amber-900 block mb-0.5">RSSI Validation Required</span>
                    I confirm that this document has been reviewed and validated by the Chief Information Security Officer (RSSI).
                  </label>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUploading || !file || !rssiConfirmed} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                  Upload Document
                </Button>
              </div>
            </form>
          </Card>

          {/* Sidebar / Instructions - Takes up 1 column */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5" />
                Required Documents
              </h4>
              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Network Architecture Diagrams
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Data Flow Diagrams
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Authentication Flows
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Encryption Specifications
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
          Uploaded Documents 
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{docs.length}</span>
        </h3>
        {docs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {docs.map((doc: ArchitectureDoc) => (
              <div key={doc.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" 
                  onClick={() => handleDownload(doc)}
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.display_name || doc.filename}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      {doc.rssi_confirmed && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Validated
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  {!isLocked && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isLocked && docs.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Ready to submit?</p>
              <p>Submitting will lock these documents and automatically start the IA2 cross-check analysis.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setIsConfirmOpen(true)} 
              disabled={isSubmitting || isReadOnly}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all px-8 h-11"
              size="lg"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Submit All & Start Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-xl">Confirm Submission</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to submit these documents? 
              <br /><br />
              <span className="font-medium text-slate-900">This action cannot be undone.</span>
              <br />
              Once submitted, you will no longer be able to upload or remove documents, and the IA2 analysis will begin immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAll}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Yes, Submit & Analyze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">Delete Document</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete this document?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={executeDelete}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
