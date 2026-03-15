"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  GenerateResumeResponse,
  GeneratedResume,
} from "@/types/resume";
import {
  generatedResumeToStorage,
  parseResumeFormDataFromStorage,
} from "@/lib/resume/normalizeGeneratedResume";
import { toDisplayResume } from "@/lib/resume/toDisplayResume";

const RESUME_FORM_STORAGE_KEY = "resumeFormData";
const GENERATED_RESUME_STORAGE_KEY = "generatedResume";

export default function GeneratedPage() {
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(RESUME_FORM_STORAGE_KEY);

    if (!raw) {
      setIsLoading(false);
      return;
    }

    const parsed = parseResumeFormDataFromStorage(raw);

    if (!parsed) {
      setError("Stored resume form data is invalid.");
      setIsLoading(false);
      return;
    }

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/generate-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed),
        });

        if (!response.ok) {
          throw new Error("Failed to generate resume.");
        }

        const result: GenerateResumeResponse = await response.json();

        setGenerated(result.generated);
        localStorage.setItem(
          GENERATED_RESUME_STORAGE_KEY,
          generatedResumeToStorage(result.generated)
        );
      } catch (err) {
        console.error(err);
        setError("Could not generate the resume.");
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Generating resume...</h1>
          <p className="mt-4 text-slate-300">
            Building your structured resume output now.
          </p>
        </div>
      </main>
    );
  }

  if (error || !generated) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">Generation unavailable</h1>
          <p className="mt-4 text-slate-300">
            {error || "No generated resume available."}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/builder"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Back to Builder
            </Link>
            <Link
              href="/preview"
              className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              Go to Preview
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayResume = toDisplayResume(generated);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              Generation Endpoint Test
            </span>
            <h1 className="mt-4 text-4xl font-bold">Generated Resume Output</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              This page tests the dedicated generation route separately from
              analysis.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/builder"
              className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              Back to Builder
            </Link>
            <Link
              href="/preview"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Continue to Preview
            </Link>
          </div>
        </div>

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
          </header>

          <ResumeSection title="Professional Summary">
            <p className="text-sm leading-6 text-slate-700">
              {displayResume.summary}
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
                      {experience.bullets.map((bullet, bulletIndex) => (
                        <li key={`${experience.role}-${bulletIndex}`}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No experience added yet.</p>
            )}
          </ResumeSection>

          <ResumeSection title="Projects">
            {displayResume.projects.length > 0 ? (
              <div className="space-y-5">
                {displayResume.projects.map((project, index) => (
                  <div key={`${project.name}-${index}`}>
                    <h3 className="font-semibold">{project.name}</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                      {project.bullets.map((bullet, bulletIndex) => (
                        <li key={`${project.name}-${bulletIndex}`}>{bullet}</li>
                      ))}
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
                {displayResume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No skills added yet.</p>
            )}
          </ResumeSection>

          <ResumeSection title="Additional Information">
            {displayResume.extras.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {displayResume.extras.map((item, index) => (
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