"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditableRef } from "@/lib/hooks/useEditableRef";

export interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableField({
  value,
  onChange,
  className = "",
  placeholder = "",
  multiline = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useEditableRef(isEditing);

  const handleSave = () => {
    if (editRef.current) {
      const newValue = editRef.current.textContent || "";
      onChange(newValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (editRef.current) {
      editRef.current.textContent = value;
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      ref={editRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={() => !isEditing && setIsEditing(true)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={`${className} ${
        isEditing
          ? "outline-none border-l border-slate-300"
          : "cursor-text transition-colors"
      }`}
    >
      {value || placeholder}
    </div>
  );
}
