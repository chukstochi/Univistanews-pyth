import { useState, useEffect } from "react";

/**
 * Like useState, but automatically saves to localStorage on every change
 * and restores on mount — so a page reload doesn't lose what was typed.
 *
 * Usage: const [form, setForm] = usePersistedForm("draft:new-article", { title: "", body: "" });
 *
 * Call clearDraft() after a successful submit so old drafts don't linger.
 */
export function usePersistedForm(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors (e.g. private browsing mode)
    }
  }, [key, value]);

  function clearDraft() {
    localStorage.removeItem(key);
    setValue(initialValue);
  }

  return [value, setValue, clearDraft];
}