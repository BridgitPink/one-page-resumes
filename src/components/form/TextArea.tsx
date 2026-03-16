import React from "react";

export interface TextAreaProps {
  label: string;
  rows?: number;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

export function TextArea({
  label,
  rows = 5,
  value,
  placeholder,
  onChange,
  required,
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-white/30"
      />
    </label>
  );
}
