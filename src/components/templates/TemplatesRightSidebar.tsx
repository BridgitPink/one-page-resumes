"use client";

import { useState } from "react";
import type { GeneratedResume } from "@/types/resume";
import type { BoldWordsState } from "@/lib/resume/storage";

interface TemplatesRightSidebarProps {
  resume: GeneratedResume | null;
  boldState: BoldWordsState;
  selectedTemplate: string;
  onDownloadPDF: () => Promise<void>;
  onDownloadWord: () => Promise<void>;
}

export function TemplatesRightSidebar({
  resume,
  boldState,
  selectedTemplate,
  onDownloadPDF,
  onDownloadWord,
}: TemplatesRightSidebarProps) {
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    setDownloadError(null);
    try {
      await onDownloadPDF();
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Failed to download PDF");
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadWord = async () => {
    setIsDownloadingWord(true);
    setDownloadError(null);
    try {
      await onDownloadWord();
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Failed to download Word document");
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setIsDownloadingWord(false);
    }
  };

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="sticky top-8 space-y-6">
        {/* Bold Keywords Section */}
        <div>
          <h3 className="text-sm font-semibold text-white">Keywords</h3>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Click words in <strong>Experience</strong> and <strong>Projects</strong> sections to bold them.
          </p>
          <div className="mt-3 p-3 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-300">
              {Object.values(boldState).filter(Boolean).length} word
              {Object.values(boldState).filter(Boolean).length !== 1 ? "s" : ""} highlighted
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Download Section */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-sm font-semibold text-white mb-4">Download Resume</h3>

          {downloadError && (
            <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded text-xs text-red-200 text-center">
              {downloadError}
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleDownloadPDF}
              disabled={!resume || isDownloadingPDF || isDownloadingWord}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloadingPDF ? "Generating PDF..." : "Download as PDF"}
            </button>

            <button
              onClick={handleDownloadWord}
              disabled={!resume || isDownloadingWord || isDownloadingPDF}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloadingWord ? "Generating Word..." : "Download as Word"}
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400 text-center">
            Template: <span className="font-medium">{selectedTemplate}</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
