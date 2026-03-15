import OpenAI from "openai";
import type { GeneratedResume, ResumeFormData } from "@/types/resume";
import { buildResumePrompt } from "@/lib/resume/buildResumePrompt";
import { generatedResumeSchema } from "@/lib/resume/generateResumeSchema";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function generateResume(
  formData: ResumeFormData
): Promise<GeneratedResume> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env.local");
  }

  const { system, user } = buildResumePrompt(formData);

  const response = await client.responses.create({
    model: "gpt-5.4",
    text: {
      format: {
        type: "json_schema",
        ...generatedResumeSchema,
      },
    },
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: system }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: user }],
      },
    ],
  });

  const rawJson = extractTextOutput(response);

  if (!rawJson) {
    throw new Error("The model returned an empty response.");
  }

  try {
    return JSON.parse(rawJson) as GeneratedResume;
  } catch (error) {
    console.error("Failed to parse generated resume JSON:", rawJson, error);
    throw new Error("Failed to parse structured resume response.");
  }
}