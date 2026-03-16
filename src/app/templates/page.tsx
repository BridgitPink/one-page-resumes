"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  loadGeneratedResume,
  loadBoldWords,
  saveBoldWords,
  loadSelectedTemplate,
  saveSelectedTemplate,
} from "@/lib/resume/storage";
import { toggleBoldWord } from "@/lib/resume/boldWordHelpers";
import { exportToPDF, exportToWord } from "@/lib/resume/resumeExport";
import { TEMPLATES, getTemplateComponent } from "@/lib/resume/templateRegistry";
import { TemplatesRightSidebar } from "@/components/templates/TemplatesRightSidebar";
import type { GeneratedResume } from "@/types/resume";
import type { BoldWordsState } from "@/lib/resume/storage";

export default function TemplatesPage() {
  const router = useRouter();
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [boldState, setBoldState] = useState<BoldWordsState>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [loading, setLoading] = useState(true);

  // Load resume and bold state from localStorage on mount
  useEffect(() => {
    const stored = loadGeneratedResume<any>();
    let loadedResume = null;

    if (stored?.generated) {
      loadedResume = stored.generated;
    } else if (stored) {
      loadedResume = stored;
    }

    // Normalize experience key
    if (loadedResume && Array.isArray(loadedResume.experiences) && !Array.isArray(loadedResume.experience)) {
      loadedResume.experience = loadedResume.experiences;
      delete loadedResume.experiences;
    }

    setResume(loadedResume);
    setBoldState(loadBoldWords());
    setSelectedTemplate(loadSelectedTemplate());
    setLoading(false);
  }, []);

  // Handle word click to toggle bold
  const handleWordClick = useCallback(
    (section: string, entryIndex: number, bulletIndex: number, wordIndex: number) => {
      const newBoldState = toggleBoldWord(section, entryIndex, bulletIndex, wordIndex, boldState);
      setBoldState(newBoldState);
      saveBoldWords(newBoldState);
    },
    [boldState]
  );

  // Handle template change
  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    saveSelectedTemplate(templateId);
  }, []);

  // Handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!resume) return;
    await exportToPDF(resume, selectedTemplate, boldState);
  }, [resume, selectedTemplate, boldState]);

  // Handle Word download
  const handleDownloadWord = useCallback(async () => {
    if (!resume) return;
    await exportToWord(resume, selectedTemplate, boldState);
  }, [resume, selectedTemplate, boldState]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">Loading Templates</h1>
            <p className="text-sm text-slate-400">Preparing your resume preview...</p>
          </div>

          <div className="bg-slate-900 rounded-lg shadow-sm p-8 space-y-6 border border-slate-700">
            <div className="flex justify-center items-center gap-2 h-12">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>

        <style>{`@keyframes pulse-width { 0%, 100% { width: 0%; } 50% { width: 100%; } }`}</style>
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold text-white">No resume found</h1>
          <p className="mt-2 text-slate-400">Please generate a resume first.</p>
          <button
            onClick={() => router.push("/builder")}
            className="mt-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white transition-colors"
          >
            Back to Builder
          </button>
        </div>
      </main>
    );
  }

  // Get the template component
  const TemplateComponent = getTemplateComponent(selectedTemplate);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl flex gap-8 px-6 py-8">
        {/* Left Sidebar - Template Selection */}
        <aside className="w-56 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            {/* Templates Title */}
            <div>
              <h2 className="text-sm font-semibold text-white">Templates</h2>
              <p className="mt-1 text-xs text-slate-400">Select a template style</p>
            </div>

            {/* Template Options */}
            <div className="space-y-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedTemplate === template.id
                      ? "bg-emerald-600 text-white border border-emerald-500"
                      : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  <p className="font-medium">{template.label}</p>
                  <p className="mt-1 text-xs text-slate-300">{template.description}</p>
                </button>
              ))}
            </div>

            {/* Back Button */}
            <div className="pt-4 border-t border-slate-700">
              <button
                onClick={() => router.push("/generated")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                ← Back to Editor
              </button>
            </div>
          </div>
        </aside>

        {/* Main Resume Preview */}
        <article
          className="flex-1 max-w-[850px] bg-white text-black border border-slate-300 rounded-lg shadow-lg p-10"
          data-resume-content
        >
          {TemplateComponent && (
            <TemplateComponent resume={resume} boldState={boldState} onWordClick={handleWordClick} />
          )}
        </article>

        {/* Right Sidebar - Bold Keywords + Download */}
        <TemplatesRightSidebar
          resume={resume}
          boldState={boldState}
          selectedTemplate={selectedTemplate}
          onDownloadPDF={handleDownloadPDF}
          onDownloadWord={handleDownloadWord}
        />
      </div>
    </main>
  );
}