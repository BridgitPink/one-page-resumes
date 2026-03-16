"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  loadGeneratedResume,
  saveGeneratedResume,
  estimatePageFit,
} from "@/lib/resume/storage";
import {
  getBulletText,
  getExperience,
  getProjects,
  shouldShowSummary,
  getSkills,
} from "@/lib/resume/editorHelpers";
import { SectionTitle } from "@/components/resume/SectionTitle";
import { EditableField } from "@/components/resume/EditableField";
import { BulletListItem } from "@/components/resume/BulletListItem";
import { useResumeState } from "@/lib/hooks/useResumeState";
import { useSuggestBullet } from "@/lib/hooks/useSuggestBullet";
import type { GeneratedResume, ResumeBullet } from "@/types/resume";



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
  const [regeneratingBullets, setRegeneratingBullets] = useState<{
    [key: string]: boolean;
  }>({});
  const [newSkillInput, setNewSkillInput] = useState("");
  const [autoEditBullet, setAutoEditBullet] = useState<{
    type: "experience" | "project";
    entryIndex: number;
    bulletIndex: number;
  } | null>(null);

  useEffect(() => {
    const stored = loadGeneratedResume<any>();
    let resume = null;

    if (stored?.generated) {
      resume = stored.generated;
    } else {
      resume = stored;
    }

    // Normalize experience key: ensure "experience" (singular) not "experiences" (plural)
    // This prevents key mismatch errors in handlers that always write to "experience"
    if (resume && Array.isArray(resume.experiences) && !Array.isArray(resume.experience)) {
      resume.experience = resume.experiences;
      delete resume.experiences;
    }

    setResume(resume);
    setLoading(false);
  }, []);

  const updateResume = useCallback((updatedResume: GeneratedResume) => {
    setResume(updatedResume);
    saveGeneratedResume({ generated: updatedResume });
  }, []);

  const addSkill = useCallback(() => {
    if (!resume || !newSkillInput.trim()) return;
    const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
    updatedResume.skills.push(newSkillInput.trim());
    updateResume(updatedResume);
    setNewSkillInput("");
  }, [resume, newSkillInput, updateResume]);

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

  const regenerateBullet = useCallback(
    async (
      type: "experience" | "project",
      entryIndex: number,
      bulletIndex: number,
      userText: string
    ) => {
      if (!resume) return;

      const bulletKey = `${type}-${entryIndex}-${bulletIndex}-regen`;
      setRegeneratingBullets((prev) => ({ ...prev, [bulletKey]: true }));

      try {
        const context =
          type === "experience"
            ? resume.experience[entryIndex]
            : resume.projects[entryIndex];

        if (!context) return;

        const body =
          type === "experience"
            ? {
                type: "experience" as const,
                role: "role" in context ? context.role : "",
                organization: "organization" in context ? context.organization : "",
                existingBullets: context.bullets.filter(
                  (_, idx) => idx !== bulletIndex
                ),
                targetRole: resume?.target.role || "",
                jobDescription: resume?.target.jobDescription || "",
                skills: resume?.skills || [],
                currentBulletText: userText,
              }
            : {
                type: "project" as const,
                name: "name" in context ? context.name : "",
                existingBullets: context.bullets.filter(
                  (_, idx) => idx !== bulletIndex
                ),
                targetRole: resume?.target.role || "",
                jobDescription: resume?.target.jobDescription || "",
                skills: resume?.skills || [],
                currentBulletText: userText,
              };

        const response = await fetch("/api/suggest-bullet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error("Failed to regenerate bullet:", response.statusText);
          return;
        }

        const data = await response.json();
        // Auto-apply: directly update the bullet instead of storing as suggestion
        const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
        const newBullet = { ...data.bullet, originalInput: userText };

        if (type === "experience" && updatedResume.experience?.[entryIndex]) {
          updatedResume.experience[entryIndex].bullets[bulletIndex] = newBullet;
        } else if (type === "project" && updatedResume.projects?.[entryIndex]) {
          updatedResume.projects[entryIndex].bullets[bulletIndex] = newBullet;
        }

        updateResume(updatedResume);
      } catch (error) {
        console.error("Error regenerating bullet:", error);
      } finally {
        setRegeneratingBullets((prev) => ({ ...prev, [bulletKey]: false }));
      }
    },
    [resume, updateResume]
  );

  const acceptSuggestion = useCallback(
    (sectionKey: string, type: "experience" | "project", index: number) => {
      const suggestion = suggestions[sectionKey];
      if (!suggestion || !resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
      
      // Ensure bullet has at least one text field populated
      const bulletText = suggestion.polished || suggestion.expanded || suggestion.originalInput || "";
      
      // Create a properly structured bullet from the suggestion
      const bulletToAdd = {
        polished: suggestion.polished || bulletText,
        expanded: suggestion.expanded || bulletText,
        originalInput: suggestion.originalInput || bulletText,
        impactTags: suggestion.impactTags || [],
        matchedKeywords: suggestion.matchedKeywords || [],
      };

      if (type === "experience") {
        // Initialize experience array if it doesn't exist
        if (!updatedResume.experience) {
          updatedResume.experience = [];
        }
        if (updatedResume.experience[index]) {
          updatedResume.experience[index].bullets.push(bulletToAdd);
        }
      } else if (type === "project" && updatedResume.projects && updatedResume.projects[index]) {
        updatedResume.projects[index].bullets.push(bulletToAdd);
      }

      // Update resume first to persist the new bullet
      updateResume(updatedResume);
      
      // Then clear the suggestion from temporary state
      setSuggestions((prev) => {
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });
    },
    [suggestions, resume, updateResume]
  );

  const replaceBulletWithSuggestion = useCallback(
    (sectionKey: string, type: "experience" | "project", entryIndex: number, bulletIndex: number) => {
      const suggestion = suggestions[sectionKey];
      if (!suggestion || !resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;

      if (type === "experience" && updatedResume.experience?.[entryIndex]) {
        updatedResume.experience[entryIndex].bullets[bulletIndex] = suggestion;
      } else if (type === "project" && updatedResume.projects?.[entryIndex]) {
        updatedResume.projects[entryIndex].bullets[bulletIndex] = suggestion;
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

  const deleteAllProjects = useCallback(() => {
    if (!resume) return;
    const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
    updatedResume.projects = [];
    updateResume(updatedResume);
  }, [resume, updateResume]);

  const updateBullet = useCallback(
    (
      type: "experience" | "project",
      entryIndex: number,
      bulletIndex: number,
      newText: string
    ) => {
      if (!resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;

      if (type === "experience") {
        // Initialize experience array if it doesn't exist
        if (!updatedResume.experience) {
          updatedResume.experience = [];
        }
        if (updatedResume.experience?.[entryIndex]) {
          updatedResume.experience[entryIndex].bullets[bulletIndex] = {
            ...updatedResume.experience[entryIndex].bullets[bulletIndex],
            polished: newText,
          };
        }
      } else if (type === "project" && updatedResume.projects?.[entryIndex]) {
        updatedResume.projects[entryIndex].bullets[bulletIndex] = {
          ...updatedResume.projects[entryIndex].bullets[bulletIndex],
          polished: newText,
        };
      }

      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  const deleteBullet = useCallback(
    (type: "experience" | "project", entryIndex: number, bulletIndex: number) => {
      if (!resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;

      if (type === "experience") {
        // Initialize experience array if it doesn't exist
        if (!updatedResume.experience) {
          updatedResume.experience = [];
        }
        if (updatedResume.experience?.[entryIndex]) {
          updatedResume.experience[entryIndex].bullets.splice(bulletIndex, 1);
        }
      } else if (type === "project" && updatedResume.projects?.[entryIndex]) {
        updatedResume.projects[entryIndex].bullets.splice(bulletIndex, 1);
      }

      updateResume(updatedResume);
    },
    [resume, updateResume]
  );

  const addBullet = useCallback(
    (type: "experience" | "project", index: number) => {
      if (!resume) return;

      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
      let bulletIndex = -1;

      if (type === "experience") {
        // Initialize experience array if it doesn't exist
        if (!updatedResume.experience) {
          updatedResume.experience = [];
        }
        if (updatedResume.experience[index]) {
          updatedResume.experience[index].bullets.push({
            polished: "",
            expanded: "",
            originalInput: "",
            impactTags: [],
            matchedKeywords: [],
          });
          bulletIndex = updatedResume.experience[index].bullets.length - 1;
        }
      } else if (type === "project" && updatedResume.projects?.[index]) {
        updatedResume.projects[index].bullets.push({
          polished: "",
          expanded: "",
          originalInput: "",
          impactTags: [],
          matchedKeywords: [],
        });
        bulletIndex = updatedResume.projects[index].bullets.length - 1;
      }

      // Update resume state and localStorage first
      updateResume(updatedResume);
      
      // Then mark the newly added bullet for auto-editing
      // React batches these updates together in the event handler
      if (bulletIndex !== -1) {
        setAutoEditBullet({ type, entryIndex: index, bulletIndex });
      }
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
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">Generating Resume</h1>
            <p className="text-sm text-slate-400">Using AI to craft your professional narrative...</p>
          </div>

          <div className="bg-slate-900 rounded-lg shadow-sm p-8 space-y-6 border border-slate-700">
            <div className="flex justify-center items-center gap-2 h-12">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>

            <div className="space-y-2">
              <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ animation: "pulse-width 2s ease-in-out infinite" }} />
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
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold text-white">
            No generated resume found
          </h1>
          <button
            onClick={() => router.push("/builder")}
            className="mt-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white transition-colors"
          >
            Back to Builder
          </button>
        </div>
      </main>
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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Centered Warning Banner */}
      <div className="bg-amber-950/40 border-b border-amber-700/50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex justify-center">
          <div className="text-sm text-amber-200 text-center">
            <span className="font-medium">⚠️ Review and validate</span> — Verify accuracy before submitting your resume.
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl flex gap-8 px-6 py-8">
        {/* Left Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            {/* Resume Title */}
            <div>
              <h2 className="text-sm font-semibold text-white">Resume</h2>
              <p className="mt-1 text-xs text-slate-400">Edit your resume content with AI assistance</p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => router.push("/builder")}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                ← Back to Builder
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>
          </div>
        </aside>

        {/* Main Resume Content */}
        <article className="flex-1 max-w-[850px] bg-white text-black border border-slate-300 rounded-lg shadow-lg p-10">
          {/* Header (No "Generated Resume" title) */}
          <header className="border-b border-black pb-4 text-center">
            <EditableField
              value={basics.fullName || "Your Name"}
              onChange={(value) => {
                const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                updated.basics.fullName = value;
                updateResume(updated);
              }}
              className="text-black text-[30px] font-bold uppercase tracking-[0.08em]"
            />

            {target.role ? (
              <EditableField
                value={target.role}
                onChange={(value) => {
                  const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                  updated.target.role = value;
                  updateResume(updated);
                }}
                className="text-black mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-700"
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
                className="text-black mt-2 text-[13px] leading-6"
                multiline
                placeholder="Add your professional summary..."
              />
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section className="mt-5">
              <SectionTitle title="Skills" />
              <div className="mt-2 text-[13px] leading-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="group relative inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-50"
                    >
                      <span className="text-black">{skill}</span>
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
                {/* Add Skill Input */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addSkill();
                      }
                    }}
                    placeholder="Add a skill..."
                    className="flex-1 text-[13px] px-2 py-1 rounded border border-neutral-300 bg-white focus:outline-none focus:border-neutral-600"
                  />
                  <button
                    onClick={addSkill}
                    disabled={!newSkillInput.trim()}
                    className="text-[12px] px-3 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
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
                    <div key={sectionKey}>
                      {/* Left: Role + Organization, Right: Date */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <EditableField
                            value={item.role || ""}
                            onChange={(value) => {
                              const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                              if (updated.experience?.[expIndex]) {
                                updated.experience[expIndex].role = value;
                                updateResume(updated);
                              }
                            }}
                            className="text-black text-[14px] font-bold"
                            placeholder="Job title"
                          />
                          <EditableField
                            value={item.organization || ""}
                            onChange={(value) => {
                              const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                              if (updated.experience?.[expIndex]) {
                                updated.experience[expIndex].organization = value;
                                updateResume(updated);
                              }
                            }}
                            className="text-black text-[13px] italic text-neutral-800"
                            placeholder="Company name"
                          />
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <EditableField
                            value={item.date || ""}
                            onChange={(value) => {
                              const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                              if (updated.experience?.[expIndex]) {
                                updated.experience[expIndex].date = value;
                                updateResume(updated);
                              }
                            }}
                            className="text-black text-[13px] text-neutral-700"
                            placeholder="Date"
                          />
                        </div>
                      </div>

                      {item.bullets?.length ? (
                        <ul className="mt-2 list-none space-y-1 pl-0 text-[13px] leading-6">
                          {item.bullets.map((bullet: any, bulletIndex: number) => {
                            const regenKey = `regen-experience-${expIndex}-${bulletIndex}`;
                            const bulletKey = `experience-${expIndex}-bullet-${bulletIndex}-regen`;
                            const shouldAutoEdit = 
                              autoEditBullet?.type === "experience" &&
                              autoEditBullet?.entryIndex === expIndex &&
                              autoEditBullet?.bulletIndex === bulletIndex;

                            return (
                              <div key={`exp-${expIndex}-bullet-${bulletIndex}`}>
                                <BulletListItem
                                  bullet={bullet}
                                  shouldAutoEdit={shouldAutoEdit}
                                  onEdit={(newText) => {
                                    updateBullet("experience", expIndex, bulletIndex, newText);
                                    // Clear autoEditBullet after saving
                                    setAutoEditBullet(null);
                                  }}
                                  onDelete={() =>
                                    deleteBullet("experience", expIndex, bulletIndex)
                                  }
                                  onRegenerate={() => {
                                    regenerateBullet(
                                      "experience",
                                      expIndex,
                                      bulletIndex,
                                      getBulletText(bullet)
                                    );
                                  }}
                                  isRegenerating={regeneratingBullets[bulletKey] || false}
                                />
                              </div>
                            );
                          })}
                          {suggestion && (
                            <div key={`suggestion-${sectionKey}`}>
                              <BulletListItem
                                bullet={suggestion}
                                isSuggestion
                                onAcceptSuggestion={() =>
                                  acceptSuggestion(sectionKey, "experience", expIndex)
                                }
                                onDismissSuggestion={() => dismissSuggestion(sectionKey)}
                                onEdit={() => {}}
                                onDelete={() => {}}
                              />
                            </div>
                          )}
                        </ul>
                      ) : null}

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            generateSuggestion(sectionKey, "experience", item)
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
                          onClick={() => addBullet("experience", expIndex)}
                          className="text-[12px] px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        >
                          + Add bullet
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
              <SectionTitle title="Projects" onDelete={deleteAllProjects} />
              <div className="mt-3 space-y-5">
                {projects.map((project: any, projIndex: number) => {
                  const sectionKey = `proj-${projIndex}`;
                  const suggestion = suggestions[sectionKey];

                  return (
                    <div key={sectionKey}>
                      <EditableField
                        value={project.name || ""}
                        onChange={(value) => {
                          const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                          if (updated.projects?.[projIndex]) {
                            updated.projects[projIndex].name = value;
                            updateResume(updated);
                          }
                        }}
                        className="text-black text-[14px] font-bold"
                        placeholder="Project name"
                      />
                      {project.link && (
                        <EditableField
                          value={project.link || ""}
                          onChange={(value) => {
                            const updated = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
                            if (updated.projects?.[projIndex]) {
                              updated.projects[projIndex].link = value;
                              updateResume(updated);
                            }
                          }}
                          className="text-black text-[13px] text-neutral-700"
                          placeholder="Project URL"
                        />
                      )}

                      {project.bullets?.length ? (
                        <ul className="mt-2 list-none space-y-1 pl-0 text-[13px] leading-6">
                          {project.bullets.map((bullet: any, bulletIndex: number) => {
                            const regenKey = `regen-project-${projIndex}-${bulletIndex}`;
                            const bulletKey = `project-${projIndex}-bullet-${bulletIndex}-regen`;
                            const shouldAutoEdit = 
                              autoEditBullet?.type === "project" &&
                              autoEditBullet?.entryIndex === projIndex &&
                              autoEditBullet?.bulletIndex === bulletIndex;

                            return (
                              <div key={`proj-${projIndex}-bullet-${bulletIndex}`}>
                                <BulletListItem
                                  bullet={bullet}
                                  shouldAutoEdit={shouldAutoEdit}
                                  onEdit={(newText) => {
                                    updateBullet("project", projIndex, bulletIndex, newText);
                                    // Clear autoEditBullet after saving
                                    setAutoEditBullet(null);
                                  }}
                                  onDelete={() =>
                                    deleteBullet("project", projIndex, bulletIndex)
                                  }
                                  onRegenerate={() => {
                                    regenerateBullet(
                                      "project",
                                      projIndex,
                                      bulletIndex,
                                      getBulletText(bullet)
                                    );
                                  }}
                                  isRegenerating={regeneratingBullets[bulletKey] || false}
                                />
                              </div>
                            );
                          })}
                          {suggestion && (
                            <div key={`suggestion-${sectionKey}`}>
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
                            </div>
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
                          onClick={() => addBullet("project", projIndex)}
                          className="text-[12px] px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        >
                          + Add bullet
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
                  className="text-black font-medium"
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
                  className="text-black text-right text-neutral-800"
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
                        className="text-black"
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
        </article>

        {/* Right Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Continue Button */}
            <div className="border-t border-slate-700 pt-6">
              <button
                onClick={() => router.push("/templates")}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-colors"
              >
                Continue to Templates
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
