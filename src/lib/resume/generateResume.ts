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

  console.log("Starting resume generation with model: gpt-5.4");
  
  try {
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

    console.log("API response received, extracting text...");
    const rawJson = extractTextOutput(response);

    if (!rawJson) {
      throw new Error("The model returned an empty response.");
    }

    console.log("Raw JSON from model (first 500 chars):", rawJson.substring(0, 500));

    try {
      const parsed = JSON.parse(rawJson) as GeneratedResume;
      console.log("Successfully parsed resume JSON");
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse generated resume JSON");
      console.error("Full response:", rawJson);
      console.error("Parse error:", parseError);
      throw new Error(
        `Failed to parse structured resume response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      );
    }
  } catch (apiError) {
    console.error("OpenAI API error:", apiError);
    if (apiError instanceof Error) {
      console.error("Error message:", apiError.message);
      console.error("Error stack:", apiError.stack);
    }
    throw apiError;
  }
}