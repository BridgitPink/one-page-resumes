export type ExperienceEntry = {
  role: string;
  organization: string;
  details: string;
};

export type ProjectEntry = {
  name: string;
  details: string;
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

export type GeneratedResume = {
  basics: ResumeFormData["basics"];
  target: ResumeFormData["target"];
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