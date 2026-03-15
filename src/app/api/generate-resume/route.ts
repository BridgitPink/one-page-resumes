import { NextResponse } from "next/server";
import { generateMockResume } from "@/lib/resume/mockTransform";
import type { ResumeFormData } from "@/types/resume";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ResumeFormData;

    const generatedResume = generateMockResume(body);

    return NextResponse.json({
      generated: generatedResume,
    });
  } catch (error) {
    console.error("generate-resume route error:", error);

    return NextResponse.json(
      { error: "Failed to generate resume." },
      { status: 500 }
    );
  }
}