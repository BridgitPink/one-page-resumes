"use client";

import { ClickableBullet } from "@/components/resume/ClickableBullet";
import type { BoldWordsState } from "@/lib/resume/storage";
import { getBulletText } from "@/lib/resume/editorHelpers";

interface CompactResumeProps {
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

export function CompactResume({ resume, boldState, onWordClick }: CompactResumeProps) {
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
    <div className="text-black text-[12px] leading-5">
      {/* Header */}
      <header className="pb-2">
        <h1 className="text-[18px] font-bold uppercase">{basics.fullName || "Your Name"}</h1>
        <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-gray-700">
          {contactItems.map((item, idx) => (
            <span key={idx}>
              {item}
              {idx < contactItems.length - 1 && <span className="mx-1">|</span>}
            </span>
          ))}
        </div>
        {target.role && <p className="mt-1 text-[12px] font-semibold">{target.role}</p>}
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mt-2">
          <h2 className="text-[12px] font-bold uppercase border-b border-gray-400 pb-0.5">Summary</h2>
          <p className="mt-1 text-[12px] leading-5 text-gray-800">{resume.summary}</p>
        </section>
      )}

      {/* Education */}
      {(basics.school || basics.degree) && (
        <section className="mt-2">
          <h2 className="text-[12px] font-bold uppercase border-b border-gray-400 pb-0.5">Education</h2>
          <div className="mt-1 flex items-start justify-between gap-2">
            <div className="text-[12px]">
              {educationLeft && <p className="font-medium">{educationLeft}</p>}
            </div>
            {educationRight && <p className="text-[11px] text-gray-700 flex-shrink-0">{educationRight}</p>}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mt-2">
          <h2 className="text-[12px] font-bold uppercase border-b border-gray-400 pb-0.5">Experience</h2>
          <div className="mt-2 space-y-2">
            {experience.map((item, expIndex) => (
              <div key={expIndex}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-bold">{item.role || ""}</p>
                    <p className="text-[11px] text-gray-700">{item.organization || ""}</p>
                  </div>
                  {item.date && <p className="text-[11px] text-gray-700 flex-shrink-0">{item.date}</p>}
                </div>
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="mt-1 list-none space-y-0.5 pl-0">
                    {item.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-1">
                        <span className="flex-shrink-0">•</span>
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
        <section className="mt-2">
          <h2 className="text-[12px] font-bold uppercase border-b border-gray-400 pb-0.5">Projects</h2>
          <div className="mt-2 space-y-2">
            {projects.map((project, projIndex) => (
              <div key={projIndex}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-bold">{project.name || ""}</p>
                  {project.link && <p className="text-[11px] text-gray-700 flex-shrink-0">{project.link}</p>}
                </div>
                {project.bullets && project.bullets.length > 0 && (
                  <ul className="mt-1 list-none space-y-0.5 pl-0">
                    {project.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex gap-1">
                        <span className="flex-shrink-0">•</span>
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
        <section className="mt-2">
          <h2 className="text-[12px] font-bold uppercase border-b border-gray-400 pb-0.5">Skills</h2>
          <p className="mt-1 text-[12px] leading-5">{skills.join(" • ")}</p>
        </section>
      )}

      {/* Extras */}
      {extras.length > 0 && (
        <section className="mt-2">
          <h2 className="text-[12px] font-bold uppercase border-b border-gray-400 pb-0.5">Additional</h2>
          <ul className="mt-1 list-none space-y-0.5 pl-0">
            {extras.map((extra, index) => (
              <li key={index} className="flex gap-1">
                <span className="flex-shrink-0">•</span>
                <p className="text-[12px]">{extra}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
