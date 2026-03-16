import React from "react";

export interface InputProps {
  label: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

export function Input({
  label,
  value,
  placeholder,
  onChange,
  required,
}: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-white/30"
      />
    </label>
  );
}
