import { useEffect, useRef } from "react";

/**
 * Shared hook for managing focus and selection in inline editors
 * Handles select-all behavior when entering edit mode
 */
export function useEditableRef(isEditing: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      if (ref.current.textContent) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(ref.current);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isEditing]);

  return ref;
}
