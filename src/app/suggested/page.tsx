"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadResumeAnalysis,
  loadSuggestedState,
  saveSuggestedState,
} from "@/lib/resume/storage";

type SuggestedItem = {
  text: string;
  rationale?: string;
  confidence?: string;
  missingKeywords: string[];
};

type SuggestedState = {
  accepted: string[];
  dismissed: string[];
};

export default function SuggestedPage() {
  const router = useRouter();

  const [analysis, setAnalysis] = useState<unknown>(null);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAnalysis = loadResumeAnalysis();
    setAnalysis(storedAnalysis);

    const state = loadSuggestedState<SuggestedState>();
    if (state) {
      setAccepted(Array.isArray(state.accepted) ? state.accepted : []);
      setDismissed(Array.isArray(state.dismissed) ? state.dismissed : []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    saveSuggestedState({ accepted, dismissed });
  }, [accepted, dismissed]);

  const suggestions: SuggestedItem[] = useMemo(() => {
    const safeAnalysis = analysis as
      | {
          recommendations?: unknown;
        }
      | null;

    const recs = safeAnalysis?.recommendations;

    if (!Array.isArray(recs)) return [];

    return recs.map((item: unknown) => {
      const obj = (item ?? {}) as {
        text?: unknown;
        suggestion?: unknown;
        title?: unknown;
        rationale?: unknown;
        reason?: unknown;
        confidence?: unknown;
        missingKeywords?: unknown;
        missingkeywords?: unknown;
      };

      const rawMissingKeywords =
        obj.missingKeywords ?? obj.missingkeywords ?? [];

      return {
        text:
          (typeof obj.text === "string" && obj.text) ||
          (typeof obj.suggestion === "string" && obj.suggestion) ||
          (typeof obj.title === "string" && obj.title) ||
          "Suggested improvement",
        rationale:
          (typeof obj.rationale === "string" && obj.rationale) ||
          (typeof obj.reason === "string" && obj.reason) ||
          "",
        confidence:
          typeof obj.confidence === "string" ? obj.confidence : "",
        missingKeywords: Array.isArray(rawMissingKeywords)
          ? rawMissingKeywords.filter(
              (keyword): keyword is string => typeof keyword === "string"
            )
          : [],
      };
    });
  }, [analysis]);

  const visibleSuggestions = useMemo(() => {
    return suggestions.filter(
      (item) =>
        !dismissed.includes(item.text) && !accepted.includes(item.text)
    );
  }, [suggestions, dismissed, accepted]);

  const handleAccept = (text: string) => {
    setAccepted((prev) => (prev.includes(text) ? prev : [...prev, text]));
    setDismissed((prev) => prev.filter((item) => item !== text));
  };

  const handleDismiss = (text: string) => {
    setDismissed((prev) => (prev.includes(text) ? prev : [...prev, text]));
    setAccepted((prev) => prev.filter((item) => item !== text));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-center">
        <p className="text-lg text-slate-700">Loading suggestions...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">
          No analysis found
        </h1>
        <p className="mt-3 text-slate-600">
          Please run analysis before viewing suggestions.
        </p>

        <button
          type="button"
          onClick={() => router.push("/analyze")}
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Go to Analysis
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900">
            Suggestions
          </h1>
          <p className="mt-2 text-slate-600">
            Review targeted improvements and keep only the changes that strengthen your resume.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {visibleSuggestions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-slate-700">No active suggestions right now.</p>
              </div>
            ) : (
              visibleSuggestions.map((item, index) => (
                <div
                  key={`${item.text}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-base font-medium text-slate-900">
                    {item.text}
                  </p>

                  {item.rationale ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.rationale}
                    </p>
                  ) : null}

                  {item.confidence || item.missingKeywords.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {item.confidence ? (
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Confidence: {item.confidence}
                        </p>
                      ) : null}

                      {item.missingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.missingKeywords.map((keyword, i) => (
                            <span
                              key={`${keyword}-${i}`}
                              className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAccept(item.text)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDismiss(item.text)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Accepted Suggestions
            </h2>

            {accepted.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                Accepted suggestions will appear here.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-800">
                {accepted.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="rounded-lg bg-slate-50 p-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => router.push("/analyze")}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-100"
              >
                Back to Analysis
              </button>

              <button
                type="button"
                onClick={() => router.push("/generated")}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Back to Resume
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}