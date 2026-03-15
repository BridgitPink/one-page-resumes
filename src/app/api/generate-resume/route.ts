import { NextResponse } from "next/server";
import { generateResume } from "@/lib/resume/generateResume";
import type { GenerateResumeResponse, ResumeFormData } from "@/types/resume";

function isResumeFormData(value: unknown): value is ResumeFormData {
  if (!value || typeof value !== "object") return false;

  const data = value as ResumeFormData;

  return (
    typeof data.basics?.fullName === "string" &&
    typeof data.target?.role === "string" &&
    Array.isArray(data.experiences) &&
    Array.isArray(data.projects) &&
    typeof data.skills === "string" &&
    typeof data.extras === "string"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!isResumeFormData(body)) {
      return NextResponse.json(
        { error: "Invalid request body for resume generation." },
        { status: 400 }
      );
    }

    const generated = await generateResume(body);

    const payload: GenerateResumeResponse = { generated };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("generate-resume route error:", error);

    return NextResponse.json(
      { error: "Failed to generate resume." },
      { status: 500 }
    );
  }
}