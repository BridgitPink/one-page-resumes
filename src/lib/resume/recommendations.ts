import OpenAI from "openai";
import type {
  GeneratedResume,
  KeywordAnalysis,
  ResumeScore,
} from "@/types/resume";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RecommendationItem = {
  text: string;
  rationale: string;
  confidence: "high" | "medium" | "low";
  missingKeywords: string[];
  category: "project" | "certification" | "resume" | "coursework";
};

function getBulletText(bullet: any): string {
  if (typeof bullet === "string") return bullet;

  if (!bullet || typeof bullet !== "object") return "";

  return [
    bullet.originalInput,
    bullet.polished,
    bullet.expanded,
    ...(Array.isArray(bullet.impactTags) ? bullet.impactTags : []),
    ...(Array.isArray(bullet.matchedKeywords) ? bullet.matchedKeywords : []),
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizeExperienceArray(resume: GeneratedResume): any[] {
  const maybeResume = resume as any;

  if (Array.isArray(maybeResume.experiences)) return maybeResume.experiences;
  if (Array.isArray(maybeResume.experience)) return maybeResume.experience;

  return [];
}

function buildResumeContext(
  resume: GeneratedResume,
  keywordAnalysis: KeywordAnalysis,
  score: ResumeScore
) {
  const experiences = normalizeExperienceArray(resume).map((item: any) => ({
    role: item?.role ?? "",
    organization: item?.organization ?? item?.company ?? "",
    bullets: Array.isArray(item?.bullets)
      ? item.bullets.map(getBulletText).filter(Boolean)
      : [],
  }));

  const projects = Array.isArray(resume.projects)
    ? resume.projects.map((item: any) => ({
        name: item?.name ?? "",
        bullets: Array.isArray(item?.bullets)
          ? item.bullets.map(getBulletText).filter(Boolean)
          : [],
      }))
    : [];

  return {
    targetRole: resume.target?.role ?? "",
    targetIndustry: resume.target?.industry ?? "",
    jobDescription: resume.target?.jobDescription ?? "",
    summary: resume.summary ?? "",
    experiences,
    projects,
    skills: Array.isArray(resume.skills) ? resume.skills : [],
    extras: Array.isArray(resume.extras) ? resume.extras : [],
    matchedKeywords: keywordAnalysis.matchedKeywords ?? [],
    missingKeywords: keywordAnalysis.missingKeywords ?? [],
    extractedKeywords: keywordAnalysis.extractedKeywords ?? [],
    resumeScore:
      (score as any)?.overallScore ??
      (score as any)?.score ??
      null,
  };
}

function fallbackRecommendations(
  keywordAnalysis: KeywordAnalysis,
  resume: GeneratedResume
): RecommendationItem[] {
  const missing = (keywordAnalysis.missingKeywords ?? []).slice(0, 6);
  const targetRole = resume.target?.role || "target role";

  return [
    {
      category: "project",
      text: `Build a portfolio project that directly demonstrates ${missing.slice(0, 3).join(", ") || targetRole}.`,
      rationale:
        "A targeted project is one of the fastest ways to close skill gaps shown in the job description.",
      confidence: "medium",
      missingKeywords: missing,
    },
    {
      category: "certification",
      text: `Choose one certification that supports the missing skills most relevant to your ${targetRole} goal.`,
      rationale:
        "A relevant certification can strengthen credibility when experience is still developing.",
      confidence: "medium",
      missingKeywords: missing,
    },
    {
      category: "resume",
      text: "Revise bullets to more clearly show tools, outcomes, and role-relevant terminology from the job description.",
      rationale:
        "Improved wording helps recruiters see alignment faster and increases ATS relevance.",
      confidence: "high",
      missingKeywords: missing,
    },
  ];
}

export async function generateRecommendations(
  resume: GeneratedResume,
  keywordAnalysis: KeywordAnalysis,
  score: ResumeScore
): Promise<RecommendationItem[]> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackRecommendations(keywordAnalysis, resume);
  }

  const context = buildResumeContext(resume, keywordAnalysis, score);

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      text: {
        format: {
          type: "json_schema",
          name: "resume_recommendations",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    text: { type: "string" },
                    rationale: { type: "string" },
                    confidence: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                    },
                    missingKeywords: {
                      type: "array",
                      items: { type: "string" },
                    },
                    category: {
                      type: "string",
                      enum: ["project", "certification", "resume", "coursework"],
                    },
                  },
                  required: [
                    "text",
                    "rationale",
                    "confidence",
                    "missingKeywords",
                    "category",
                  ],
                },
              },
            },
            required: ["recommendations"],
          },
          strict: true,
        },
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are a career recommendation engine. Generate structured, practical suggestions for improving a resume based on missing skills, job alignment gaps, and current resume content. Prefer highly specific project ideas and realistic certifications. Avoid generic filler. Make the suggestions broadly useful across industries, not only for computer science. Use the missing skills from analysis as the main signal. Prioritize: 1) role-relevant project ideas, 2) certifications, 3) resume improvements, 4) coursework framing when relevant.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(
                {
                  instructions: {
                    goal: "Generate 6 to 10 structured suggestions.",
                    priorities: [
                      "Use missing keywords as the strongest signal",
                      "Give concrete project ideas when possible",
                      "Recommend certifications only when they make sense",
                      "Include resume improvement suggestions when alignment is weak",
                      "Keep suggestions realistic for students and early-career candidates",
                    ],
                    orderingPreference: [
                      "project",
                      "certification",
                      "resume",
                      "coursework",
                    ],
                  },
                  context,
                },
                null,
                2
              ),
            },
          ],
        },
      ],
    });

    const raw = response.output_text?.trim();

    if (!raw) {
      return fallbackRecommendations(keywordAnalysis, resume);
    }

    const parsed = JSON.parse(raw) as {
      recommendations?: RecommendationItem[];
    };

    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [];

    if (recommendations.length === 0) {
      return fallbackRecommendations(keywordAnalysis, resume);
    }

    return recommendations.slice(0, 10);
  } catch (error) {
    console.error("generateRecommendations error:", error);
    return fallbackRecommendations(keywordAnalysis, resume);
  }
}