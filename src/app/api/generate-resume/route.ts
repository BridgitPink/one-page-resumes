import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { ResumeFormData } from "@/types/resume";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generationSchema = {
  name: "generated_resume",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      basics: {
        type: "object",
        additionalProperties: false,
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          location: { type: "string" },
          linkedin: { type: "string" },
          github: { type: "string" },
          school: { type: "string" },
          degree: { type: "string" },
          graduationDate: { type: "string" },
          gpa: { type: "string" },
        },
        required: [
          "fullName",
          "email",
          "phone",
          "location",
          "linkedin",
          "github",
          "school",
          "degree",
          "graduationDate",
          "gpa",
        ],
      },
      target: {
        type: "object",
        additionalProperties: false,
        properties: {
          role: { type: "string" },
          industry: { type: "string" },
          jobDescription: { type: "string" },
        },
        required: ["role", "industry", "jobDescription"],
      },
      summary: { type: "string" },
      experience: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            role: { type: "string" },
            organization: { type: "string" },
            bullets: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["role", "organization", "bullets"],
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            bullets: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name", "bullets"],
        },
      },
      skills: {
        type: "array",
        items: { type: "string" },
      },
      extras: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "basics",
      "target",
      "summary",
      "experience",
      "projects",
      "skills",
      "extras",
    ],
  },
};

function buildPrompt(data: ResumeFormData): string {
  return `
You are a senior technical recruiter and resume writer.

Your job is to transform rough student input into a polished, professional one-page resume.

Target audience:
College students and early-career professionals applying for internships or entry-level roles.

WRITING RULES:

• Do NOT invent companies, technologies, certifications, awards, or metrics.
• You may rewrite content to sound stronger and more professional.
• Convert vague descriptions into concise, action-oriented bullet points.
• Use strong technical verbs such as:
  Built, Developed, Implemented, Designed, Automated, Optimized, Analyzed, Integrated.

• Use STAR-style thinking:
  - Situation / task
  - Action taken
  - Result or purpose

• Each bullet should:
  - start with an action verb
  - be concise (10–18 words)
  - highlight skills, tools, or impact

• Align the resume to the **target role and job description** when possible.

• Skills should include:
  - user provided skills
  - closely related skills implied by the experience
  - do NOT hallucinate unrelated tools.

• The summary should be:
  - 2 sentences
  - tailored to the target role
  - confident but truthful.

OUTPUT RULES:

• Return ONLY valid JSON matching the schema.
• Do not include commentary.
• Do not include markdown.
• Do not include explanations.

User resume input:

${JSON.stringify(data, null, 2)}
`;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in server environment." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as ResumeFormData;

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "system",
          content:
            "You write polished, truthful, recruiter-friendly resumes for students and early-career candidates.",
        },
        {
          role: "user",
          content: buildPrompt(body),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          strict: true,
          name: generationSchema.name,
          schema: generationSchema.schema,
        },
      },
    });

    const raw = response.output_text;
    const generated = JSON.parse(raw);

    return NextResponse.json({ generated });
  } catch (error) {
    console.error("generate-resume route error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume." },
      { status: 500 }
    );
  }
}