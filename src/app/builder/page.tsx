"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  clearResumeAnalysis,
  clearSuggestedState,
  saveGeneratedResume,
  saveResumeFormData,
} from "@/lib/resume/storage";
import { Input } from "@/components/form/Input";
import { TextArea } from "@/components/form/TextArea";
import type {
  ExperienceEntry,
  ProjectEntry,
  ResumeFormData,
} from "@/types/resume";

const emptyExperience = (): ExperienceEntry => ({
  role: "",
  organization: "",
  details: "",
  date: "",
});

const emptyProject = (): ProjectEntry => ({
  name: "",
  details: "",
  link: "",
});

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function bulletToText(bullet: any): string {
  if (typeof bullet === "string") return bullet.trim();
  if (!bullet || typeof bullet !== "object") return "";

  return (
    String(bullet.polished ?? "").trim() ||
    String(bullet.expanded ?? "").trim() ||
    String(bullet.originalInput ?? "").trim() ||
    ""
  );
}

function normalizeGeneratedResume(raw: any, formData: ResumeFormData) {
  const source = raw?.generated ?? raw?.resume ?? raw ?? {};

  const experienceSource = Array.isArray(source?.experiences)
    ? source.experiences
    : Array.isArray(source?.experience)
      ? source.experience
      : [];

  const projectSource = Array.isArray(source?.projects) ? source.projects : [];

  return {
    basics: {
      fullName:
        source?.basics?.fullName ??
        source?.basics?.name ??
        formData.basics.fullName,
      email: source?.basics?.email ?? formData.basics.email,
      phone: source?.basics?.phone ?? formData.basics.phone,
      location: source?.basics?.location ?? formData.basics.location,
      linkedin: source?.basics?.linkedin ?? formData.basics.linkedin,
      github: source?.basics?.github ?? formData.basics.github,
      school: source?.basics?.school ?? formData.basics.school,
      degree: source?.basics?.degree ?? formData.basics.degree,
      graduationDate:
        source?.basics?.graduationDate ?? formData.basics.graduationDate,
      gpa: source?.basics?.gpa ?? formData.basics.gpa,
    },
    target: {
      role: source?.target?.role ?? formData.target.role,
      industry: source?.target?.industry ?? formData.target.industry,
      jobDescription:
        source?.target?.jobDescription ?? formData.target.jobDescription,
    },
    summary:
      typeof source?.summary === "string" && source.summary.trim()
        ? source.summary
        : `Early-career candidate pursuing ${
            formData.basics.degree || "a degree"
          } and targeting ${formData.target.role || "new opportunities"}.`,
    experience:
      experienceSource.length > 0
        ? experienceSource.map((exp: any) => ({
            role: exp?.role ?? "",
            organization: exp?.organization ?? exp?.company ?? "",
            date: exp?.date ?? "",
            bullets: Array.isArray(exp?.bullets)
              ? exp.bullets.map(bulletToText).filter(Boolean)
              : [],
          }))
        : [],
    projects:
      projectSource.length > 0
        ? projectSource.map((project: any) => ({
            name: project?.name ?? "",
            link: project?.link ?? "",
            bullets: Array.isArray(project?.bullets)
              ? project.bullets.map(bulletToText).filter(Boolean)
              : [],
          }))
        : [],
    skills: Array.isArray(source?.skills)
      ? source.skills.map(String).filter(Boolean)
      : typeof source?.skills === "string"
        ? source.skills
            .split(",")
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [],
    extras: Array.isArray(source?.extras)
      ? source.extras.map(String).filter(Boolean)
      : typeof source?.extras === "string"
        ? source.extras
            .split("\n")
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [],
  };
}

