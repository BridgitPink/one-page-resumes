"use client";

import { useState } from "react";
import { splitBulletIntoWords, isBoldWord } from "@/lib/resume/boldWordHelpers";
import type { BoldWordsState } from "@/lib/resume/storage";

interface ClickableBulletProps {
  text: string;
  section: string; // "experience" or "projects"
  entryIndex: number;
  bulletIndex: number;
  boldState: BoldWordsState;
  onWordClick: (section: string, entryIndex: number, bulletIndex: number, wordIndex: number) => void;
}

export function ClickableBullet({
  text,
  section,
  entryIndex,
  bulletIndex,
  boldState,
  onWordClick,
}: ClickableBulletProps) {
  const words = splitBulletIntoWords(text);

  return (
    <div className="text-sm leading-relaxed">
      {words.map((word, wordIndex) => {
        const isBold = isBoldWord(section, entryIndex, bulletIndex, wordIndex, boldState);

        return (
          <span
            key={wordIndex}
            onClick={() => onWordClick(section, entryIndex, bulletIndex, wordIndex)}
            className={`cursor-pointer break-words ${isBold ? "font-bold" : "font-normal"}`}
            style={{
              userSelect: "none",
              transition: "font-weight 100ms ease",
            }}
          >
            {word.text}{wordIndex < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
}
