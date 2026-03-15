import { NextResponse } from "next/server";
import { analyzeKeywordMatch } from "@/lib/resume/keywordAnalysis";
import { generateRecommendations } from "@/lib/resume/recommendations";
import { generateResume } from "@/lib/resume/generateResume";
import { scoreResume } from "@/lib/resume/scoring";
import type { ResumeFormData } from "@/types/resume";

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
        { error: "Invalid request body for resume analysis." },
        { status: 400 }
      );
    }

    const generatedResume = await generateResume(body);
    const keywordAnalysis = analyzeKeywordMatch(
      body.target.jobDescription,
      generatedResume
    );
    const resumeScore = scoreResume(generatedResume, keywordAnalysis);
    const recommendations = generateRecommendations(
      generatedResume,
      keywordAnalysis,
      resumeScore
    );

    return NextResponse.json({
      generated: generatedResume,
      keywordAnalysis,
      resumeScore,
      recommendations,
    });
  } catch (error) {
    console.error("analyze-resume route error:", error);

    return NextResponse.json(
      { error: "Failed to analyze resume data." },
      { status: 500 }
    );
  }
}