"use client";

import { ClickableBullet } from "@/components/resume/ClickableBullet";
import type { BoldWordsState } from "@/lib/resume/storage";
import { getBulletText } from "@/lib/resume/editorHelpers";

interface ClassicResumeProps {
  resume: {
    basics?: {
      fullName?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
      school?: string;
      degree?: string;
      graduationDate?: string;
      gpa?: string;
    };
    target?: {
      role?: string;
    };
    summary?: string;
    experience?: Array<{
      role?: string;
      organization?: string;
      date?: string;
      bullets?: any[];
    }>;
    projects?: Array<{
      name?: string;
      link?: string;
      bullets?: any[];
    }>;
    skills?: string[];
    extras?: string[];
  };
  boldState: BoldWordsState;
  onWordClick: (section: string, entryIndex: number, bulletIndex: number, wordIndex: number) => void;
}

export function ClassicResume({ resume, boldState, onWordClick }: ClassicResumeProps) {
  const basics = resume?.basics ?? {};
  const target = resume?.target ?? {};
  const experience = Array.isArray(resume?.experience) ? resume.experience : [];
  const projects = Array.isArray(resume?.projects) ? resume.projects : [];
  const skills = Array.isArray(resume?.skills) ? resume.skills : [];
  const extras = Array.isArray(resume?.extras) ? resume.extras : [];

  const contactItems = [basics.email, basics.phone, basics.location, basics.linkedin, basics.github].filter(Boolean);

  const educationLeft = [basics.school, basics.degree].filter(Boolean).join(" | ");
  const educationRight = [basics.graduationDate, basics.gpa ? `GPA: ${basics.gpa}` : ""]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="text-black text-[13px] leading-6">
      {/* Header */}
      <header className="border-b border-black pb-4 text-center">
        <h1 className="text-[30px] font-bold uppercase tracking-[0.08em]">{basics.fullName || "Your Name"}</h1>
        {target.role && <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-700">{target.role}</p>}
        {contactItems.length > 0 && <p className="mt-3 text-[12px] leading-5 text-neutral-800">{contactItems.join(" | ")}</p>}
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mt-5">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.04em]">Summary</h2>
          <p className="mt-2 text-[13px] leading-6">{resume.summary}</p>
        </section>
      )}

      {/* Education */}
      {(basics.school || basics.degree) && (
        <section className="mt-5">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.04em]">Education</h2>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              {educationLeft && <p className="text-[13px] font-medium">{educationLeft}</p>}
            </div>
            {educationRight && <p className="text-[13px] text-neutral-700">{educationRight}</p>}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.04em]">Experience</h2>
          <div className="mt-3 space-y-4">
            {experience.map((item, expIndex) => (
              <div key={expIndex}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-bold">{item.role || ""}</p>
                    <p className="text-[13px] italic text-neutral-800">{item.organization || ""}</p>
                  </div>
                  {item.date && <p className="text-[13px] text-neutral-700 flex-shrink-0">{item.date}</p>}
                </div>
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="mt-2 list-none space-y-1 pl-0">
                    {item.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-2">
                        <span className="mt-1 flex-shrink-0">•</span>
                        <div className="flex-1">
                          <ClickableBullet
                            text={getBulletText(bullet)}
                            section="experience"
                            entryIndex={expIndex}
                            bulletIndex={bulletIndex}
                            boldState={boldState}
                            onWordClick={onWordClick}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.04em]">Projects</h2>
          <div className="mt-3 space-y-4">
            {projects.map((project, projIndex) => (
              <div key={projIndex}>
                <p className="text-[14px] font-bold">{project.name || ""}</p>
                {project.link && <p className="text-[13px] text-neutral-700">{project.link}</p>}
                {project.bullets && project.bullets.length > 0 && (
                  <ul className="mt-2 list-none space-y-1 pl-0">
                    {project.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-2">
                        <span className="mt-1 flex-shrink-0">•</span>
                        <div className="flex-1">
                          <ClickableBullet
                            text={getBulletText(bullet)}
                            section="projects"
                            entryIndex={projIndex}
                            bulletIndex={bulletIndex}
                            boldState={boldState}
                            onWordClick={onWordClick}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.04em]">Skills</h2>
          <p className="mt-2 text-[13px] leading-6">{skills.join(", ")}</p>
        </section>
      )}

      {/* Extras */}
      {extras.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.04em]">Additional</h2>
          <ul className="mt-2 list-none space-y-1 pl-0">
            {extras.map((extra, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-1 flex-shrink-0">•</span>
                <p className="text-[13px]">{extra}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
