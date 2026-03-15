"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  AnalyzeResumeResponse,
  GeneratedResume,
  KeywordAnalysis,
  ResumeRecommendations,
  ResumeScore,
} from "@/types/resume";
import { parseGeneratedResumeFromStorage } from "@/lib/resume/normalizeGeneratedResume";
import { toDisplayResume } from "@/lib/resume/toDisplayResume";
import { renderHighlightedText } from "@/lib/resume/highlightKeywords";
import {
  analyzeRecruiterSignals,
  type RecruiterSignalAnalysis,
} from "@/lib/resume/recruiterSignals";

const RESUME_ANALYSIS_STORAGE_KEY = "resumeAnalysis";
const GENERATED_RESUME_STORAGE_KEY = "generatedResume";
const ACCEPTED_SUGGESTED_BULLETS_STORAGE_KEY = "acceptedSuggestedBullets";
const DISMISSED_SUGGESTED_BULLETS_STORAGE_KEY = "dismissedSuggestedBullets";

type SuggestedBullet = {
  id: string;
  section: "summary" | "experience" | "projects" | "skills" | "extras";
  targetEntry?: string;
  missingKeywords: string[];
  suggestedText: string;
  rationale: string;
  confidence: "high" | "medium" | "low";
};

function bulletMatchesKeywords(
  bullet: string,
  matchedKeywords: string[]
): boolean {
  const text = bullet.toLowerCase();
  if (!text) return false;

  return matchedKeywords.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
}

function safeParseAnalysis(raw: string | null): AnalyzeResumeResponse | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AnalyzeResumeResponse;
  } catch (error) {
    console.error("Failed to parse stored analysis:", error);
    return null;
  }
}

function safeParseStringArray(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch (error) {
    console.error("Failed to parse stored string array:", error);
    return [];
  }
}

function safeParseSuggestedBullets(raw: string | null): SuggestedBullet[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is SuggestedBullet =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as SuggestedBullet).id === "string" &&
        typeof (item as SuggestedBullet).section === "string" &&
        typeof (item as SuggestedBullet).suggestedText === "string" &&
        typeof (item as SuggestedBullet).rationale === "string" &&
        typeof (item as SuggestedBullet).confidence === "string" &&
        Array.isArray((item as SuggestedBullet).missingKeywords)
    );
  } catch (error) {
    console.error("Failed to parse suggested bullets:", error);
    return [];
  }
}

