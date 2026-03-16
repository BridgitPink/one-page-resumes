"use client";

import React, { useState } from "react";
import { getBulletText } from "@/lib/resume/editorHelpers";
import { useEditableRef } from "@/lib/hooks/useEditableRef";
import type { ResumeBullet } from "@/types/resume";

export interface BulletListItemProps {
  bullet: ResumeBullet;
  onEdit: (newText: string) => void;
  onDelete: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  isSuggestion?: boolean;
  onAcceptSuggestion?: () => void;
  onDismissSuggestion?: () => void;
  shouldAutoEdit?: boolean;
}

export function BulletListItem({
  bullet,
  onEdit,
  onDelete,
  onRegenerate,
  isRegenerating = false,
  isSuggestion = false,
  onAcceptSuggestion,
  onDismissSuggestion,
  shouldAutoEdit = false,
}: BulletListItemProps) {
  const [isEditingBullet, setIsEditingBullet] = useState(shouldAutoEdit);
  const inputRef = useEditableRef(isEditingBullet);

  const handleSaveBullet = () => {
    if (inputRef.current) {
      const newValue = inputRef.current.textContent || "";
      onEdit(newValue);
      setIsEditingBullet(false);
    }
  };

  const handleCancelBullet = () => {
    if (inputRef.current) {
      inputRef.current.textContent = getBulletText(bullet);
    }
    setIsEditingBullet(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveBullet();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelBullet();
    }
  };

  const bulletText = getBulletText(bullet);

  if (isEditingBullet) {
    return (
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleSaveBullet}
        onKeyDown={handleKeyDown}
        className="ml-3 flex-1 text-[13px] text-black focus:outline-none leading-6 outline-none whitespace-pre-wrap break-words border-l border-slate-300"
      >
        {bulletText}
      </div>
    );
  }

  return (
    <li
      className={`group relative flex gap-2 ${
        isSuggestion
          ? "text-slate-500 opacity-75 cursor-pointer hover:opacity-95"
          : "text-black cursor-text"
      } transition-colors`}
      onClick={!isEditingBullet ? () => {
        if (isSuggestion) {
          onAcceptSuggestion?.();
        } else {
          setIsEditingBullet(true);
        }
      } : undefined}
    >
      <span className="flex-shrink-0">•</span>
      <span className="flex-1 text-[13px] leading-6 whitespace-pre-wrap break-words">
        {isSuggestion ? (
          <span className="flex items-center gap-2">
            <span>⚡ {bulletText}</span>
          </span>
        ) : (
          bulletText
        )}
      </span>
      {!isSuggestion && (
        <div className="absolute right-0 top-0 hidden gap-1 group-hover:flex">
          {onRegenerate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
              disabled={isRegenerating}
              className="p-1 text-slate-500 hover:text-emerald-400 disabled:opacity-50 transition-colors"
              title="Regenerate with AI"
            >
              {isRegenerating ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "↻"
              )}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            title="Delete"
          >
            ×
          </button>
        </div>
      )}
      {isSuggestion && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismissSuggestion?.();
          }}
          className="ml-2 text-slate-600 hover:text-slate-400 transition-colors"
          title="Dismiss"
        >
          ×
        </button>
      )}
    </li>
  );
}
