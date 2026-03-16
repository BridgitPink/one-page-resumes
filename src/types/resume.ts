export type ExperienceEntry = {
  role: string;
  organization: string;
  details: string;
  date?: string;
};

export type ProjectEntry = {
  name: string;
  details: string;
  link?: string;
};

export type ResumeFormData = {
  basics: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    school: string;
    degree: string;
    graduationDate: string;
    gpa: string;
  };
  target: {
    role: string;
    industry: string;
    jobDescription: string;
  };
  experiences: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: string;
  extras: string;
};

export type ResumeBullet = {
  originalInput?: string;
  polished: string;
  expanded?: string;
  impactTags?: string[];
  matchedKeywords?: string[];
};

export type GeneratedResume = {
  basics: ResumeFormData["basics"];
  target: ResumeFormData["target"];
  summary: string;
  experience: Array<{
    role: string;
    organization: string;
    date?: string;
    bullets: ResumeBullet[];
  }>;
  projects: Array<{
    name: string;
    link?: string;
    bullets: ResumeBullet[];
  }>;
  skills: string[];
  extras: string[];
};

export type KeywordAnalysis = {
  extractedKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  matchScore: number;
};

export type ResumeScore = {
  overallScore: number;
  keywordAlignmentScore: number;
  contentStrengthScore: number;
  completenessScore: number;
  formattingReadinessScore: number;
  strengths: string[];
  improvementSuggestions: string[];
};

export type ResumeRecommendations = {
  recommendedProjects: string[];
  recommendedCertifications: string[];
  recommendedCourseworkFraming: string[];
  recommendedSectionAdditions: string[];
};

export type GenerateResumeResponse = {
  generated: GeneratedResume;
};

export type AnalyzeResumeResponse = {
  generated: GeneratedResume;
  keywordAnalysis: KeywordAnalysis;
  resumeScore: ResumeScore;
  recommendations: ResumeRecommendations;
};