function createSuggestedBullets(params: {
  keywordAnalysis: KeywordAnalysis;
  recruiterSignals: RecruiterSignalAnalysis;
  targetRole: string;
  targetIndustry: string;
  skills: string[];
}): SuggestedBullet[] {
  const { keywordAnalysis, recruiterSignals, targetRole, targetIndustry, skills } =
    params;

  const suggestions: SuggestedBullet[] = [];
  const existingSkills = new Set(skills.map((skill) => skill.toLowerCase()));
  const missing = keywordAnalysis.missingKeywords.slice(0, 8);

  missing.forEach((keyword, index) => {
    const lowerKeyword = keyword.toLowerCase();

    if (existingSkills.has(lowerKeyword)) return;

    if (
      [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "node.js",
        "sql",
        "postgresql",
        "mysql",
        "mongodb",
        "git",
        "github",
        "docker",
        "aws",
        "azure",
        "linux",
        "tableau",
        "power bi",
        "api",
        "rest api",
      ].includes(lowerKeyword)
    ) {
      suggestions.push({
        id: `skill-${index}-${lowerKeyword}`,
        section: "skills",
        missingKeywords: [keyword],
        suggestedText: keyword,
        rationale:
          "This missing keyword appears to be a concrete tool or technology. Adding it to Skills is useful if you have genuinely used it in coursework, projects, or experience.",
        confidence: "high",
      });
      return;
    }

    if (
      [
        "machine learning",
        "data analysis",
        "data visualization",
        "web development",
        "software engineering",
        "cloud computing",
        "project management",
        "technical documentation",
        "version control",
        "user interface",
        "user experience",
        "quality assurance",
      ].includes(lowerKeyword)
    ) {
      suggestions.push({
        id: `project-${index}-${lowerKeyword}`,
        section: "projects",
        missingKeywords: [keyword],
        suggestedText: `Applied ${keyword} concepts in a hands-on academic or personal project, focusing on practical implementation, documentation, and iterative improvement.`,
        rationale:
          "This keyword is better supported by a project bullet than by adding it as a standalone skill.",
        confidence: "medium",
      });
      return;
    }

    suggestions.push({
      id: `exp-${index}-${lowerKeyword}`,
      section: "experience",
      missingKeywords: [keyword],
      suggestedText: `Used ${keyword} in relevant coursework, projects, or technical tasks to strengthen alignment with ${targetRole || "the target role"} expectations.`,
      rationale:
        "This is a conservative bullet suggestion meant to help you reflect the missing keyword only if it is truthful to your background.",
      confidence: "low",
    });
  });

  if (recruiterSignals.metrics.length === 0) {
    suggestions.push({
      id: "metrics-improvement",
      section: "experience",
      missingKeywords: [],
      suggestedText:
        "Added measurable detail such as percentages, counts, timelines, or scope to better communicate impact and strengthen recruiter confidence.",
      rationale:
        "Your resume currently appears light on metrics. Recruiters often notice quantified impact quickly.",
      confidence: "medium",
    });
  }

  if (recruiterSignals.tools.length < 3) {
    suggestions.push({
      id: "tools-visibility",
      section: "projects",
      missingKeywords: [],
      suggestedText:
        "Specified the tools, languages, and platforms used in technical work to make the resume easier for recruiters and ATS systems to evaluate.",
      rationale:
        "The resume would be stronger if tools and technologies were surfaced more explicitly.",
      confidence: "medium",
    });
  }

  if (recruiterSignals.actionVerbs.length < 4) {
    suggestions.push({
      id: "stronger-verb",
      section: "experience",
      missingKeywords: [],
      suggestedText:
        "Rewrote a bullet using stronger action verbs such as developed, implemented, designed, analyzed, or optimized to sound more results-oriented.",
      rationale:
        "Action verbs make early-career bullets feel more polished and recruiter-friendly.",
      confidence: "medium",
    });
  }

  return suggestions.slice(0, 8);
}

