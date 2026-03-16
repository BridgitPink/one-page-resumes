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

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-neutral-400 pb-1">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-neutral-900">
        {title}
      </h2>
    </div>
  );
}

function getExperience(resume: any) {
  if (Array.isArray(resume?.experience)) return resume.experience;
  if (Array.isArray(resume?.experiences)) return resume.experiences;
  return [];
}

function getProjects(resume: any) {
  if (!Array.isArray(resume?.projects)) return [];
  return resume.projects;
}

function shouldShowSummary(resume: any): boolean {
  if (!resume?.summary?.trim()) return false;

  const experience = getExperience(resume);
  const projects = getProjects(resume);

  const experienceBullets = experience.reduce(
    (sum: number, item: any) => sum + (item.bullets?.length ?? 0),
    0
  );
  const projectBullets = projects.reduce(
    (sum: number, item: any) => sum + (item.bullets?.length ?? 0),
    0
  );

  const totalBullets = experienceBullets + projectBullets;

  // Show summary only if there are fewer than 6 total bullets (experience + projects)
  // This ensures the summary is included when content is sparse, helping fill the page
  return totalBullets < 6;
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
  const basics = resume?.basics ?? {};
  const target = resume?.target ?? {};
  const projects = Array.isArray(resume?.projects) ? resume.projects : [];
  const extras = Array.isArray(resume?.extras) ? resume.extras : [];

  const contactItems = [
    basics.email,
    basics.phone,
    basics.location,
    basics.linkedin,
    basics.github,
  ].filter(Boolean);

  const educationLeft = [basics.school, basics.degree].filter(Boolean).join(" | ");
  const educationRight = [
    basics.graduationDate,
    basics.gpa ? `GPA: ${basics.gpa}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

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
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex justify-center px-4 py-8">
        <article className="w-full max-w-[850px] bg-white text-black">
          {/* Top navigation bar */}
          <div className="mb-6 flex justify-between items-center border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-semibold text-slate-900">Generated Resume</h1>
            <button
              onClick={() => router.push("/analyze")}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Continue
            </button>
          </div>

          {/* Resume content */}
          <div className="px-10 py-8">
            {/* Header */}
            <header className="border-b border-black pb-4 text-center">
              <h1 className="text-[30px] font-bold uppercase tracking-[0.08em]">
                {basics.fullName || "Your Name"}
              </h1>

              {target.role ? (
                <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-700">
                  {target.role}
                </p>
              ) : null}

              {contactItems.length > 0 ? (
                <p className="mt-3 text-[12px] leading-5 text-neutral-800">
                  {contactItems.join(" | ")}
                </p>
              ) : null}
            </header>

            {/* Summary */}
            {shouldShowSummary(resume) && (
              <section className="mt-5">
                <SectionTitle title="Summary" />
                <p className="mt-2 text-[13px] leading-6">{resume.summary}</p>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section className="mt-5">
                <SectionTitle title="Skills" />
                <p className="mt-2 text-[13px] leading-6">
                  {skills.join(" • ")}
                </p>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section className="mt-5">
                <SectionTitle title="Experience" />
                <div className="mt-3 space-y-5">
                  {experience.map((item: any, index: number) => (
                    <div key={`${item.role}-${item.organization}-${index}`}>
                      <h3 className="text-[14px] font-bold">{item.role}</h3>
                      <p className="text-[13px] italic text-neutral-800">
                        {item.organization}
                      </p>

                      {item.bullets?.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6">
                          {item.bullets.map((bullet: any, bulletIndex: number) => {
                            const text = getBulletText(bullet);
                            if (!text) return null;
                            return <li key={bulletIndex}>{text}</li>;
                          })}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section className="mt-5">
                <SectionTitle title="Projects" />
                <div className="mt-3 space-y-5">
                  {projects.map((project: any, index: number) => (
                    <div key={`${project.name}-${index}`}>
                      <h3 className="text-[14px] font-bold">{project.name}</h3>

                      {project.bullets?.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6">
                          {project.bullets.map((bullet: any, bulletIndex: number) => {
                            const text = getBulletText(bullet);
                            if (!text) return null;
                            return <li key={bulletIndex}>{text}</li>;
                          })}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {(educationLeft || educationRight) ? (
              <section className="mt-5">
                <SectionTitle title="Education" />
                <div className="mt-3 flex items-start justify-between gap-4 text-[13px] leading-6">
                  <div className="font-medium">{educationLeft}</div>
                  <div className="text-right text-neutral-800">{educationRight}</div>
                </div>
              </section>
            ) : null}

            {/* Additional/Extras */}
            {extras.length > 0 ? (
              <section className="mt-5">
                <SectionTitle title="Additional" />
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6">
                  {extras.map((item: string, index: number) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}