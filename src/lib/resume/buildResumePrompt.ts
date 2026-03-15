import type { ResumeFormData } from "@/types/resume";

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLines(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildResumePrompt(formData: ResumeFormData) {
  const experiences = formData.experiences.map((exp, index) => ({
    index: index + 1,
    role: safeString(exp.role),
    organization: safeString(exp.organization),
    details: safeString(exp.details),
  }));

  const projects = formData.projects.map((project, index) => ({
    index: index + 1,
    name: safeString(project.name),
    details: safeString(project.details),
  }));

  const parsedSkills = normalizeLines(formData.skills);
  const parsedExtras = normalizeLines(formData.extras);

  const system = `
You are an expert resume writer for college students and early-career professionals.

Your task is to transform rough candidate input into a polished, truthful, one-page professional resume.

Rules:
1. Never invent jobs, employers, technologies, certifications, degrees, dates, metrics, or accomplishments that are not supported by the candidate input.
2. You may improve wording, structure, grammar, and professionalism.
3. When input is vague, rewrite conservatively into stronger resume language without fabricating measurable outcomes.
4. Write bullets with strong action verbs and concrete task descriptions.
5. Prioritize relevance to the target role and job description.
6. Keep the tone recruiter-friendly, concise, and realistic for a student or early-career applicant.
7. Avoid empty filler language like "hardworking", "go-getter", or "team player" unless directly supported.
8. Summary should be a concise recruiter-ready paragraph.
9. Each experience/project bullet must be resume-ready, not conversational.
10. For each bullet:
   - originalInput = the source rough detail from the user
   - polished = concise resume bullet
   - expanded = slightly more developed version of the same bullet
   - impactTags = 2-5 short tags describing tools, scope, or strengths
   - matchedKeywords = job-description-aligned terms only if clearly supported
11. Return valid JSON only matching the schema exactly.
12. Preserve the user's basics and target fields exactly unless a field is blank.
13. Skills should be normalized into clean, distinct resume-ready skill strings.
14. Extras should be concise, useful, and resume-appropriate.
`;

  const user = `
Create a polished one-page resume from this candidate information.

BASICS
- Full name: ${safeString(formData.basics.fullName)}
- Email: ${safeString(formData.basics.email)}
- Phone: ${safeString(formData.basics.phone)}
- Location: ${safeString(formData.basics.location)}
- LinkedIn: ${safeString(formData.basics.linkedin)}
- GitHub: ${safeString(formData.basics.github)}
- School: ${safeString(formData.basics.school)}
- Degree: ${safeString(formData.basics.degree)}
- Graduation date: ${safeString(formData.basics.graduationDate)}
- GPA: ${safeString(formData.basics.gpa)}

TARGET
- Role: ${safeString(formData.target.role)}
- Industry: ${safeString(formData.target.industry)}
- Job description: ${safeString(formData.target.jobDescription)}

EXPERIENCES
${JSON.stringify(experiences, null, 2)}

PROJECTS
${JSON.stringify(projects, null, 2)}

SKILLS
${JSON.stringify(parsedSkills, null, 2)}

EXTRAS
${JSON.stringify(parsedExtras, null, 2)}

Generation instructions:
- Write a strong summary tailored to the target role.
- Turn each experience details field into 2-4 polished bullets when enough information exists.
- Turn each project details field into 2-4 polished bullets when enough information exists.
- If an entry is thin, still make it professional, but stay truthful.
- Use technical words from the job description only if supported by the candidate input.
- Do not hallucinate internships, leadership, tools, results, or certifications.
`;

  return { system, user };
}