export default function BuilderPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<ResumeFormData>({
    basics: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      school: "",
      degree: "",
      graduationDate: "",
      gpa: "",
    },
    target: {
      role: "",
      industry: "",
      jobDescription: "",
    },
    experiences: [emptyExperience()],
    projects: [emptyProject()],
    skills: "",
    extras: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBasics = (
    field: keyof ResumeFormData["basics"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      basics: { ...prev.basics, [field]: value },
    }));
  };

  const updateTarget = (
    field: keyof ResumeFormData["target"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      target: { ...prev.target, [field]: value },
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, emptyExperience()],
    }));
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, emptyProject()],
    }));
  };

  const updateProject = (
    index: number,
    field: keyof ProjectEntry,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleGenerateResume = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      saveResumeFormData(formData);
      clearResumeAnalysis();
      clearSuggestedState();

      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate resume.");
      }

      const data = await response.json();
      const normalizedResume = normalizeGeneratedResume(data, formData);

      saveGeneratedResume(normalizedResume);
      router.push("/generated");
    } catch (err) {
      console.error("Generation error:", err);
      let userMessage = "Something went wrong while generating the resume.";
      if (err instanceof Error) {
        userMessage = err.message;
      }
      if (err instanceof SyntaxError) {
        userMessage = "Invalid response from server. Check server logs.";
      }
      setError(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            Resume Builder
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Tell us what you did. We’ll help turn it into a strong one-page
            resume.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Keep it simple. Rough notes are fine.
          </p>
        </div>

        <form className="mt-12 space-y-8">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">1. Basic Information</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Full Name" value={formData.basics.fullName} onChange={(v) => updateBasics("fullName", v)} />
              <Input label="Email" value={formData.basics.email} onChange={(v) => updateBasics("email", v)} />
              <Input label="Phone" value={formData.basics.phone} onChange={(v) => updateBasics("phone", v)} />
              <Input label="Location" value={formData.basics.location} onChange={(v) => updateBasics("location", v)} />
              <Input label="LinkedIn" value={formData.basics.linkedin} onChange={(v) => updateBasics("linkedin", v)} />
              <Input label="GitHub or Portfolio" value={formData.basics.github} onChange={(v) => updateBasics("github", v)} />
              <Input label="School" value={formData.basics.school} onChange={(v) => updateBasics("school", v)} />
              <Input label="Degree / Major" value={formData.basics.degree} onChange={(v) => updateBasics("degree", v)} />
              <Input label="Graduation Date" value={formData.basics.graduationDate} onChange={(v) => updateBasics("graduationDate", v)} />
              <Input label="GPA (optional)" value={formData.basics.gpa} onChange={(v) => updateBasics("gpa", v)} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">2. Career Target</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Target Role" value={formData.target.role} onChange={(v) => updateTarget("role", v)} />
              <Input label="Target Industry" value={formData.target.industry} onChange={(v) => updateTarget("industry", v)} />
            </div>
            <div className="mt-4">
              <TextArea
                label="Paste the Job Description"
                rows={8}
                value={formData.target.jobDescription}
                onChange={(v) => updateTarget("jobDescription", v)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">3. Experience</h2>
            <div className="mt-6 space-y-6">
              {formData.experiences.map((experience, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={`Role #${index + 1}`}
                      value={experience.role}
                      onChange={(v) => updateExperience(index, "role", v)}
                    />
                    <Input
                      label="Organization"
                      value={experience.organization}
                      onChange={(v) => updateExperience(index, "organization", v)}
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Date"
                      value={experience.date}
                      placeholder="Jan 2024 – Present"
                      onChange={(v) => updateExperience(index, "date", v)}
                    />
                  </div>
                  <div className="mt-4">
                    <TextArea
                      label="What did you do?"
                      rows={6}
                      value={experience.details}
                      onChange={(v) => updateExperience(index, "details", v)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addExperience}
              className="mt-6 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
            >
              + Add Another Experience
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">4. Projects</h2>
            <div className="mt-6 space-y-6">
              {formData.projects.map((project, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <Input
                    label={`Project #${index + 1} Name`}
                    value={project.name}
                    onChange={(v) => updateProject(index, "name", v)}
                  />
                  <div className="mt-4">
                    <Input
                      label="Link"
                      placeholder="https://github.com/..."
                      value={project.link}
                      onChange={(v) => updateProject(index, "link", v)}
                    />
                  </div>
                  <div className="mt-4">
                    <TextArea
                      label="Describe the project"
                      rows={5}
                      value={project.details}
                      onChange={(v) => updateProject(index, "details", v)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addProject}
              className="mt-6 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
            >
              + Add Another Project
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">5. Skills</h2>
            <div className="mt-6">
              <TextArea
                label="Skills"
                rows={4}
                value={formData.skills}
                onChange={(v) => setFormData((prev) => ({ ...prev, skills: v }))}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">6. Extras</h2>
            <div className="mt-6">
              <TextArea
                label="Leadership, Volunteer Work, Certifications, Clubs, Awards, Coursework"
                rows={5}
                value={formData.extras}
                onChange={(v) => setFormData((prev) => ({ ...prev, extras: v }))}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
            <h2 className="text-2xl font-semibold">Next Step</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Generate your first polished resume draft, then review it on a clean preview page.
            </p>

            <button
              type="button"
              onClick={handleGenerateResume}
              disabled={isGenerating}
              className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating Resume..." : "Generate Resume"}
            </button>

            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          </section>
        </form>
      </div>
    </main>
  );
}