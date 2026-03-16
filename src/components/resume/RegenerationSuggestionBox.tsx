import type { ResumeBullet } from "@/types/resume";
import { getBulletText } from "@/lib/resume/editorHelpers";

interface RegenerationSuggestionBoxProps {
  suggestion: ResumeBullet;
  onAccept: () => void;
  onDismiss: () => void;
}

/**
 * Displays an AI-regenerated bullet suggestion with accept/dismiss options
 * Used when user regenerates an existing bullet with AI improvement
 */
export default function RegenerationSuggestionBox({
  suggestion,
  onAccept,
  onDismiss,
}: RegenerationSuggestionBoxProps) {
  return (
    <li className="mt-1 ml-3 p-2 rounded bg-blue-50 border border-blue-200 text-[13px] leading-6">
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 text-blue-600">💡</span>
        <div className="flex-1">
          <p className="text-blue-900 mb-2">{getBulletText(suggestion)}</p>
          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="text-[12px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Use this
            </button>
            <button
              onClick={onDismiss}
              className="text-[12px] px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Keep original
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
