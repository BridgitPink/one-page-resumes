import type {
  GeneratedResume,
  KeywordAnalysis,
  ResumeBullet,
  ResumeRecommendations,
  ResumeScore,
} from "@/types/resume";

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function getBulletText(bullet: string | ResumeBullet): string {
  if (typeof bullet === "string") return bullet;

  return [
    bullet.polished,
    bullet.expanded,
    ...(bullet.impactTags ?? []),
    ...(bullet.matchedKeywords ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function buildRecommendationCorpus(
  resume: GeneratedResume,
  keywordAnalysis: KeywordAnalysis
): string {
  const experienceText = resume.experience.flatMap((item) => [
    item.role,
    item.organization,
    ...item.bullets.map(getBulletText),
  ]);

  const projectText = resume.projects.flatMap((item) => [
    item.name,
    ...item.bullets.map(getBulletText),
  ]);

  return [
    resume.target.role,
    resume.target.industry,
    resume.target.jobDescription,
    resume.summary,
    ...experienceText,
    ...projectText,
    ...resume.skills,
    ...resume.extras,
    ...keywordAnalysis.extractedKeywords,
    ...keywordAnalysis.matchedKeywords,
    ...keywordAnalysis.missingKeywords,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function generateRecommendations(
  resume: GeneratedResume,
  keywordAnalysis: KeywordAnalysis,
  score: ResumeScore
): ResumeRecommendations {
  const combinedText = buildRecommendationCorpus(resume, keywordAnalysis);

  const recommendedProjects: string[] = [];
  const recommendedCertifications: string[] = [];
  const recommendedCourseworkFraming: string[] = [];
  const recommendedSectionAdditions: string[] = [];

  const hasProjects = resume.projects.length > 0;
  const hasExtras = resume.extras.length > 0;

  if (
    includesAny(combinedText, [
      "software",
      "developer",
      "engineering",
      "web",
      "frontend",
      "backend",
      "full stack",
      "react",
      "javascript",
      "typescript",
      "api",
      "next.js",
      "node",
    ])
  ) {
    recommendedProjects.push(
      "Build a full-stack web app with authentication, CRUD features, and deployment to showcase practical software engineering ability."
    );
    recommendedProjects.push(
      "Create an API-based project that consumes external data and presents it through a clean dashboard or interface."
    );
    recommendedCertifications.push(
      "Responsive Web Design or a modern front-end certification to strengthen web development credibility."
    );
    recommendedCourseworkFraming.push(
      "Frame coursework like Data Structures, Software Engineering, Databases, and Web Development as relevant technical preparation."
    );
  }

  if (
    includesAny(combinedText, [
      "data",
      "analytics",
      "machine learning",
      "deep learning",
      "ai",
      "python",
      "sql",
      "visualization",
      "analysis",
      "statistics",
      "dashboard",
    ])
  ) {
    recommendedProjects.push(
      "Create a data analysis or machine learning project with a real dataset, clear visuals, and measurable insights."
    );
    recommendedProjects.push(
      "Build a dashboard or notebook project that communicates trends, predictions, or decision-support insights."
    );
    recommendedCertifications.push(
      "Google Data Analytics, Microsoft data-related certification, or an introductory machine learning credential."
    );
    recommendedCourseworkFraming.push(
      "Highlight coursework such as Statistics, Data Structures, Machine Learning, Databases, Linear Algebra, or Data Visualization."
    );
  }

  if (
    includesAny(combinedText, [
      "cyber",
      "security",
      "network",
      "linux",
      "systems",
      "infrastructure",
      "cloud",
      "aws",
      "azure",
      "monitoring",
      "devops",
    ])
  ) {
    recommendedProjects.push(
      "Build a systems or security project such as a log analysis tool, vulnerability scanner, or cloud monitoring dashboard."
    );
    recommendedCertifications.push(
      "CompTIA Security+, AWS Cloud Practitioner, or Microsoft Azure Fundamentals."
    );
    recommendedCourseworkFraming.push(
      "Frame coursework in Computer Networks, Operating Systems, Cybersecurity, Cloud Computing, or Systems Administration."
    );
  }

  if (
    includesAny(combinedText, [
      "technical",
      "support",
      "help desk",
      "it",
      "troubleshoot",
      "documentation",
      "ticketing",
    ])
  ) {
    recommendedProjects.push(
      "Create an IT support knowledge-base, troubleshooting workflow app, or ticket-tracking simulation project."
    );
    recommendedCertifications.push(
      "Google IT Support, CompTIA A+, or Microsoft fundamentals certification."
    );
    recommendedCourseworkFraming.push(
      "Highlight coursework or labs related to networking, hardware, systems support, and technical communication."
    );
  }

  if (!hasProjects) {
    recommendedSectionAdditions.push(
      "Add a Projects section. For early-career candidates, projects are often one of the fastest ways to strengthen a one-page resume."
    );
  }

  if (!hasExtras) {
    recommendedSectionAdditions.push(
      "Add leadership, clubs, volunteer work, certifications, or relevant coursework to strengthen the lower half of the page."
    );
  }

  if (resume.skills.length < 5) {
    recommendedSectionAdditions.push(
      "Expand the Skills section with languages, frameworks, tools, platforms, and role-relevant professional skills."
    );
  }

  if (resume.experience.length === 0) {
    recommendedSectionAdditions.push(
      "Add campus work, freelance tasks, volunteer roles, tutoring, lab work, or leadership roles if formal experience is limited."
    );
  }

  if (keywordAnalysis.missingKeywords.length >= 4) {
    recommendedSectionAdditions.push(
      "Consider building projects or earning certifications that naturally support the missing keywords in the job description."
    );
  }

  if (score.overallScore < 70) {
    recommendedSectionAdditions.push(
      "Your current resume likely needs stronger proof of impact. Add results, technical depth, and more targeted content."
    );
  }

  if (recommendedProjects.length === 0) {
    recommendedProjects.push(
      "Build one role-relevant portfolio project that solves a real problem and clearly demonstrates tools, process, and outcome."
    );
  }

  if (recommendedCertifications.length === 0) {
    recommendedCertifications.push(
      "Consider one beginner-friendly certification aligned with your target role to help strengthen credibility."
    );
  }

  if (recommendedCourseworkFraming.length === 0) {
    recommendedCourseworkFraming.push(
      "Include a Relevant Coursework line if you are still a student and need stronger role alignment."
    );
  }

  return {
    recommendedProjects: Array.from(new Set(recommendedProjects)).slice(0, 4),
    recommendedCertifications: Array.from(
      new Set(recommendedCertifications)
    ).slice(0, 4),
    recommendedCourseworkFraming: Array.from(
      new Set(recommendedCourseworkFraming)
    ).slice(0, 4),
    recommendedSectionAdditions: Array.from(
      new Set(recommendedSectionAdditions)
    ).slice(0, 5),
  };
}