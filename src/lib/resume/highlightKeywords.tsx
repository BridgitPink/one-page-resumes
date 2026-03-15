import React from "react";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTerms(terms: string[]): string[] {
  return Array.from(
    new Set(
      terms
        .map((term) => term.trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
    )
  );
}

function buildWholeTermRegex(terms: string[]): RegExp | null {
  const normalizedTerms = normalizeTerms(terms);

  if (!normalizedTerms.length) return null;

  const pattern = normalizedTerms.map((term) => {
    const escaped = escapeRegex(term);

    if (term.includes(" ")) {
      return `(?<!\\w)${escaped}(?!\\w)`;
    }

    return `\\b${escaped}\\b`;
  });

  return new RegExp(`(${pattern.join("|")})`, "gi");
}

function splitAndHighlight(
  text: string,
  terms: string[],
  className: string,
  keyPrefix: string
): React.ReactNode {
  if (!text) return text;

  const normalizedTerms = normalizeTerms(terms);
  if (!normalizedTerms.length) return text;

  const regex = buildWholeTermRegex(normalizedTerms);
  if (!regex) return text;

  const matches = Array.from(text.matchAll(regex));
  if (!matches.length) return text;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const matchedText = match[0];
    const start = match.index ?? 0;
    const end = start + matchedText.length;

    if (start > lastIndex) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-text-${index}`}>
          {text.slice(lastIndex, start)}
        </React.Fragment>
      );
    }

    nodes.push(
      <strong key={`${keyPrefix}-match-${index}`} className={className}>
        {matchedText}
      </strong>
    );

    lastIndex = end;
  });

  if (lastIndex < text.length) {
    nodes.push(
      <React.Fragment key={`${keyPrefix}-tail`}>
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return nodes;
}

export function renderHighlightedText(
  text: string,
  keywords: string[],
  className = "font-semibold bg-emerald-100 text-slate-950 px-0.5 rounded"
): React.ReactNode {
  return splitAndHighlight(text, keywords, className, "keyword");
}

export function renderRecruiterSignalText(
  text: string,
  signals: string[],
  className = "font-semibold bg-amber-100 text-slate-900 px-0.5 rounded"
): React.ReactNode {
  return splitAndHighlight(text, signals, className, "signal");
}