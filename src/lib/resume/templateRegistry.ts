import { ClassicResume } from "@/components/templates/ClassicResume";
import { ModernResume } from "@/components/templates/ModernResume";
import { CompactResume } from "@/components/templates/CompactResume";

export type TemplateId = "classic" | "modern" | "compact";

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  component: React.ComponentType<any>;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Traditional professional format with clean typography",
    component: ClassicResume,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Contemporary design with accent colors and better spacing",
    component: ModernResume,
  },
  {
    id: "compact",
    label: "Compact",
    description: "ATS-friendly dense format optimized for readability",
    component: CompactResume,
  },
];

export function getTemplateComponent(templateId: string): React.ComponentType<any> | null {
  const template = TEMPLATES.find((t) => t.id === templateId);
  return template?.component ?? null;
}

export function getTemplateLabel(templateId: string): string {
  const template = TEMPLATES.find((t) => t.id === templateId);
  return template?.label ?? "Unknown";
}

export function getTemplateDescription(templateId: string): string {
  const template = TEMPLATES.find((t) => t.id === templateId);
  return template?.description ?? "";
}
