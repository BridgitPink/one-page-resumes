"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadGeneratedResume } from "@/lib/resume/storage";

function getBulletText(bullet: any): string {
  if (typeof bullet === "string") return bullet;
  if (bullet && typeof bullet === "object") {
    return bullet.polished || bullet.expanded || bullet.originalInput || "";
  }
  return "";
}

function getExperience(resume: any) {
  if (Array.isArray(resume?.experience)) return resume.experience;
  if (Array.isArray(resume?.experiences)) return resume.experiences;
  return [];
}

function getSkills(resume: any): string[] {
  const skills = resume?.skills;

  if (Array.isArray(skills)) return skills.filter(Boolean);

  if (skills && typeof skills === "object") {
    return [
      ...(Array.isArray(skills.languages) ? skills.languages : []),
      ...(Array.isArray(skills.frameworks) ? skills.frameworks : []),
      ...(Array.isArray(skills.tools) ? skills.tools : []),
      ...(Array.isArray(skills.databases) ? skills.databases : []),
      ...(Array.isArray(skills.cloud) ? skills.cloud : []),
      ...(Array.isArray(skills.concepts) ? skills.concepts : []),
      ...(Array.isArray(skills.additional) ? skills.additional : []),
    ].filter(Boolean);
  }

  return [];
}

export default function GeneratedPage() {
  const router = useRouter();
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadGeneratedResume();

    if (stored?.generated) {
      setResume(stored.generated);
    } else {
      setResume(stored);
    }

    setLoading(false);
  }, []);

  const experience = getExperience(resume);
  const skills = getSkills(resume);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-10">Loading resume...</div>;
  }

  if (!resume) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">No generated resume found</h1>
        <button
          onClick={() => router.push("/builder")}
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Back to Builder
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900">Generated Resume</h1>
          <p className="mt-2 text-slate-600">
            Review your resume first. Keep this page focused and clean.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">Tip:</span> Review bullet wording, remove anything
          inaccurate, and then continue to analysis.
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <header className="border-b border-slate-200 pb-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {resume?.basics?.fullName || "Your Name"}
            </h2>
            <div className="mt-2 text-sm text-slate-600">
              {resume?.basics?.email || ""}
              {resume?.basics?.phone ? ` • ${resume.basics.phone}` : ""}
              {resume?.basics?.location ? ` • ${resume.basics.location}` : ""}
              {resume?.basics?.linkedin ? ` • ${resume.basics.linkedin}` : ""}
              {resume?.basics?.github ? ` • ${resume.basics.github}` : ""}
            </div>
          </header>

          {resume?.summary && (
            <section className="mt-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Summary
              </h3>
              <p className="text-sm leading-6 text-slate-800">{resume.summary}</p>
            </section>
          )}

          {(resume?.basics?.school ||
            resume?.basics?.degree ||
            resume?.basics?.graduationDate ||
            resume?.basics?.gpa) && (
            <section className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Education
              </h3>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{resume?.basics?.school}</p>
                  <p className="text-sm text-slate-700">
                    {resume?.basics?.degree || ""}
                    {resume?.basics?.gpa
                      ? `${resume?.basics?.degree ? " • " : ""}GPA: ${resume.basics.gpa}`
                      : ""}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {resume?.basics?.graduationDate || ""}
                </p>
              </div>
            </section>
          )}

          {Array.isArray(experience) && experience.length > 0 && (
            <section className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Experience
              </h3>
              <div className="space-y-8">
                {experience.map((exp: any, index: number) => (
                  <div key={index}>
                    <p className="font-semibold text-slate-900">{exp?.role}</p>
                    <p className="text-sm text-slate-700">{exp?.organization}</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-800">
                      {(exp?.bullets ?? []).map((bullet: any, i: number) => {
                        const text = getBulletText(bullet);
                        if (!text) return null;
                        return <li key={i}>{text}</li>;
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {Array.isArray(resume?.projects) && resume.projects.length > 0 && (
            <section className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Projects
              </h3>
              <div className="space-y-8">
                {resume.projects.map((project: any, index: number) => (
                  <div key={index}>
                    <p className="font-semibold text-slate-900">{project?.name}</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-800">
                      {(project?.bullets ?? []).map((bullet: any, i: number) => {
                        const text = getBulletText(bullet);
                        if (!text) return null;
                        return <li key={i}>{text}</li>;
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Skills
              </h3>
              <p className="text-sm leading-6 text-slate-800">
                {skills.join(" • ")}
              </p>
            </section>
          )}
        </section>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.push("/analyze")}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Continue to Analysis
          </button>
        </div>
      </div>
    </main>
  );
}