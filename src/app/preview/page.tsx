"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { generateMockResume } from "@/lib/resume/mockTransform";
import type { GeneratedResume, ResumeFormData } from "@/types/resume";

export default function PreviewPage() {
  const [data, setData] = useState<ResumeFormData | null>(null);
  const [generated, setGenerated] = useState<GeneratedResume | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("resumeFormData");
    if (!raw) return;

    const parsed: ResumeFormData = JSON.parse(raw);
    setData(parsed);
    setGenerated(generateMockResume(parsed));
  }, []);

  if (!data || !generated) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-bold">No resume data found</h1>
          <p className="mt-4 text-slate-300">
            Fill out the builder form first so we can preview your generated resume.
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

  const experienceCount = generated.experience.length;
  const projectCount = generated.projects.length;
  const skillsCount = generated.skills.length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              Mock Generated Resume
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Structured resume preview
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              This is now using a shared transform layer instead of just dumping raw form inputs. Next, we’ll replace this transform with an AI-powered pipeline.
            </p>
          </div>

          <Link
            href="/builder"
            className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
          >
            Back to Builder
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
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
                        {experience.bullets.map((bullet, bulletIndex) => (
                          <li key={`${experience.role}-${bulletIndex}`}>
                            {bullet}
                          </li>
                        ))}
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
                        {project.bullets.map((bullet, bulletIndex) => (
                          <li key={`${project.name}-${bulletIndex}`}>
                            {bullet}
                          </li>
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
              {generated.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {generated.skills.map((skill) => (
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