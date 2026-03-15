import React from "react";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function renderHighlightedText(
  text: string,
  keywords: string[],
  className = "font-semibold text-slate-950"
): React.ReactNode {
  if (!text) return text;
  if (!keywords.length) return text;

  const normalizedKeywords = Array.from(
    new Set(
      keywords
        .map((keyword) => keyword.trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
    )
  );

  if (!normalizedKeywords.length) return text;

  const pattern = normalizedKeywords.map(escapeRegex).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isMatch = normalizedKeywords.some(
      (keyword) => keyword.toLowerCase() === part.toLowerCase()
    );

    return isMatch ? (
      <strong key={`${part}-${index}`} className={className}>
        {part}
      </strong>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    );
  });
}