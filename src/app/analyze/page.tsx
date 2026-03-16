"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadResumeAnalysis,
  loadResumeFormData,
  saveResumeAnalysis,
} from "@/lib/resume/storage";

export default function AnalyzePage() {
  const router = useRouter();

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent double API calls in React Strict Mode
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const existing = loadResumeAnalysis();

    if (existing) {
      setAnalysis(existing);
      setLoading(false);
      return;
    }

    const runAnalysis = async () => {
      try {
        setError(null);

        const formData = loadResumeFormData();

        if (!formData) {
          throw new Error(
            "Missing builder data. Please return to the builder."
          );
        }

        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to analyze resume.");
        }

        const data = await response.json();

        saveResumeAnalysis(data);
        setAnalysis(data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong during analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-center">
        <p className="text-lg text-slate-700">Analyzing resume...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">
          Analysis failed
        </h1>

        <p className="mt-3 text-slate-600">{error}</p>

        <button
          onClick={() => router.push("/generated")}
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Back to Generated Resume
        </button>
      </div>
    );
  }

  const keywordAnalysis = analysis?.keywordAnalysis;
  const resumeScore = analysis?.resumeScore;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900">
            Resume Analysis
          </h1>

          <p className="mt-2 text-slate-600">
            Review ATS fit and recruiter-facing signals before suggestions.
          </p>
        </div>

        {/* Score Panels */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Resume Score
            </h2>

            <p className="mt-4 text-4xl font-bold text-slate-900">
              {resumeScore?.overallScore ?? resumeScore?.score ?? "—"}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Overall competitiveness score
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Keyword Match
            </h2>

            <p className="mt-4 text-4xl font-bold text-slate-900">
              {keywordAnalysis?.matchScore ?? keywordAnalysis?.score ?? "—"}%
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Job-description alignment
            </p>
          </section>
        </div>

        {/* Keyword Panels */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Matched Keywords
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {(keywordAnalysis?.matchedKeywords ?? []).map(
                (keyword: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Missing Keywords
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {(keywordAnalysis?.missingKeywords ?? []).map(
                (keyword: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex justify-between">
          <button
            onClick={() => router.push("/generated")}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-100"
          >
            Back to Generated Resume
          </button>

          <button
            onClick={() => router.push("/suggested")}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Continue to Suggestions
          </button>
        </div>
      </div>
    </main>
  );
}