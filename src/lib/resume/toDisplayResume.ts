import type { GeneratedResume } from "@/types/resume";
import { getDisplayBullet } from "@/lib/resume/getDisplayBullet";

export type DisplayResume = {
  basics: GeneratedResume["basics"];
  target: GeneratedResume["target"];
  summary: string;
  experience: Array<{
    role: string;
    organization: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    bullets: string[];
  }>;
  skills: string[];
  extras: string[];
};

export function toDisplayResume(generated: GeneratedResume): DisplayResume {
  return {
    basics: generated.basics,
    target: generated.target,
    summary: generated.summary,
    experience: generated.experience.map((item) => ({
      role: item.role,
      organization: item.organization,
      bullets: item.bullets.map(getDisplayBullet).filter(Boolean),
    })),
    projects: generated.projects.map((item) => ({
      name: item.name,
      bullets: item.bullets.map(getDisplayBullet).filter(Boolean),
    })),
    skills: generated.skills,
    extras: generated.extras,
  };
}