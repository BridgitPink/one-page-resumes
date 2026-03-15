import type { ResumeBullet } from "@/types/resume";

export function isResumeBullet(value: unknown): value is ResumeBullet {
  return (
    typeof value === "object" &&
    value !== null &&
    "polished" in value &&
    typeof (value as { polished: unknown }).polished === "string"
  );
}

export function getDisplayBullet(bullet: unknown): string {
  if (typeof bullet === "string") return bullet;
  if (isResumeBullet(bullet)) return bullet.polished;
  return "";
}