import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ResumeBullet } from "@/types/resume";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const suggestedBulletSchema = {
  name: "suggested_bullet",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      polished: { type: "string" },
      expanded: { type: "string" },
      impactTags: {
        type: "array",
        items: { type: "string" },
      },
      matchedKeywords: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["polished", "expanded", "impactTags", "matchedKeywords"],
  },
} as const;

function extractTextOutput(response: OpenAI.Responses.Response): string {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  const parts: string[] = [];

  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;

    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("").trim();
}

interface SuggestBulletRequest {
  type: "experience" | "project";
  role?: string;
  organization?: string;
  name?: string;
  existingBullets?: ResumeBullet[];
  targetRole: string;
  jobDescription?: string;
  skills?: string[];
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const body: SuggestBulletRequest = await req.json();

    if (!body.type || !["experience", "project"].includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid request: type must be 'experience' or 'project'" },
        { status: 400 }
      );
    }

    if (!body.targetRole) {
      return NextResponse.json(
        { error: "Invalid request: targetRole is required" },
        { status: 400 }
      );
    }

    const existingBulletTexts = (body.existingBullets || [])
      .map((b) => b.polished || b.expanded || "")
      .filter(Boolean)
      .join("\n- ");

    const contextLabel =
      body.type === "experience"
        ? `${body.role} at ${body.organization}`
        : body.name;

    const systemPrompt = `
You are an expert resume writer for college students and early-career professionals targeting grad-level hiring (internships, early career roles, or advanced positions).

Your task is to generate a single powerful resume bullet for ${body.type} that follows the STAR framework and maximizes impact for the target role.

STAR Methodology:
- Situation: Briefly establish context (1-2 words: "Owned X", "Led team of", "Developed")
- Task: Explain what problem you needed to solve or responsibility you had
- Action: Detail the specific approach, tools, and execution
- Result: Quantify the outcome with metrics, improvements, or concrete achievements

Example weak to strong STAR:
- Weak: "Fixed bugs in the codebase"
- Strong: "Debugged and optimized legacy TypeScript codebase, reducing load time by 40% and improving customer retention by 2.3%"

Rules:
1. Never invent jobs, employers, technologies, metrics, or accomplishments—improve and emphasize the reality.
2. Start with a strong action verb (Built, Led, Architected, Optimized, Delivered, Designed, Implemented, Increased, etc.).
3. Be concise: 1-2 lines on a resume.
4. Prioritize relevance to the target role: "${body.targetRole}"
5. If job description provided, match relevant terminology and emphasize alignment.
6. Prioritize quantifiable achievements; if metrics unavailable, emphasize scope and impact.
7. Avoid filler language—every word must add value.
`;

    const userPrompt = `
Context for ${contextLabel}:
${body.type === "experience" ? `Role: ${body.role}\nOrganization: ${body.organization}` : `Project: ${body.name}`}

Target role: ${body.targetRole}
${body.jobDescription ? `Job description keywords: ${body.jobDescription}` : ""}
${body.skills && body.skills.length > 0 ? `Available skills/technologies: ${body.skills.join(", ")}` : ""}

Existing bullets for this ${body.type}:
${existingBulletTexts || "(None yet—this is the first bullet)"}

Generate ONE powerful, impactful resume bullet following STAR methodology. The bullet should NOT duplicate existing bullets—instead, highlight a different strength, outcome, or responsibility from this ${body.type}.

The bullet must be optimized for the target role and include quantifiable results or scope when possible. Return valid JSON matching the schema with polished, expanded, impactTags, and matchedKeywords fields.
`;

    const response = await client.responses.create({
      model: "gpt-5.4",
      text: {
        format: {
          type: "json_schema",
          ...suggestedBulletSchema,
        },
      },
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
    });

    const rawJson = extractTextOutput(response);

    if (!rawJson) {
      return NextResponse.json(
        { error: "Model returned empty response" },
        { status: 500 }
      );
    }

    const parsedBullet = JSON.parse(rawJson) as Omit<ResumeBullet, "originalInput">;
    const bullet: ResumeBullet = {
      polished: parsedBullet.polished,
      expanded: parsedBullet.expanded,
      impactTags: parsedBullet.impactTags,
      matchedKeywords: parsedBullet.matchedKeywords,
    };

    return NextResponse.json({ bullet });
  } catch (error) {
    console.error("suggest-bullet route error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse model response as JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate suggested bullet" },
      { status: 500 }
    );
  }
}
