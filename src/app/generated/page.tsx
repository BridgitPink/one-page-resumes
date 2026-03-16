"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  loadGeneratedResume,
  saveGeneratedResume,
  estimatePageFit,
} from "@/lib/resume/storage";
import type { GeneratedResume, ResumeBullet } from "@/types/resume";

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

function EditableField({
  value,
  onChange,
  className = "",
  placeholder = "",
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      if (editRef.current.textContent) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(editRef.current);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editRef.current) {
      const newValue = editRef.current.textContent || "";
      onChange(newValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (editRef.current) {
      editRef.current.textContent = value;
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      ref={editRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={() => !isEditing && setIsEditing(true)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={`${
        isEditing
          ? className
          : `${className} text-gray-500 hover:text-neutral-900 cursor-text`
      } bg-white transition-colors whitespace-pre-wrap`}
      style={isEditing ? { outline: "none" } : {}}
    >
      {value || placeholder}
    </div>
  );
}

interface BulletListItemProps {
  bullet: ResumeBullet;
  onEdit: (newText: string) => void;
  onDelete: () => void;
  isSuggestion?: boolean;
  onAcceptSuggestion?: () => void;
  onDismissSuggestion?: () => void;
}

function BulletListItem({
  bullet,
  onEdit,
  onDelete,
  isSuggestion = false,
  onAcceptSuggestion,
  onDismissSuggestion,
}: BulletListItemProps) {
  const [isEditingBullet, setIsEditingBullet] = useState(false);
  const [editText, setEditText] = useState(getBulletText(bullet));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingBullet && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingBullet]);

  const handleSaveBullet = () => {
    onEdit(editText);
    setIsEditingBullet(false);
  };

  const handleCancelBullet = () => {
    setEditText(getBulletText(bullet));
    setIsEditingBullet(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveBullet();
    } else if (e.key === "Escape") {
      handleCancelBullet();
    }
  };

  const bulletText = getBulletText(bullet);

  if (isEditingBullet) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleSaveBullet}
        onKeyDown={handleKeyDown}
        className="ml-3 w-full bg-white text-[13px] focus:outline-none leading-6"
      />
    );
  }

  return (
    <li
      className={`group relative flex gap-2 ${
        isSuggestion ? "text-gray-400 opacity-60" : "text-neutral-900"
      }`}
      onClick={
        isSuggestion && onAcceptSuggestion ? onAcceptSuggestion : undefined
      }
      style={isSuggestion ? { cursor: "pointer" } : {}}
    >
      <span className="flex-shrink-0">•</span>
      <span className="flex-1 text-[13px] leading-6">
        {isSuggestion ? (
          <span className="flex items-center gap-2">
            <span>⚡ {bulletText}</span>
          </span>
        ) : (
          bulletText
        )}
      </span>
      {!isSuggestion && (
        <div className="absolute right-0 top-0 hidden gap-1 group-hover:flex">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingBullet(true);
            }}
            className="p-1 text-neutral-600 hover:text-neutral-900"
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-neutral-600 hover:text-red-600"
            title="Delete"
          >
            ×
          </button>
        </div>
      )}
      {isSuggestion && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismissSuggestion?.();
          }}
          className="ml-2 text-gray-400 hover:text-gray-600"
          title="Dismiss"
        >
          ×
        </button>
      )}
    </li>
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
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<{
    [key: string]: ResumeBullet;
  }>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const stored = loadGeneratedResume<any>();

    if (stored?.generated) {
      setResume(stored.generated);
    } else {
      setResume(stored);
    }

    setLoading(false);
  }, []);

  const updateResume = useCallback((updatedResume: GeneratedResume) => {
    setResume(updatedResume);
    saveGeneratedResume({ generated: updatedResume });
  }, []);

  const generateSuggestion = useCallback(
    async (sectionKey: string, type: "experience" | "project", context: any) => {
      setLoadingSuggestion((prev) => ({ ...prev, [sectionKey]: true }));

      try {
        const { usagePercent, isFull } = estimatePageFit(resume);

        if (isFull) {
          alert(
            `Resume is ${usagePercent}% full. Try deleting some bullets before adding suggestions.`
          );
          setLoadingSuggestion((prev) => ({ ...prev, [sectionKey]: false }));
          return;
        }

        const body =
          type === "experience"
            ? {
                type: "experience",
                role: context.role,
                organization: context.organization,
                existingBullets: context.bullets,
                targetRole: resume?.target.role || "",
                jobDescription: resume?.target.jobDescription || "",
                skills: resume?.skills || [],
              }
            : {
                type: "project",
                name: context.name,
                existingBullets: context.bullets,
                targetRole: resume?.target.role || "",
                jobDescription: resume?.target.jobDescription || "",
                skills: resume?.skills || [],
              };

        const response = await fetch("/api/suggest-bullet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error("Failed to generate suggestion:", response.statusText);
          return;
        }

        const data = await response.json();
        setSuggestions((prev) => ({ ...prev, [sectionKey]: data.bullet }));
      } catch (error) {
        console.error("Error generating suggestion:", error);
      } finally {
        setLoadingSuggestion((prev) => ({ ...prev, [sectionKey]: false }));
      }
    },
    [resume]
  );

  const acceptSuggestion = useCallback(
    (sectionKey: string, type: "experience" | "project", index: number) => {
      const suggestion = suggestions[sectionKey];
      if (!suggestion || !resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;

      if (type === "experience" && updatedResume.experience && updatedResume.experience[index]) {
        updatedResume.experience[index].bullets.push(suggestion);
      } else if (type === "project" && updatedResume.projects && updatedResume.projects[index]) {
        updatedResume.projects[index].bullets.push(suggestion);
      }

      updateResume(updatedResume);
      setSuggestions((prev) => {
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });
    },
    [suggestions, resume, updateResume]
  );

  const dismissSuggestion = useCallback((sectionKey: string) => {
    setSuggestions((prev) => {
      const next = { ...prev };
      delete next[sectionKey];
      return next;
    });
  }, []);

  const removeSummary = useCallback(() => {
    if (!resume) return;
    const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
    updatedResume.summary = "";
    updateResume(updatedResume);
  }, [resume, updateResume]);

  const deleteExperience = useCallback(
    (index: number) => {
      if (!resume || !Array.isArray(resume.experience)) return;
      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
      updatedResume.experience.splice(index, 1);
      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  const deleteProject = useCallback(
    (index: number) => {
      if (!resume || !Array.isArray(resume.projects)) return;
      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
      updatedResume.projects.splice(index, 1);
      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  const updateBullet = useCallback(
    (
      type: "experience" | "project",
      entryIndex: number,
      bulletIndex: number,
      newText: string
    ) => {
      if (!resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;

      if (type === "experience" && updatedResume.experience?.[entryIndex]) {
        updatedResume.experience[entryIndex].bullets[bulletIndex] = {
          polished: newText,
        } as ResumeBullet;
      } else if (type === "project" && updatedResume.projects?.[entryIndex]) {
        updatedResume.projects[entryIndex].bullets[bulletIndex] = {
          polished: newText,
        } as ResumeBullet;
      }

      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  const deleteBullet = useCallback(
    (type: "experience" | "project", entryIndex: number, bulletIndex: number) => {
      if (!resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;

      if (type === "experience" && updatedResume.experience?.[entryIndex]) {
        updatedResume.experience[entryIndex].bullets.splice(bulletIndex, 1);
      } else if (type === "project" && updatedResume.projects?.[entryIndex]) {
        updatedResume.projects[entryIndex].bullets.splice(bulletIndex, 1);
      }

      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  const deleteSkill = useCallback(
    (index: number) => {
      if (!resume) return;
      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
      updatedResume.skills.splice(index, 1);
      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  const deleteExtra = useCallback(
    (index: number) => {
      if (!resume || !Array.isArray(resume.extras)) return;
      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
      updatedResume.extras.splice(index, 1);
      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Generating Resume</h1>
            <p className="text-sm text-slate-600">Using AI to craft your professional narrative...</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <div className="flex justify-center items-center gap-2 h-12">
              <div className="w-3 h-3 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>

            <div className="space-y-2">
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ animation: "pulse-width 2s ease-in-out infinite" }} />
              </div>
              <p className="text-xs text-slate-500 text-center">Please wait while we optimize your content...</p>
            </div>
          </div>
        </div>

        <style>{`@keyframes pulse-width { 0%, 100% { width: 0%; } 50% { width: 100%; } }`}</style>
      </main>
    );
  }

  if (!resume) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">
          No generated resume found
        </h1>
        <button
          onClick={() => router.push("/builder")}
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Back to Builder
        </button>
      </div>
    );
  }

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

  const educationLeft = [basics.school, basics.degree]
    .filter(Boolean)
    .join(" | ");
  const educationRight = [
    basics.graduationDate,
    basics.gpa ? `GPA: ${basics.gpa}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const { isFull } = estimatePageFit(resume);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Warning banner */}
      <div className="bg-amber-900/20 border-b border-amber-700/30 px-6 py-3">
        <div className="mx-auto max-w-[850px] text-sm text-amber-100">
          ⚠️ <span className="font-medium">Please review and validate all content</span> — AI-generated text should always be verified for accuracy and applicability to your target role.
        </div>
      </div>

      <div className="mx-auto flex justify-center px-4 py-8 flex-1">
        <article className="w-full max-w-[850px] bg-white text-black border-4 border-slate-300 rounded-lg shadow-lg">
          {/* Top navigation bar */}
          <div className="mb-6 flex justify-between items-center border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              Generated Resume
            </h1>
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
              <EditableField
                value={basics.fullName || "Your Name"}
                onChange={(value) => {
                  const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                  updated.basics.fullName = value;
                  updateResume(updated);
                }}
                className="text-[30px] font-bold uppercase tracking-[0.08em]"
              />

              {target.role ? (
                <EditableField
                  value={target.role}
                  onChange={(value) => {
                    const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                    updated.target.role = value;
                    updateResume(updated);
                  }}
                  className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-700"
                />
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <SectionTitle title="Summary" />
                  </div>
                  <button
                    onClick={removeSummary}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Remove summary"
                  >
                    ×
                  </button>
                </div>
                <EditableField
                  value={resume.summary || ""}
                  onChange={(value) => {
                    const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                    updated.summary = value;
                    updateResume(updated);
                  }}
                  className="mt-2 text-[13px] leading-6"
                  multiline
                  placeholder="Add your professional summary..."
                />
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section className="mt-5">
                <SectionTitle title="Skills" />
                <div className="mt-2 text-[13px] leading-6 flex flex-wrap gap-2">
                  {skills.map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="group relative inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-50"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => deleteSkill(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-500 hover:text-red-600"
                        title="Delete skill"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section className="mt-5">
                <SectionTitle title="Experience" />
                <div className="mt-3 space-y-5">
                  {experience.map((item: any, expIndex: number) => {
                    const sectionKey = `exp-${expIndex}`;
                    const suggestion = suggestions[sectionKey];

                    return (
                      <div key={sectionKey} className="group relative pb-4">
                        <EditableField
                          value={item.role || ""}
                          onChange={(value) => {
                            const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                            updated.experience[expIndex].role = value;
                            updateResume(updated);
                          }}
                          className="text-[14px] font-bold"
                          placeholder="Job title"
                        />
                        <EditableField
                          value={item.organization || ""}
                          onChange={(value) => {
                            const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                            updated.experience[expIndex].organization = value;
                            updateResume(updated);
                          }}
                          className="text-[13px] italic text-neutral-800"
                          placeholder="Company name"
                        />

                        {item.bullets?.length ? (
                          <ul className="mt-2 list-none space-y-1 pl-0 text-[13px] leading-6">
                            {item.bullets.map((bullet: any, bulletIndex: number) => (
                              <BulletListItem
                                key={`exp-${expIndex}-bullet-${bulletIndex}`}
                                bullet={bullet}
                                onEdit={(newText) =>
                                  updateBullet(
                                    "experience",
                                    expIndex,
                                    bulletIndex,
                                    newText
                                  )
                                }
                                onDelete={() =>
                                  deleteBullet("experience", expIndex, bulletIndex)
                                }
                              />
                            ))}
                            {suggestion && (
                              <BulletListItem
                                bullet={suggestion}
                                isSuggestion
                                onAcceptSuggestion={() =>
                                  acceptSuggestion(
                                    sectionKey,
                                    "experience",
                                    expIndex
                                  )
                                }
                                onDismissSuggestion={() =>
                                  dismissSuggestion(sectionKey)
                                }
                                onEdit={() => {}}
                                onDelete={() => {}}
                              />
                            )}
                          </ul>
                        ) : null}

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              generateSuggestion(
                                sectionKey,
                                "experience",
                                item
                              )
                            }
                            disabled={loadingSuggestion[sectionKey] || isFull}
                            className="text-[12px] px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingSuggestion[sectionKey]
                              ? "Suggesting..."
                              : isFull
                                ? "Resume full"
                                : "Suggest bullet"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section className="mt-5">
                <SectionTitle title="Projects" />
                <div className="mt-3 space-y-5">
                  {projects.map((project: any, projIndex: number) => {
                    const sectionKey = `proj-${projIndex}`;
                    const suggestion = suggestions[sectionKey];

                    return (
                      <div key={sectionKey} className="group relative pb-4">
                        <EditableField
                          value={project.name || ""}
                          onChange={(value) => {
                            const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                            updated.projects[projIndex].name = value;
                            updateResume(updated);
                          }}
                          className="text-[14px] font-bold"
                          placeholder="Project name"
                        />

                        {project.bullets?.length ? (
                          <ul className="mt-2 list-none space-y-1 pl-0 text-[13px] leading-6">
                            {project.bullets.map((bullet: any, bulletIndex: number) => (
                              <BulletListItem
                                key={`proj-${projIndex}-bullet-${bulletIndex}`}
                                bullet={bullet}
                                onEdit={(newText) =>
                                  updateBullet(
                                    "project",
                                    projIndex,
                                    bulletIndex,
                                    newText
                                  )
                                }
                                onDelete={() =>
                                  deleteBullet("project", projIndex, bulletIndex)
                                }
                              />
                            ))}
                            {suggestion && (
                              <BulletListItem
                                bullet={suggestion}
                                isSuggestion
                                onAcceptSuggestion={() =>
                                  acceptSuggestion(sectionKey, "project", projIndex)
                                }
                                onDismissSuggestion={() =>
                                  dismissSuggestion(sectionKey)
                                }
                                onEdit={() => {}}
                                onDelete={() => {}}
                              />
                            )}
                          </ul>
                        ) : null}

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              generateSuggestion(sectionKey, "project", project)
                            }
                            disabled={loadingSuggestion[sectionKey] || isFull}
                            className="text-[12px] px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingSuggestion[sectionKey]
                              ? "Suggesting..."
                              : isFull
                                ? "Resume full"
                                : "Suggest bullet"}
                          </button>
                          <button
                            onClick={() => deleteProject(projIndex)}
                            className="text-[12px] px-2 py-1 rounded bg-neutral-100 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete project"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Education */}
            {educationLeft || educationRight ? (
              <section className="mt-5">
                <SectionTitle title="Education" />
                <div className="mt-3 flex items-start justify-between gap-4 text-[13px] leading-6">
                  <EditableField
                    value={educationLeft}
                    onChange={(value) => {
                      const [school, degree] = value.split("|").map((s) => s.trim());
                      const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                      updated.basics.school = school;
                      updated.basics.degree = degree;
                      updateResume(updated);
                    }}
                    className="font-medium"
                    placeholder="School | Degree"
                  />
                  <EditableField
                    value={educationRight}
                    onChange={(value) => {
                      const parts = value.split("|").map((s) => s.trim());
                      const graduationDate = parts[0];
                      const gpa = parts[1]?.replace("GPA: ", "") || "";
                      const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                      updated.basics.graduationDate = graduationDate;
                      updated.basics.gpa = gpa;
                      updateResume(updated);
                    }}
                    className="text-right text-neutral-800"
                    placeholder="Graduation Date | GPA"
                  />
                </div>
              </section>
            ) : null}

            {/* Additional/Extras */}
            {extras.length > 0 ? (
              <section className="mt-5">
                <SectionTitle title="Additional" />
                <ul className="mt-2 list-none space-y-1 pl-0 text-[13px] leading-6">
                  {extras.map((item: string, index: number) => (
                    <li
                      key={`${item}-${index}`}
                      className="group relative flex gap-2 text-neutral-900"
                    >
                      <span className="flex-shrink-0">•</span>
                      <span className="flex-1">
                        <EditableField
                          value={item}
                          onChange={(value) => {
                            const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                            updated.extras[index] = value;
                            updateResume(updated);
                          }}
                          placeholder="Add item"
                        />
                      </span>
                      <button
                        onClick={() => deleteExtra(index)}
                        className="absolute right-0 top-0 p-1 text-neutral-600 hover:text-red-600 opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        ×
                      </button>
                    </li>
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