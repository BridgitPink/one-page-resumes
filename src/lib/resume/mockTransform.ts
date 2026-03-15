import { GeneratedResume, ResumeFormData } from "@/types/resume";

function splitBrainDump(text: string): string[] {
  return text
    .split(/[\n.•]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function toBullet(sentence: string): string {
  const cleaned = sentence.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";

  const capitalized =
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return capitalized.endsWith(".") ? capitalized : `${capitalized}.`;
}

function fallbackExperienceBullet(
  role: string,
  organization: string,
  details: string
): string[] {
  const base = details.trim();

  if (!base) {
    return [
      `Supported responsibilities as ${role || "a team member"}${organization ? ` at ${organization}` : ""}.`,
    ];
  }

  return [
    `Contributed in the role of ${role || "team member"}${organization ? ` at ${organization}` : ""} by ${base.charAt(0).toLowerCase() + base.slice(1)}.`,
  ];
}

function summarizeCandidate(data: ResumeFormData): string {
  const targetRole = data.target.role || "early-career professional";
  const school = data.basics.school || "their academic program";

  const hasProjects = data.projects.some((p) => p.name || p.details);
  const hasExperience = data.experiences.some(
    (e) => e.role || e.organization || e.details
  );

  if (hasExperience && hasProjects) {
    return `Motivated ${targetRole} candidate with hands-on experience, academic project work, and a growing technical foundation developed through ${school}.`;
  }

  if (hasProjects) {
    return `Motivated ${targetRole} candidate with academic and personal project experience, building practical skills through ${school}.`;
  }

  return `Motivated ${targetRole} candidate building technical and professional experience through ${school}, with a focus on continuous growth and industry readiness.`;
}

function parseSkills(skills: string): string[] {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function parseExtras(extras: string): string[] {
  return extras
    .split(/[\n,•]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function generateMockResume(data: ResumeFormData): GeneratedResume {
  const experience = data.experiences
    .filter((exp) => exp.role || exp.organization || exp.details)
    .map((exp) => {
      const parts = splitBrainDump(exp.details);
      const bullets =
        parts.length > 0
          ? parts.slice(0, 3).map(toBullet).filter(Boolean)
          : fallbackExperienceBullet(exp.role, exp.organization, exp.details);

      return {
        role: exp.role || "Role",
        organization: exp.organization || "Organization",
        bullets,
      };
    });

  const projects = data.projects
    .filter((project) => project.name || project.details)
    .map((project) => {
      const parts = splitBrainDump(project.details);
      const bullets =
        parts.length > 0
          ? parts.slice(0, 3).map(toBullet).filter(Boolean)
          : [
              `Built ${project.name || "a project"} using relevant technical tools and problem-solving skills.`,
            ];

      return {
        name: project.name || "Project",
        bullets,
      };
    });

  return {
    basics: data.basics,
    target: data.target,
    summary: summarizeCandidate(data),
    experience,
    projects,
    skills: parseSkills(data.skills),
    extras: parseExtras(data.extras),
  };
}