import { useCallback } from "react";
import type { GeneratedResume } from "@/types/resume";

/**
 * Consolidated hook for resume state mutations
 * Provides all common resume editing operations
 */
export function useResumeState(
  resume: GeneratedResume | null,
  updateResume: (resume: GeneratedResume) => void
) {
  const addExperience = useCallback(() => {
    if (!resume) return;
    const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
    updatedResume.experience.push({
      role: "",
      organization: "",
      bullets: [],
    });
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

  const addProject = useCallback(() => {
    if (!resume) return;
    const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;
    updatedResume.projects.push({
      name: "",
      bullets: [],
    });
    updateResume(updatedResume);
  }, [resume, updateResume]);

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

  const addBullet = useCallback(
    (type: "experience" | "project", index: number) => {
      if (!resume) return;
      const updatedResume = JSON.parse(JSON.stringify(resume)) as GeneratedResume;

      if (type === "experience") {
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
        }
      } else if (type === "project" && updatedResume.projects?.[index]) {
        updatedResume.projects[index].bullets.push({
          polished: "",
          expanded: "",
          originalInput: "",
          impactTags: [],
          matchedKeywords: [],
        });
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

  return {
    addExperience,
    deleteExperience,
    addProject,
    deleteProject,
    deleteAllProjects,
    addBullet,
    deleteBullet,
    updateBullet,
  };
}
