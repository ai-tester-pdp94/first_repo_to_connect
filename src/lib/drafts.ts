"use client";

import type { ActionState } from "@/lib/actions";

const PREFIX = "error-book:draft:";

export type Draft = Record<string, string>;

function storageKey(name: string) {
  return `${PREFIX}${name}`;
}

export function readDraft(name: string): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(name));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const draft: Draft = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") draft[key] = value;
    }
    return draft;
  } catch {
    return null;
  }
}

export function writeDraft(name: string, draft: Draft) {
  try {
    sessionStorage.setItem(storageKey(name), JSON.stringify(draft));
  } catch {
    // Quota or private mode.
  }
}

export function clearDraft(name: string) {
  try {
    sessionStorage.removeItem(storageKey(name));
  } catch {
    // Storage may already be unavailable.
  }
}

export function draftFromForm(form: HTMLFormElement, fields: readonly string[]): Draft {
  const data = new FormData(form);
  const draft: Draft = {};
  for (const field of fields) {
    const value = data.get(field);
    draft[field] = typeof value === "string" ? value.slice(0, 20000) : "";
  }
  return draft;
}

export function applyDraft(form: HTMLFormElement, draft: Draft) {
  for (const [name, value] of Object.entries(draft)) {
    const field = form.elements.namedItem(name);
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      field.value = value;
    }
  }
}

function isNextRedirect(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) return false;
  return typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");
}

export async function commitDraft(
  name: string,
  form: HTMLFormElement,
  fields: readonly string[],
  formData: FormData,
  run: (formData: FormData) => Promise<ActionState>,
): Promise<ActionState> {
  const snapshot = readDraft(name) ?? draftFromForm(form, fields);
  clearDraft(name);
  try {
    const result = await run(formData);
    if (result?.error) writeDraft(name, snapshot);
    return result;
  } catch (error) {
    if (!isNextRedirect(error)) writeDraft(name, snapshot);
    throw error;
  }
}
