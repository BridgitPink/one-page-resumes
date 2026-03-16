import { useCallback, useState } from "react";
import type { GeneratedResume, ResumeBullet } from "@/types/resume";

/**
 * Hook for managing bullet suggestion API calls
 * Handles loading state and error handling for suggest and regenerate operations
 */
export function useSuggestBullet() {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const suggestBullet = useCallback(
    async (
      sectionKey: string,
      type: "experience" | "project",
      context: any
    ): Promise<ResumeBullet | null> => {
      setLoading((prev) => ({ ...prev, [sectionKey]: true }));

      try {
        const body =
          type === "experience"
            ? {
                type: "experience",
                role: context.role,
                organization: context.organization,
                existingBullets: context.bullets,
                targetRole: context.targetRole || "",
                jobDescription: context.jobDescription || "",
                skills: context.skills || [],
              }
            : {
                type: "project",
                name: context.name,
                existingBullets: context.bullets,
                targetRole: context.targetRole || "",
                jobDescription: context.jobDescription || "",
                skills: context.skills || [],
              };

        const response = await fetch("/api/suggest-bullet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error("Failed to generate suggestion:", response.statusText);
          setError("Failed to generate suggestion");
          return null;
        }

        const data = await response.json();
        return data.bullet;
      } catch (err) {
        console.error("Error generating suggestion:", err);
        setError("Error generating suggestion");
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, [sectionKey]: false }));
      }
    },
    []
  );

  const regenerateBullet = useCallback(
    async (
      bulletKey: string,
      type: "experience" | "project",
      context: any,
      bulletIndex: number,
      userText: string
    ): Promise<ResumeBullet | null> => {
      setLoading((prev) => ({ ...prev, [bulletKey]: true }));

      try {
        const body =
          type === "experience"
            ? {
                type: "experience" as const,
                role: context.role || "",
                organization: context.organization || "",
                existingBullets: context.bullets.filter(
                  (_: any, idx: number) => idx !== bulletIndex
                ),
                targetRole: context.targetRole || "",
                jobDescription: context.jobDescription || "",
                skills: context.skills || [],
                currentBulletText: userText,
              }
            : {
                type: "project" as const,
                name: context.name || "",
                existingBullets: context.bullets.filter(
                  (_: any, idx: number) => idx !== bulletIndex
                ),
                targetRole: context.targetRole || "",
                jobDescription: context.jobDescription || "",
                skills: context.skills || [],
                currentBulletText: userText,
              };

        const response = await fetch("/api/suggest-bullet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error("Failed to regenerate bullet:", response.statusText);
          setError("Failed to regenerate bullet");
          return null;
        }

        const data = await response.json();
        return data.bullet;
      } catch (err) {
        console.error("Error regenerating bullet:", err);
        setError("Error regenerating bullet");
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, [bulletKey]: false }));
      }
    },
    []
  );

  return { loading, error, suggestBullet, regenerateBullet };
}
