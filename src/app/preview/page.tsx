"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  GeneratedResume,
  KeywordAnalysis,
  ResumeFormData,
  ResumeRecommendations,
  ResumeScore,
} from "@/types/resume";

type AnalyzeResumeResponse = {
  generated: GeneratedResume;
  keywordAnalysis: KeywordAnalysis;
  resumeScore: ResumeScore;
  recommendations: ResumeRecommendations;
};

export default function PreviewPage() {
  const [data, setData] = useState<ResumeFormData | null>(null);
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);
  const [keywordAnalysis, setKeywordAnalysis] =
    useState<KeywordAnalysis | null>(null);
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [recommendations, setRecommendations] =
    useState<ResumeRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("resumeFormData");
    if (!raw) {
      setIsLoading(false);
      return;
    }

    const parsed: ResumeFormData = JSON.parse(raw);
    setData(parsed);

    const analyzeResume = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze resume.");
        }

        const result: AnalyzeResumeResponse = await response.json();

        setGenerated(result.generated);
        setKeywordAnalysis(result.keywordAnalysis);
        setResumeScore(result.resumeScore);
        setRecommendations(result.recommendations);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while generating the resume preview.");
      } finally {
        setIsLoading(false);
      }
    };

    void analyzeResume();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Generating preview...</h1>
          <p className="mt-4 text-slate-300">
            We are analyzing your input, matching keywords, scoring the resume,
            and generating recommendations.
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">No resume data found</h1>
          <p className="mt-4 text-slate-300">
            Fill out the builder form first so we can preview your generated
            resume.
          </p>
          <Link
            href="/builder"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Go to Builder
          </Link>
        </div>
      </main>
    );
  }

  if (
    error ||
    !generated ||
    !keywordAnalysis ||
    !resumeScore ||
    !recommendations
  ) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Preview unavailable</h1>
          <p className="mt-4 text-slate-300">
            {error || "We could not generate the preview right now."}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/builder"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Back to Builder
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const experienceCount = generated.experience.length;
  const projectCount = generated.projects.length;
  const skillsCount = generated.skills.length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              Mock Generated Resume
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Structured resume preview
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              This preview is now powered through an API route, making it much
              easier to swap the mock pipeline with a real AI backend later.
            </p>
          </div>

          <Link
            href="/builder"
            className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
          >
            Back to Builder
          </Link>
        </div>

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
                {resumeScore.improvementSuggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Suggested Projects</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedProjects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">
                Suggested Certifications
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedCertifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Coursework Framing Ideas</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedCourseworkFraming.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Recommended Additions</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {recommendations.recommendedSectionAdditions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Build Snapshot</h2>

              <div className="mt-6 space-y-5 text-sm text-slate-300">
                <div>
                  <p className="font-medium text-white">Target Role</p>
                  <p>{generated.target.role || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-white">Industry</p>
                  <p>{generated.target.industry || "Not provided"}</p>
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
                  <p>{generated.target.jobDescription ? "Yes" : "No"}</p>
                </div>
              </div>
            </section>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white p-10 text-slate-900 shadow-2xl shadow-black/30">
            <header className="border-b border-slate-200 pb-6">
              <h1 className="text-3xl font-bold">
                {generated.basics.fullName || "Your Name"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {[
                  generated.basics.email,
                  generated.basics.phone,
                  generated.basics.location,
                  generated.basics.linkedin,
                  generated.basics.github,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>

              {generated.target.role && (
                <p className="mt-4 text-base font-medium text-slate-800">
                  Target Role: {generated.target.role}
                </p>
              )}
            </header>

            <ResumeSection title="Professional Summary">
              <p className="text-sm leading-6 text-slate-700">
                {generated.summary}
              </p>
            </ResumeSection>

            <ResumeSection title="Education">
              <p className="font-semibold">
                {generated.basics.school || "School Name"}
              </p>
              <p className="mt-1">
                {generated.basics.degree || "Degree / Major"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {[
                  generated.basics.graduationDate &&
                    `Graduation: ${generated.basics.graduationDate}`,
                  generated.basics.gpa && `GPA: ${generated.basics.gpa}`,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </ResumeSection>

            <ResumeSection title="Experience">
              {generated.experience.length > 0 ? (
                <div className="space-y-5">
                  {generated.experience.map((experience, index) => (
                    <div key={`${experience.role}-${index}`}>
                      <div className="flex flex-col justify-between gap-1 sm:flex-row">
                        <h3 className="font-semibold">{experience.role}</h3>
                        <p className="text-sm text-slate-600">
                          {experience.organization}
                        </p>
                      </div>

                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                        {experience.bullets.map((bullet, bulletIndex) => {
                          const isMatched =
                            keywordAnalysis.matchedKeywords.some((keyword) =>
                              bullet
                                .toLowerCase()
                                .includes(keyword.toLowerCase())
                            );

                          return (
                            <li
                              key={`${experience.role}-${bulletIndex}`}
                              className={
                                isMatched ? "font-medium text-slate-900" : ""
                              }
                            >
                              {bullet}
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
              {generated.projects.length > 0 ? (
                <div className="space-y-5">
                  {generated.projects.map((project, index) => (
                    <div key={`${project.name}-${index}`}>
                      <h3 className="font-semibold">{project.name}</h3>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                        {project.bullets.map((bullet, bulletIndex) => {
                          const isMatched =
                            keywordAnalysis.matchedKeywords.some((keyword) =>
                              bullet
                                .toLowerCase()
                                .includes(keyword.toLowerCase())
                            );

                          return (
                            <li
                              key={`${project.name}-${bulletIndex}`}
                              className={
                                isMatched ? "font-medium text-slate-900" : ""
                              }
                            >
                              {bullet}
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
              {generated.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {generated.skills.map((skill) => {
                    const matched = keywordAnalysis.matchedKeywords.some(
                      (keyword) =>
                        keyword.toLowerCase() === skill.toLowerCase()
                    );

                    return (
                      <span
                        key={skill}
                        className={`rounded-full px-3 py-1 text-sm ${
                          matched
                            ? "bg-emerald-100 text-emerald-800"
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
              {generated.extras.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {generated.extras.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">
                  No additional information added yet.
                </p>
              )}
            </ResumeSection>
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