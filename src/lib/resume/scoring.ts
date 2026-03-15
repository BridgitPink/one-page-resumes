import type {
  GeneratedResume,
  KeywordAnalysis,
  ResumeBullet,
  ResumeScore,
} from "@/types/resume";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hasNumbers(text: string): boolean {
  return /\d/.test(text);
}

function getBulletText(bullet: string | ResumeBullet): string {
  if (typeof bullet === "string") return bullet;

  return [bullet.polished, bullet.expanded, ...(bullet.impactTags ?? [])]
    .filter(Boolean)
    .join(" ");
}

function getAllBulletText(resume: GeneratedResume): string[] {
  return [
    ...resume.experience.flatMap((item) => item.bullets.map(getBulletText)),
    ...resume.projects.flatMap((item) => item.bullets.map(getBulletText)),
  ];
}

function countStrongBullets(resume: GeneratedResume): number {
  const bullets = getAllBulletText(resume);

  return bullets.filter((bullet) => {
    const lower = bullet.toLowerCase();

    return (
      lower.includes("built") ||
      lower.includes("developed") ||
      lower.includes("designed") ||
      lower.includes("implemented") ||
      lower.includes("improved") ||
      lower.includes("supported") ||
      lower.includes("analyzed") ||
      lower.includes("created") ||
      lower.includes("optimized") ||
      hasNumbers(lower)
    );
  }).length;
}

export function scoreResume(
  resume: GeneratedResume,
  keywordAnalysis: KeywordAnalysis
): ResumeScore {
  const strengths: string[] = [];
  const improvementSuggestions: string[] = [];

  const allBulletText = getAllBulletText(resume);

  const hasSummary = Boolean(resume.summary.trim());
  const hasEducation =
    Boolean(resume.basics.school.trim()) || Boolean(resume.basics.degree.trim());
  const hasExperience = resume.experience.length > 0;
  const hasProjects = resume.projects.length > 0;
  const hasSkills = resume.skills.length > 0;
  const hasExtras = resume.extras.length > 0;
  const hasTargetRole = Boolean(resume.target.role.trim());
  const hasContactInfo =
    Boolean(resume.basics.email.trim()) || Boolean(resume.basics.phone.trim());

  let completenessScore = 0;
  if (hasSummary) completenessScore += 12;
  if (hasEducation) completenessScore += 18;
  if (hasExperience) completenessScore += 22;
  if (hasProjects) completenessScore += 18;
  if (hasSkills) completenessScore += 15;
  if (hasExtras) completenessScore += 5;
  if (hasTargetRole) completenessScore += 5;
  if (hasContactInfo) completenessScore += 5;
  completenessScore = clamp(completenessScore, 0, 100);

  const strongBulletCount = countStrongBullets(resume);
  const quantifiedBulletCount = allBulletText.filter((bullet) =>
    hasNumbers(bullet)
  ).length;

  let contentStrengthScore = 0;
  contentStrengthScore += Math.min(strongBulletCount * 12, 48);
  contentStrengthScore += Math.min(quantifiedBulletCount * 10, 20);
  contentStrengthScore += hasExperience ? 12 : 0;
  contentStrengthScore += hasProjects ? 10 : 0;
  contentStrengthScore += resume.summary.length > 80 ? 10 : 4;
  contentStrengthScore = clamp(contentStrengthScore, 0, 100);

  let formattingReadinessScore = 0;
  formattingReadinessScore += hasContactInfo ? 20 : 5;
  formattingReadinessScore += hasEducation ? 20 : 0;
  formattingReadinessScore += hasSkills ? 20 : 0;
  formattingReadinessScore += hasExperience ? 20 : 0;
  formattingReadinessScore += hasProjects ? 10 : 0;
  formattingReadinessScore += hasSummary ? 10 : 0;
  formattingReadinessScore = clamp(formattingReadinessScore, 0, 100);

  const keywordAlignmentScore = keywordAnalysis.matchScore;

  const weightedScore =
    keywordAlignmentScore * 0.35 +
    contentStrengthScore * 0.30 +
    completenessScore * 0.20 +
    formattingReadinessScore * 0.15;

  let overallScore = Math.round(weightedScore);
  overallScore = Math.min(overallScore, 89);

  if (keywordAnalysis.matchScore >= 65) {
    strengths.push("Resume shows solid alignment with job-description keywords.");
  } else {
    improvementSuggestions.push(
      "Add more role-specific language from the job description into experience, projects, and skills."
    );
  }

  if (hasExperience) {
    strengths.push("Resume includes experience content, which improves credibility.");
  } else {
    improvementSuggestions.push(
      "Add at least one experience entry, even if it is campus work, volunteer work, or a leadership role."
    );
  }

  if (hasProjects) {
    strengths.push("Projects section helps strengthen early-career positioning.");
  } else {
    improvementSuggestions.push(
      "Add one or two relevant projects to help fill the page and show practical technical ability."
    );
  }

  if (quantifiedBulletCount > 0) {
    strengths.push("Some bullets include measurable or concrete detail.");
  } else {
    improvementSuggestions.push(
      "Add numbers, scope, or outcomes where possible to make the resume more persuasive."
    );
  }

  if (resume.skills.length >= 5) {
    strengths.push("Skills section provides useful technical coverage.");
  } else {
    improvementSuggestions.push(
      "Expand the skills section with technical tools, languages, platforms, and relevant professional skills."
    );
  }

  if (!hasSummary) {
    improvementSuggestions.push(
      "Add a short professional summary tailored to the target role."
    );
  }

  if (!hasExtras) {
    improvementSuggestions.push(
      "Consider adding certifications, leadership, coursework, clubs, or volunteer experience to strengthen the final page."
    );
  }

  if (keywordAnalysis.missingKeywords.length >= 5) {
    improvementSuggestions.push(
      "Several important keywords are still missing. Reflect them naturally in your bullets if they are truthful to your background."
    );
  }

  if (overallScore < 70) {
    improvementSuggestions.push(
      "This resume is not yet competitive enough for a strong applicant pool and needs stronger targeting and stronger evidence of impact."
    );
  }

  return {
    overallScore,
    keywordAlignmentScore,
    contentStrengthScore,
    completenessScore,
    formattingReadinessScore,
    strengths: Array.from(new Set(strengths)).slice(0, 5),
    improvementSuggestions: Array.from(new Set(improvementSuggestions)).slice(
      0,
      6
    ),
  };
}