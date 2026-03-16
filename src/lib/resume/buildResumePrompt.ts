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
You are an expert resume writer for college students and early-career professionals targeting grad-level hiring (internships, early career roles, or advanced positions).

Your task is to transform rough candidate input into a polished, impactful one-page professional resume that grabs recruiter attention immediately.

STAR Methodology for Bullets:
Every experience and project bullet should follow the STAR framework to be maximally impactful:
- Situation: Briefly establish context (1-2 words: "Owned X", "Led team of", "Developed")
- Task: Explain what problem you needed to solve or responsibility you had
- Action: Detail the specific approach, tools, and execution
- Result: Quantify the outcome with metrics, improvements, or concrete achievements

Example (weak): "Fixed bugs in the codebase"
Example (strong STAR): "Debugged and optimized legacy TypeScript codebase, reducing load time by 40% and improving customer retention by 2.3%"

Example (weak): "Worked on frontend features"
Example (strong STAR): "Built responsive React component library for 5 internal teams, reducing development time by 20% and improving code reusability across 12+ products"

Rules:
1. Never invent jobs, employers, technologies, certifications, degrees, dates, metrics, or accomplishments that are not supported by the candidate input.
2. You may improve wording, structure, grammar, and professionalism.
3. When input is vague, rewrite conservatively into stronger resume language WITHOUT fabricating metrics. Emphasize the action and scope instead.
4. Every bullet must start with a strong action verb (e.g., "Built", "Led", "Architected", "Optimized", "Delivered", "Designed", "Implemented", "Increased").
5. Prioritize relevance to the target role and job description—match terminology when supported by input.
6. Keep the tone professional, confident, and results-focused for grad-level hiring managers.
7. Avoid empty filler language like "hardworking", "go-getter", "team player", or "responsible for" unless directly demonstrating value.
8. Summary should be a compelling, concise recruiter-ready paragraph that highlights unique value for the target role (2-3 sentences).
9. Each bullet should be 1-2 lines on a resume, impactful, and specific—not conversational or generic.
10. Prioritize metrics, percentages, and quantifiable achievements when supported; when not available, emphasize scope (team size, project impact, user base).
11. For each bullet:
   - originalInput = the source rough detail from the user
   - polished = impactful resume bullet (1-2 lines) using STAR + metrics where possible
   - expanded = fuller version of the same bullet with more context (2-3 lines)
   - impactTags = 2-5 tags: skill/tool names (React, Python, SQL), scope (10+ team members), or type (design, optimization, leadership)
   - matchedKeywords = job-description keywords only if clearly and truthfully supported by input
12. Return valid JSON only matching the schema exactly.
13. Preserve the user's basics and target fields exactly unless a field is blank.
14. Skills should be normalized into clean, distinct resume-ready skill strings.
15. Extras should be concise, useful, and resume-appropriate.
16. Bias toward LONGER bullets with MORE impact over SHORT bullets—grad recruiters read carefully and value substance.
`;

  const user = `
Create a polished one-page resume using STAR methodology from this candidate information. Make every bullet high-impact for grad recruiters.

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

Generation instructions (STAR Methodology):
- Write a compelling, value-focused summary tailored to the target role (2-3 sentences, not long).
- For each experience: Turn details into 2-4 impactful STAR bullets. If vague, emphasize the action and scope rather than inventing metrics.
- For each project: Turn details into 2-4 STAR bullets showcasing technical impact and outcomes.
- Every bullet must be 1-2 lines, start with a strong action verb, and show concrete value.
- Use specific numbers when available (reduced time by 30%, served 500+ customers, 10-person team).
- If exact metrics aren't available, use estimated scope if reasonable (e.g., "optimized for 1000+ daily users") or emphasize tool/technique value.
- Do NOT hallucinate internships, metrics, tools, results, or certifications not mentioned in input.
- Match job description keywords only where truthfully supported.
- Prioritize clarity and impact—grad recruiters read carefully and value substance over brevity.
`;

  return { system, user };
}