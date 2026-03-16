"use client";

import { ClickableBullet } from "@/components/resume/ClickableBullet";
import type { BoldWordsState } from "@/lib/resume/storage";
import { getBulletText } from "@/lib/resume/editorHelpers";

interface ModernResumeProps {
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

export function ModernResume({ resume, boldState, onWordClick }: ModernResumeProps) {
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
      <header className="pb-6 border-b-2 border-slate-300">
        <h1 className="text-[28px] font-bold text-slate-800">{basics.fullName || "Your Name"}</h1>
        {target.role && <p className="mt-1 text-[14px] font-semibold text-slate-800">{target.role}</p>}
        {contactItems.length > 0 && <p className="mt-2 text-[12px] text-slate-600 space-x-3">{contactItems.join(" • ")}</p>}
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mt-6">
          <h2 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Summary</h2>
          <p className="mt-3 text-[13px] leading-6 text-slate-700">{resume.summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-[12px] font-medium rounded">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Experience</h2>
          <div className="mt-4 space-y-5">
            {experience.map((item, expIndex) => (
              <div key={expIndex}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{item.role || ""}</p>
                    <p className="text-[12px] text-slate-700 font-medium">{item.organization || ""}</p>
                  </div>
                  {item.date && <p className="text-[12px] text-slate-600 flex-shrink-0">{item.date}</p>}
                </div>
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="mt-2 list-none space-y-1.5 pl-0">
                    {item.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-2">
                        <span className="mt-1 flex-shrink-0 text-slate-600">▪</span>
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
        <section className="mt-6">
          <h2 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Projects</h2>
          <div className="mt-4 space-y-5">
            {projects.map((project, projIndex) => (
              <div key={projIndex}>
                <p className="text-[13px] font-bold text-slate-800">{project.name || ""}</p>
                {project.link && <p className="text-[12px] text-slate-700">{project.link}</p>}
                {project.bullets && project.bullets.length > 0 && (
                  <ul className="mt-2 list-none space-y-1.5 pl-0">
                    {project.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-2">
                        <span className="mt-1 flex-shrink-0 text-slate-600">▪</span>
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

      {/* Education */}
      {(basics.school || basics.degree) && (
        <section className="mt-6">
          <h2 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Education</h2>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              {educationLeft && <p className="text-[13px] font-medium text-slate-800">{educationLeft}</p>}
            </div>
            {educationRight && <p className="text-[13px] text-slate-600">{educationRight}</p>}
          </div>
        </section>
      )}

      {/* Extras */}
      {extras.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[14px] font-bold text-slate-800 border-b border-slate-200 pb-2">Additional</h2>
          <ul className="mt-3 list-none space-y-1.5 pl-0">
            {extras.map((extra, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-1 flex-shrink-0 text-slate-600">▪</span>
                <p className="text-[13px] text-slate-700">{extra}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
