export type RecruiterSignalAnalysis = {
  tools: string[];
  metrics: string[];
  actionVerbs: string[];
  impactPhrases: string[];
};

const TOOL_TERMS = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Git",
  "GitHub",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Linux",
  "Tableau",
  "Power BI",
  "Excel",
  "TensorFlow",
  "PyTorch",
  "OpenAI",
  "API",
  "REST API",
  "Tailwind",
  "HTML",
  "CSS",
];

const ACTION_VERBS = [
  "built",
  "developed",
  "designed",
  "implemented",
  "created",
  "led",
  "optimized",
  "analyzed",
  "improved",
  "launched",
  "supported",
  "engineered",
  "deployed",
  "automated",
  "collaborated",
];

const IMPACT_PHRASES = [
  "improved efficiency",
  "reduced manual work",
  "streamlined workflow",
  "supported decision-making",
  "improved usability",
  "increased visibility",
  "reduced errors",
  "enhanced performance",
  "optimized process",
  "improved performance",
];

function uniqueSorted(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function buildCorpus(parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

function extractTools(text: string): string[] {
  const lower = text.toLowerCase();
  return TOOL_TERMS.filter((term) => lower.includes(term.toLowerCase()));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractActionVerbs(text: string): string[] {
  return ACTION_VERBS.filter((verb) => {
    const regex = new RegExp(`\\b${escapeRegex(verb)}\\b`, "i");
    return regex.test(text);
  });
}

function extractImpactPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return IMPACT_PHRASES.filter((phrase) => lower.includes(phrase.toLowerCase()));
}

function extractMetrics(text: string): string[] {
  const matches = text.match(
    /\b\d+(?:\.\d+)?%|\$\d+(?:,\d{3})*(?:\.\d+)?|\b\d+(?:,\d{3})*(?:\.\d+)?\b/g
  );

  return uniqueSorted(matches ?? []).slice(0, 12);
}

export function analyzeRecruiterSignals(
  parts: string[]
): RecruiterSignalAnalysis {
  const corpus = buildCorpus(parts);

  return {
    tools: uniqueSorted(extractTools(corpus)).slice(0, 12),
    metrics: extractMetrics(corpus),
    actionVerbs: uniqueSorted(extractActionVerbs(corpus)).slice(0, 12),
    impactPhrases: uniqueSorted(extractImpactPhrases(corpus)).slice(0, 8),
  };
}