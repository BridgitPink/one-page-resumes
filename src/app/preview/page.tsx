"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ExperienceEntry = {
  role: string;
  organization: string;
  details: string;
};

type ProjectEntry = {
  name: string;
  details: string;
};

type ResumeFormData = {
  basics: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    school: string;
    degree: string;
    graduationDate: string;
    gpa: string;
  };
  target: {
    role: string;
    industry: string;
    jobDescription: string;
  };
  experiences: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string;
  extras: string;
};

export default function PreviewPage() {
  const [data, setData] = useState<ResumeFormData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("resumeFormData");
    if (raw) {
      setData(JSON.parse(raw));
    }
  }, []);

  if (!data) {
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

  const skills = data.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              Mock Resume Preview
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Structured preview from user input
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              This is the placeholder generation flow. Next we’ll replace this with AI-generated STAR bullets, keyword alignment, and scoring.
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
            <h2 className="text-xl font-semibold">Resume Summary Snapshot</h2>

            <div className="mt-6 space-y-5 text-sm text-slate-300">
              <div>
                <p className="font-medium text-white">Target Role</p>
                <p>{data.target.role || "Not provided"}</p>
              </div>
              <div>
                <p className="font-medium text-white">Industry</p>
                <p>{data.target.industry || "Not provided"}</p>
              </div>
              <div>
                <p className="font-medium text-white">Experience Entries</p>
                <p>{data.experiences.filter((x) => x.role || x.organization || x.details).length}</p>
              </div>
              <div>
                <p className="font-medium text-white">Projects</p>
                <p>{data.projects.filter((x) => x.name || x.details).length}</p>
              </div>
              <div>
                <p className="font-medium text-white">Skills Listed</p>
                <p>{skills.length}</p>
              </div>
              <div>
                <p className="font-medium text-white">Job Description Added</p>
                <p>{data.target.jobDescription ? "Yes" : "No"}</p>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white p-10 text-slate-900 shadow-2xl shadow-black/30">
            <header className="border-b border-slate-200 pb-6">
              <h1 className="text-3xl font-bold">
                {data.basics.fullName || "Your Name"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {[
                  data.basics.email,
                  data.basics.phone,
                  data.basics.location,
                  data.basics.linkedin,
                  data.basics.github,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>

              {data.target.role && (
                <p className="mt-4 text-base font-medium text-slate-800">
                  Target Role: {data.target.role}
                </p>
              )}
            </header>

            <ResumeSection title="Education">
              <p className="font-semibold">{data.basics.school || "School Name"}</p>
              <p className="mt-1">
                {data.basics.degree || "Degree / Major"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {[
                  data.basics.graduationDate && `Graduation: ${data.basics.graduationDate}`,
                  data.basics.gpa && `GPA: ${data.basics.gpa}`,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </ResumeSection>

            <ResumeSection title="Experience">
              <div className="space-y-5">
                {data.experiences
                  .filter((exp) => exp.role || exp.organization || exp.details)
                  .map((experience, index) => (
                    <div key={`${experience.role}-${index}`}>
                      <div className="flex flex-col justify-between gap-1 sm:flex-row">
                        <h3 className="font-semibold">
                          {experience.role || "Role"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {experience.organization || "Organization"}
                        </p>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {experience.details}
                      </p>
                    </div>
                  ))}

                {data.experiences.filter(
                  (exp) => exp.role || exp.organization || exp.details
                ).length === 0 && (
                  <p className="text-sm text-slate-600">
                    No experience added yet.
                  </p>
                )}
              </div>
            </ResumeSection>

            <ResumeSection title="Projects">
              <div className="space-y-5">
                {data.projects
                  .filter((project) => project.name || project.details)
                  .map((project, index) => (
                    <div key={`${project.name}-${index}`}>
                      <h3 className="font-semibold">
                        {project.name || "Project Name"}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {project.details}
                      </p>
                    </div>
                  ))}

                {data.projects.filter((project) => project.name || project.details)
                  .length === 0 && (
                  <p className="text-sm text-slate-600">
                    No projects added yet.
                  </p>
                )}
              </div>
            </ResumeSection>

            <ResumeSection title="Skills">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
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

            <ResumeSection title="Extras">
              {data.extras ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {data.extras}
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  No extras added yet.
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