export default function AnalyzePage() {
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);
  const [keywordAnalysis, setKeywordAnalysis] =
    useState<KeywordAnalysis | null>(null);
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [recommendations, setRecommendations] =
    useState<ResumeRecommendations | null>(null);
  const [acceptedSuggestedBullets, setAcceptedSuggestedBullets] = useState<
    SuggestedBullet[]
  >([]);
  const [dismissedSuggestedBulletIds, setDismissedSuggestedBulletIds] =
    useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAnalysis = safeParseAnalysis(
      localStorage.getItem(RESUME_ANALYSIS_STORAGE_KEY)
    );

    if (storedAnalysis) {
      setGenerated(storedAnalysis.generated);
      setKeywordAnalysis(storedAnalysis.keywordAnalysis);
      setResumeScore(storedAnalysis.resumeScore);
      setRecommendations(storedAnalysis.recommendations);
    } else {
      const storedGenerated = parseGeneratedResumeFromStorage(
        localStorage.getItem(GENERATED_RESUME_STORAGE_KEY)
      );

      if (storedGenerated) {
        setGenerated(storedGenerated);
      }
    }

    setAcceptedSuggestedBullets(
      safeParseSuggestedBullets(
        localStorage.getItem(ACCEPTED_SUGGESTED_BULLETS_STORAGE_KEY)
      )
    );

    setDismissedSuggestedBulletIds(
      safeParseStringArray(
        localStorage.getItem(DISMISSED_SUGGESTED_BULLETS_STORAGE_KEY)
      )
    );

    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      ACCEPTED_SUGGESTED_BULLETS_STORAGE_KEY,
      JSON.stringify(acceptedSuggestedBullets)
    );
  }, [acceptedSuggestedBullets]);

  useEffect(() => {
    localStorage.setItem(
      DISMISSED_SUGGESTED_BULLETS_STORAGE_KEY,
      JSON.stringify(dismissedSuggestedBulletIds)
    );
  }, [dismissedSuggestedBulletIds]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Loading analysis...</h1>
          <p className="mt-4 text-slate-300">
            Preparing your resume score, keyword analysis, and recommendations.
          </p>
        </div>
      </main>
    );
  }

  if (!generated || !keywordAnalysis || !resumeScore || !recommendations) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Analysis unavailable</h1>
          <p className="mt-4 text-slate-300">
            Generate a resume first so the analysis page has data to display.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/builder"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Back to Builder
            </Link>
            <Link
              href="/generated"
              className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              Go to Generated Resume
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayResume = toDisplayResume(generated);
  const experienceCount = displayResume.experience.length;
  const projectCount = displayResume.projects.length;
  const skillsCount = displayResume.skills.length;

  const recruiterSignals = useMemo(() => {
    const resumeText = [
      displayResume.summary,
      ...displayResume.experience.flatMap((item) => [
        item.role,
        item.organization,
        ...item.bullets,
      ]),
      ...displayResume.projects.flatMap((item) => [item.name, ...item.bullets]),
      ...displayResume.skills,
      ...displayResume.extras,
      displayResume.target.role,
      displayResume.target.industry,
    ];

    return analyzeRecruiterSignals(resumeText);
  }, [displayResume]);

  const suggestedBullets = useMemo(() => {
    const acceptedIds = new Set(acceptedSuggestedBullets.map((item) => item.id));
    const dismissedIds = new Set(dismissedSuggestedBulletIds);

    return createSuggestedBullets({
      keywordAnalysis,
      recruiterSignals,
      targetRole: displayResume.target.role,
      targetIndustry: displayResume.target.industry,
      skills: displayResume.skills,
    }).filter(
      (item) => !acceptedIds.has(item.id) && !dismissedIds.has(item.id)
    );
  }, [
    acceptedSuggestedBullets,
    dismissedSuggestedBulletIds,
    displayResume.skills,
    displayResume.target.industry,
    displayResume.target.role,
    keywordAnalysis,
    recruiterSignals,
  ]);

  function handleAcceptSuggestedBullet(bullet: SuggestedBullet) {
    setAcceptedSuggestedBullets((current) => {
      if (current.some((item) => item.id === bullet.id)) return current;
      return [...current, bullet];
    });

    setDismissedSuggestedBulletIds((current) =>
      current.filter((id) => id !== bullet.id)
    );
  }

  function handleDismissSuggestedBullet(id: string) {
    setDismissedSuggestedBulletIds((current) =>
      current.includes(id) ? current : [...current, id]
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              Resume Analysis
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              ATS Match and Improvement Plan
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Review what matched, what is missing, and what projects,
              certifications, or bullets would strengthen the resume.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/generated"
              className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              Back to Resume
            </Link>
            <Link
              href="/builder"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Edit Inputs
            </Link>
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SignalCard
            title="Matched Keywords"
            items={keywordAnalysis.matchedKeywords}
            emptyText="No matched keywords yet."
            chipClassName="bg-emerald-100 text-emerald-800"
          />
          <SignalCard
            title="Tools Recruiters Will Notice"
            items={recruiterSignals.tools}
            emptyText="No clear tool signals detected yet."
            chipClassName="bg-sky-100 text-sky-800"
          />
          <SignalCard
            title="Metrics and Numbers"
            items={recruiterSignals.metrics}
            emptyText="No metrics detected yet."
            chipClassName="bg-amber-100 text-amber-800"
          />
          <SignalCard
            title="Strong Action Verbs"
            items={recruiterSignals.actionVerbs}
            emptyText="No strong action verbs detected yet."
            chipClassName="bg-violet-100 text-violet-800"
          />
        </section>

        <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Resume Score</h2>

              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                <p className="text-sm text-slate-300">Overall score</p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {resumeScore.overallScore}/100
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Scored conservatively for early-career competitiveness.
                </p>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <ScoreRow
                  label="Keyword Alignment"
                  value={resumeScore.keywordAlignmentScore}
                />
                <ScoreRow
                  label="Content Strength"
                  value={resumeScore.contentStrengthScore}
                />
                <ScoreRow
                  label="Completeness"
                  value={resumeScore.completenessScore}
                />
                <ScoreRow
                  label="Formatting Readiness"
                  value={resumeScore.formattingReadinessScore}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Keyword Match</h2>

              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm text-slate-300">Match score</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {keywordAnalysis.matchScore}%
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Matched
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {keywordAnalysis.matchedKeywords.length > 0 ? (
                    keywordAnalysis.matchedKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-200"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No matches yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Missing
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {keywordAnalysis.missingKeywords.length > 0 ? (
                    keywordAnalysis.missingKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-amber-400/15 px-3 py-1 text-sm text-amber-200"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      No obvious missing keywords detected.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Strengths</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {resumeScore.strengths.length > 0 ? (
                  resumeScore.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))
                ) : (
                  <li>No major strengths detected yet.</li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Improve Next</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {resumeScore.improvementSuggestions.length > 0 ? (
                  resumeScore.improvementSuggestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))
                ) : (
                  <li>No improvement suggestions yet.</li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Suggested Projects</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedProjects.length > 0 ? (
                  recommendations.recommendedProjects.map((item) => (
                    <li key={item}>{item}</li>
                  ))
                ) : (
                  <li>No project suggestions yet.</li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">
                Suggested Certifications
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedCertifications.length > 0 ? (
                  recommendations.recommendedCertifications.map((item) => (
                    <li key={item}>{item}</li>
                  ))
                ) : (
                  <li>No certification suggestions yet.</li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Coursework Framing Ideas</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedCourseworkFraming.length > 0 ? (
                  recommendations.recommendedCourseworkFraming.map((item) => (
                    <li key={item}>{item}</li>
                  ))
                ) : (
                  <li>No coursework framing ideas yet.</li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Recommended Additions</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedSectionAdditions.length > 0 ? (
                  recommendations.recommendedSectionAdditions.map((item) => (
                    <li key={item}>{item}</li>
                  ))
                ) : (
                  <li>No recommended additions yet.</li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Build Snapshot</h2>

              <div className="mt-6 space-y-5 text-sm text-slate-300">
                <div>
                  <p className="font-medium text-white">Target Role</p>
                  <p>{displayResume.target.role || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Industry</p>
                  <p>{displayResume.target.industry || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Experience Sections</p>
                  <p>{experienceCount}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Projects</p>
                  <p>{projectCount}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Skills Parsed</p>
                  <p>{skillsCount}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Job Description Added</p>
                  <p>{displayResume.target.jobDescription ? "Yes" : "No"}</p>
                </div>
              </div>
            </section>
          </aside>

          <section className="space-y-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Suggested Bullets to Improve Match
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    These suggestions are conservative and should only be added if
                    they are truthful to your background.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {suggestedBullets.length > 0 ? (
                  suggestedBullets.map((bullet) => (
                    <div
                      key={bullet.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
                          {bullet.section}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                            bullet.confidence === "high"
                              ? "bg-emerald-100 text-emerald-800"
                              : bullet.confidence === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {bullet.confidence} confidence
                        </span>
                        {bullet.missingKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-amber-400/15 px-3 py-1 text-xs text-amber-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <p className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-900">
                        {bullet.suggestedText}
                      </p>

                      <p className="mt-3 text-sm text-slate-300">
                        {bullet.rationale}
                      </p>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleAcceptSuggestedBullet(bullet)}
                          className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                        >
                          Add This Bullet
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissSuggestedBullet(bullet.id)}
                          className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-300">
                    No additional bullet suggestions are available right now.
                  </p>
                )}
              </div>
            </section>

            {acceptedSuggestedBullets.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">
                  Accepted Suggested Bullets
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  These bullets have been saved for review. The next step will be
                  wiring them into editable resume sections.
                </p>

                <div className="mt-6 space-y-4">
                  {acceptedSuggestedBullets.map((bullet) => (
                    <div
                      key={bullet.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
                          {bullet.section}
                        </span>
                        {bullet.missingKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <p className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-900">
                        {bullet.suggestedText}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-white/10 bg-white p-10 text-slate-900 shadow-2xl shadow-black/30">
              <header className="border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-bold">
                  {displayResume.basics.fullName || "Your Name"}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {[
                    displayResume.basics.email,
                    displayResume.basics.phone,
                    displayResume.basics.location,
                    displayResume.basics.linkedin,
                    displayResume.basics.github,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>

                {displayResume.target.role && (
                  <p className="mt-4 text-base font-medium text-slate-800">
                    Target Role: {displayResume.target.role}
                  </p>
                )}
              </header>

              <ResumeSection title="Professional Summary">
                <p className="text-sm leading-6 text-slate-700">
                  {renderHighlightedText(
                    displayResume.summary,
                    keywordAnalysis.matchedKeywords
                  )}
                </p>
              </ResumeSection>

              <ResumeSection title="Education">
                <p className="font-semibold">
                  {displayResume.basics.school || "School Name"}
                </p>
                <p className="mt-1">
                  {displayResume.basics.degree || "Degree / Major"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {[
                    displayResume.basics.graduationDate &&
                      `Graduation: ${displayResume.basics.graduationDate}`,
                    displayResume.basics.gpa && `GPA: ${displayResume.basics.gpa}`,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </ResumeSection>

              <ResumeSection title="Experience">
                {displayResume.experience.length > 0 ? (
                  <div className="space-y-5">
                    {displayResume.experience.map((experience, index) => (
                      <div key={`${experience.role}-${index}`}>
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <h3 className="font-semibold">{experience.role}</h3>
                          <p className="text-sm text-slate-600">
                            {experience.organization}
                          </p>
                        </div>

                        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                          {experience.bullets.map((bullet, bulletIndex) => {
                            const isMatched = bulletMatchesKeywords(
                              bullet,
                              keywordAnalysis.matchedKeywords
                            );

                            return (
                              <li
                                key={`${experience.role}-${bulletIndex}`}
                                className={isMatched ? "text-slate-900" : ""}
                              >
                                {renderHighlightedText(
                                  bullet,
                                  keywordAnalysis.matchedKeywords
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">
                    No experience added yet.
                  </p>
                )}
              </ResumeSection>

              <ResumeSection title="Projects">
                {displayResume.projects.length > 0 ? (
                  <div className="space-y-5">
                    {displayResume.projects.map((project, index) => (
                      <div key={`${project.name}-${index}`}>
                        <h3 className="font-semibold">{project.name}</h3>
                        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                          {project.bullets.map((bullet, bulletIndex) => {
                            const isMatched = bulletMatchesKeywords(
                              bullet,
                              keywordAnalysis.matchedKeywords
                            );

                            return (
                              <li
                                key={`${project.name}-${bulletIndex}`}
                                className={isMatched ? "text-slate-900" : ""}
                              >
                                {renderHighlightedText(
                                  bullet,
                                  keywordAnalysis.matchedKeywords
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No projects added yet.</p>
                )}
              </ResumeSection>

              <ResumeSection title="Skills">
                {displayResume.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {displayResume.skills.map((skill) => {
                      const matched = keywordAnalysis.matchedKeywords.some(
                        (keyword) =>
                          keyword.toLowerCase() === skill.toLowerCase()
                      );

                      return (
                        <span
                          key={skill}
                          className={`rounded-full px-3 py-1 text-sm ${
                            matched
                              ? "bg-emerald-100 font-semibold text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No skills added yet.</p>
                )}
              </ResumeSection>

              <ResumeSection title="Additional Information">
                {displayResume.extras.length > 0 ? (
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                    {displayResume.extras.map((item, index) => (
                      <li key={`${item}-${index}`}>
                        {renderHighlightedText(
                          item,
                          keywordAnalysis.matchedKeywords
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600">
                    No additional information added yet.
                  </p>
                )}
              </ResumeSection>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-white"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SignalCard({
  title,
  items,
  emptyText,
  chipClassName,
}: {
  title: string;
  items: string[];
  emptyText: string;
  chipClassName: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className={`rounded-full px-3 py-1 text-sm font-medium ${chipClassName}`}
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-400">{emptyText}</p>
        )}
      </div>
    </section>
  );
}