"use client";

import React from "react";

export interface SectionTitleProps {
  title: string;
  onDelete?: () => void;
}

export function SectionTitle({ title, onDelete }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-400 pb-1">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-neutral-900">
        {title}
      </h2>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-[11px] px-2 py-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          title={`Delete ${title} section`}
        >
          Delete
        </button>
      )}
    </div>
  );
}
