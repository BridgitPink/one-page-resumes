"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ExperienceEntry,
  ProjectEntry,
  ResumeFormData,
} from "@/types/resume";

const emptyExperience = (): ExperienceEntry => ({
  role: "",
  organization: "",
  details: "",
});

const emptyProject = (): ProjectEntry => ({
  name: "",
  details: "",
});

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

  const updateBasics = (
    field: keyof ResumeFormData["basics"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        [field]: value,
      },
    }));
  };

  const updateTarget = (
    field: keyof ResumeFormData["target"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      target: {
        ...prev.target,
        [field]: value,
      },
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

  const handleGenerateResume = () => {
    localStorage.setItem("resumeFormData", JSON.stringify(formData));
    router.push("/preview");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            Resume Builder
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Tell us what you did. We’ll help turn it into a strong one-page resume.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Do not worry about perfect wording. Just describe your experience in plain
            English. Messy notes are completely fine.
          </p>
        </div>

        <form className="mt-12 space-y-8">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">1. Basic Information</h2>
            <p className="mt-2 text-sm text-slate-300">
              Start with the basics so we can build your resume header and education section.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={formData.basics.fullName}
                onChange={(value) => updateBasics("fullName", value)}
              />
              <Input
                label="Email"
                placeholder="jane@email.com"
                value={formData.basics.email}
                onChange={(value) => updateBasics("email", value)}
              />
              <Input
                label="Phone"
                placeholder="(555) 555-5555"
                value={formData.basics.phone}
                onChange={(value) => updateBasics("phone", value)}
              />
              <Input
                label="Location"
                placeholder="Raleigh, NC"
                value={formData.basics.location}
                onChange={(value) => updateBasics("location", value)}
              />
              <Input
                label="LinkedIn"
                placeholder="linkedin.com/in/janedoe"
                value={formData.basics.linkedin}
                onChange={(value) => updateBasics("linkedin", value)}
              />
              <Input
                label="GitHub or Portfolio"
                placeholder="github.com/janedoe"
                value={formData.basics.github}
                onChange={(value) => updateBasics("github", value)}
              />
              <Input
                label="School"
                placeholder="Fayetteville State University"
                value={formData.basics.school}
                onChange={(value) => updateBasics("school", value)}
              />
              <Input
                label="Degree / Major"
                placeholder="B.S. in Computer Science"
                value={formData.basics.degree}
                onChange={(value) => updateBasics("degree", value)}
              />
              <Input
                label="Graduation Date"
                placeholder="May 2027"
                value={formData.basics.graduationDate}
                onChange={(value) => updateBasics("graduationDate", value)}
              />
              <Input
                label="GPA (optional)"
                placeholder="3.8"
                value={formData.basics.gpa}
                onChange={(value) => updateBasics("gpa", value)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">2. Career Target</h2>
            <p className="mt-2 text-sm text-slate-300">
              Tell us what kind of role you want so we can tailor the resume.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label="Target Role"
                placeholder="Software Engineering Intern"
                value={formData.target.role}
                onChange={(value) => updateTarget("role", value)}
              />
              <Input
                label="Target Industry"
                placeholder="Tech / AI / Robotics"
                value={formData.target.industry}
                onChange={(value) => updateTarget("industry", value)}
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Paste the Job Description"
                placeholder="Paste the full job description here. We will use it to identify keywords, skills, and role-specific language."
                rows={8}
                value={formData.target.jobDescription}
                onChange={(value) => updateTarget("jobDescription", value)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">3. Experience Brain Dump</h2>
            <p className="mt-2 text-sm text-slate-300">
              Do not try to make it sound professional yet. Just describe what you did,
              who you helped, what tools you used, and what changed because of your work.
            </p>

            <div className="mt-6 space-y-6">
              {formData.experiences.map((experience, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={`Role #${index + 1}`}
                      placeholder="IT Assistant"
                      value={experience.role}
                      onChange={(value) =>
                        updateExperience(index, "role", value)
                      }
                    />
                    <Input
                      label="Organization"
                      placeholder="Campus IT Help Desk"
                      value={experience.organization}
                      onChange={(value) =>
                        updateExperience(index, "organization", value)
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <TextArea
                      label="What did you do?"
                      placeholder="Example: I helped students and staff troubleshoot laptop issues, reset passwords, install software, and document tickets. I also helped organize equipment and speed up the check-in process."
                      rows={6}
                      value={experience.details}
                      onChange={(value) =>
                        updateExperience(index, "details", value)
                      }
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
            <p className="mt-2 text-sm text-slate-300">
              Include school, personal, hackathon, research, or portfolio projects.
            </p>

            <div className="mt-6 space-y-6">
              {formData.projects.map((project, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                >
                  <Input
                    label={`Project #${index + 1} Name`}
                    placeholder="Satellite Vehicle Detection Pipeline"
                    value={project.name}
                    onChange={(value) => updateProject(index, "name", value)}
                  />

                  <div className="mt-4">
                    <TextArea
                      label="Describe the project"
                      placeholder="What did you build, why did you build it, what tools did you use, and what was the result?"
                      rows={5}
                      value={project.details}
                      onChange={(value) =>
                        updateProject(index, "details", value)
                      }
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
            <p className="mt-2 text-sm text-slate-300">
              Add any technical and professional skills you already know. We can also
              suggest missing ones later.
            </p>

            <div className="mt-6 grid gap-4">
              <TextArea
                label="Skills"
                placeholder="Example: Python, Java, SQL, Git, React, teamwork, troubleshooting, documentation"
                rows={4}
                value={formData.skills}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, skills: value }))
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">6. Extras</h2>
            <p className="mt-2 text-sm text-slate-300">
              Add anything that could strengthen the resume, especially if you are early in your career.
            </p>

            <div className="mt-6 grid gap-4">
              <TextArea
                label="Leadership, Volunteer Work, Certifications, Clubs, Awards, Coursework"
                placeholder="Example: Women in Technology club, volunteer coding workshop, Google Data Analytics Certificate, relevant coursework in Data Structures and Machine Learning"
                rows={5}
                value={formData.extras}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, extras: value }))
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
            <h2 className="text-2xl font-semibold">Next Step</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              For now, this will generate a mock structured preview from your input.
              Next, we’ll connect a real AI pipeline.
            </p>

            <button
              type="button"
              onClick={handleGenerateResume}
              className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Generate Resume
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}

type InputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

function Input({ label, placeholder, value, onChange }: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-white/30"
      />
    </label>
  );
}

type TextAreaProps = {
  label: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
};

function TextArea({
  label,
  placeholder,
  rows = 5,
  value,
  onChange,
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </span>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-white/30"
      />
    </label>
  );
}