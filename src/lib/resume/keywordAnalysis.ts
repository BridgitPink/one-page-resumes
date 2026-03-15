import type { GeneratedResume, KeywordAnalysis } from "@/types/resume";

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "for",
  "of",
  "in",
  "on",
  "with",
  "by",
  "at",
  "from",
  "as",
  "is",
  "are",
  "be",
  "this",
  "that",
  "will",
  "can",
  "should",
  "must",
  "you",
  "your",
  "our",
  "we",
  "us",
  "their",
  "they",
  "it",
  "about",
  "into",
  "across",
  "using",
  "used",
  "ability",
  "strong",
  "team",
  "teams",
  "work",
  "working",
  "role",
  "responsibilities",
  "responsibility",
  "experience",
  "preferred",
  "required",
  "plus",
  "including",
  "such",
  "seeking",
  "looking",
  "position",
  "candidate",
  "candidates",
  "qualification",
  "qualifications",
]);

const IMPORTANT_MULTIWORD_KEYWORDS = [
  "machine learning",
  "deep learning",
  "data analysis",
  "data structures",
  "computer vision",
  "software engineering",
  "web development",
  "project management",
  "problem solving",
  "artificial intelligence",
  "technical documentation",
  "version control",
  "cloud computing",
  "object oriented",
  "front end",
  "back end",
  "full stack",
  "user interface",
  "user experience",
  "quality assurance",
  "unit testing",
  "data visualization",
  "cross functional",
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s+#.-]/g, " ");
}

function uniqueSorted(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  );
}

export function extractKeywordsFromJobDescription(jobDescription: string): string[] {
  const normalized = normalizeText(jobDescription);

  const foundMultiword = IMPORTANT_MULTIWORD_KEYWORDS.filter((phrase) =>
    normalized.includes(phrase)
  );

  const singleWords = normalized
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word))
    .filter((word) => !/^\d+$/.test(word));

  const technicalTerms = singleWords.filter((word) => {
    return (
      word.includes("python") ||
      word.includes("java") ||
      word.includes("javascript") ||
      word.includes("typescript") ||
      word.includes("react") ||
      word.includes("next") ||
      word.includes("node") ||
      word.includes("sql") ||
      word.includes("git") ||
      word.includes("api") ||
      word.includes("cloud") ||
      word.includes("azure") ||
      word.includes("aws") ||
      word.includes("docker") ||
      word.includes("kubernetes") ||
      word.includes("linux") ||
      word.includes("testing") ||
      word.includes("debugging") ||
      word.includes("automation") ||
      word.includes("security") ||
      word.includes("analytics") ||
      word.includes("ml") ||
      word.includes("ai") ||
      word.includes("data")
    );
  });

  const actionOrDomainTerms = singleWords.filter((word) => {
    return [
      "develop",
      "design",
      "build",
      "maintain",
      "deploy",
      "optimize",
      "analyze",
      "support",
      "troubleshoot",
      "document",
      "collaborate",
      "engineer",
      "research",
      "implement",
      "improve",
      "scalable",
      "systems",
      "applications",
      "platforms",
      "algorithms",
      "pipelines",
      "intern",
      "engineering",
      "software",
      "technical",
    ].includes(word);
  });

  return uniqueSorted([...foundMultiword, ...technicalTerms, ...actionOrDomainTerms]).slice(
    0,
    25
  );
}

export function analyzeKeywordMatch(
  jobDescription: string,
  resume: GeneratedResume
): KeywordAnalysis {
  const extractedKeywords = extractKeywordsFromJobDescription(jobDescription);

  const resumeCorpus = normalizeText(
    [
      resume.summary,
      ...resume.experience.flatMap((item) => [
        item.role,
        item.organization,
        ...item.bullets,
      ]),
      ...resume.projects.flatMap((item) => [item.name, ...item.bullets]),
      ...resume.skills,
      ...resume.extras,
      resume.target.role,
      resume.target.industry,
    ].join(" ")
  );

  const matchedKeywords = extractedKeywords.filter((keyword) =>
    resumeCorpus.includes(keyword.toLowerCase())
  );

  const missingKeywords = extractedKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword)
  );

  const matchScore =
    extractedKeywords.length === 0
      ? 0
      : Math.round((matchedKeywords.length / extractedKeywords.length) * 100);

  return {
    extractedKeywords,
    matchedKeywords: uniqueSorted(matchedKeywords),
    missingKeywords: uniqueSorted(missingKeywords),
    matchScore,
  };
}