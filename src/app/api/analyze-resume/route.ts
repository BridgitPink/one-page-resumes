import { NextResponse } from "next/server";
import { analyzeKeywordMatch } from "@/lib/resume/keywordAnalysis";
import { generateRecommendations } from "@/lib/resume/recommendations";
import { generateMockResume } from "@/lib/resume/mockTransform";
import { scoreResume } from "@/lib/resume/scoring";
import type { ResumeFormData } from "@/types/resume";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ResumeFormData;

    const generatedResume = generateMockResume(body);
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