"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  attachResearch,
  getCase,
  insertUserCase,
  saveVerifiedNote,
  updateUserCase,
} from "@/lib/db";
import {
  extractStatusCode,
  guessArea,
  splitSteps,
  titleFromError,
} from "@/lib/normalize";
import { denyWithoutSession } from "@/lib/session";
import type { Area, SourceKind, SourceLink } from "@/lib/types";

export type ActionState = { error?: string } | null;

const AREAS = new Set<Area>(["idoc", "cpi"]);
const SOURCES = new Set<SourceKind>(["email", "monitoring", "other"]);

function clean(value: FormDataEntryValue | null, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function signaturesFor(errorText: string): string[] {
  const code = extractStatusCode(errorText);
  return [errorText.slice(0, 240), ...(code ? [`status ${code}`] : [])];
}

function readCaseFields(formData: FormData) {
  const errorText = clean(formData.get("errorText"), 20000);
  const areaValue = clean(formData.get("area"), 12);
  const sourceValue = clean(formData.get("source"), 20);
  const area = AREAS.has(areaValue as Area) ? (areaValue as Area) : guessArea(errorText);
  const source = SOURCES.has(sourceValue as SourceKind)
    ? (sourceValue as SourceKind)
    : "monitoring";
  const title = clean(formData.get("title"), 180) || titleFromError(errorText);
  const resolution = clean(formData.get("resolution"), 20000);
  const steps = splitSteps(resolution);
  return {
    errorText,
    area,
    source,
    title,
    resolution,
    steps,
    summary: steps[0] || "Open. No resolution recorded yet.",
    messageType: clean(formData.get("messageType"), 40) || null,
    idocType: clean(formData.get("idocType"), 40) || null,
    partner: clean(formData.get("partner"), 40) || null,
    iflow: clean(formData.get("iflow"), 120) || null,
    adapter: clean(formData.get("adapter"), 40) || null,
    statusCode: extractStatusCode(errorText),
    signatures: signaturesFor(errorText),
    provenance: steps.length ? ("verified" as const) : ("open" as const),
    verifiedNote: steps.length ? resolution : null,
  };
}

function readSources(raw: string): SourceLink[] {
  try {
    const parsed = JSON.parse(raw) as SourceLink[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.title === "string" &&
          typeof item.url === "string" &&
          item.url.startsWith("https://") &&
          item.url.includes("sap.com"),
      )
      .slice(0, 8)
      .map((item) => ({
        title: item.title.slice(0, 180),
        url: item.url.slice(0, 500),
      }));
  } catch {
    return [];
  }
}

export async function createCase(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await denyWithoutSession();
  if (denied) return denied;
  const fields = readCaseFields(formData);
  if (fields.errorText.length < 3) {
    return { error: "Paste the error text. A few words from the status or the exception are enough." };
  }
  const id = randomUUID();

  insertUserCase({
    id,
    area: fields.area,
    source: fields.source,
    title: fields.title,
    summary: fields.summary,
    errorText: fields.errorText,
    signatures: fields.signatures,
    statusCode: fields.statusCode,
    messageType: fields.messageType,
    idocType: fields.idocType,
    partner: fields.partner,
    iflow: fields.iflow,
    adapter: fields.adapter,
    steps: fields.steps,
    sources: [],
    provenance: fields.provenance,
    verifiedNote: fields.verifiedNote,
    researchDraft: null,
  });

  redirect(`/cases/${id}`);
}

export async function createInvestigatedCase(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await denyWithoutSession();
  if (denied) return denied;
  const errorText = clean(formData.get("errorText"), 20000);
  const draft = clean(formData.get("draft"), 20000);
  if (errorText.length < 3) {
    return { error: "The error text was empty, so nothing was saved." };
  }
  const areaValue = clean(formData.get("area"), 12);
  const sourceValue = clean(formData.get("source"), 20);
  const area = AREAS.has(areaValue as Area) ? (areaValue as Area) : guessArea(errorText);
  const source = SOURCES.has(sourceValue as SourceKind)
    ? (sourceValue as SourceKind)
    : "monitoring";
  const sources = readSources(clean(formData.get("sources"), 8000));
  const id = randomUUID();
  const title = clean(formData.get("title"), 180) || titleFromError(errorText);

  insertUserCase({
    id,
    area,
    source,
    title,
    summary: "Community draft saved. Not confirmed in this landscape yet.",
    errorText,
    signatures: signaturesFor(errorText),
    statusCode: extractStatusCode(errorText),
    messageType: null,
    idocType: null,
    partner: null,
    iflow: null,
    adapter: null,
    steps: [],
    sources,
    provenance: "open",
    verifiedNote: null,
    researchDraft: draft || null,
  });

  redirect(`/cases/${id}`);
}

export async function updateCase(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await denyWithoutSession();
  if (denied) return denied;
  const id = clean(formData.get("id"), 80);
  const existing = id ? getCase(id) : null;
  if (!existing) return { error: "That case is no longer in the book." };
  if (existing.origin !== "user") {
    return {
      error: "Shipped community steps stay read-only. Record what worked in this landscape instead.",
    };
  }
  const fields = readCaseFields(formData);
  if (fields.errorText.length < 3) {
    return { error: "Paste the error text. A few words from the status or the exception are enough." };
  }

  // The resolution text matches what this form loaded, including a blank it never had.
  // A metadata save must not wipe a fix that was verified after the panel opened.
  const keepResolution = fields.resolution === clean(formData.get("loadedResolution"), 20000);

  const updated = updateUserCase(
    id,
    {
      area: fields.area,
      source: fields.source,
      title: fields.title,
      summary: fields.summary,
      errorText: fields.errorText,
      signatures: fields.signatures,
      statusCode: fields.statusCode,
      messageType: fields.messageType,
      idocType: fields.idocType,
      partner: fields.partner,
      iflow: fields.iflow,
      adapter: fields.adapter,
      steps: fields.steps,
      provenance: fields.provenance,
      verifiedNote: fields.verifiedNote,
    },
    { keepResolution },
  );
  if (!updated) return { error: "That case is no longer in the book." };

  revalidatePath(`/cases/${id}`);
  revalidatePath("/", "layout");
  return null;
}

export async function saveResolution(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await denyWithoutSession();
  if (denied) return denied;
  const id = clean(formData.get("id"), 80);
  const note = clean(formData.get("note"), 20000);
  if (!id || !getCase(id)) return { error: "That case is no longer in the book." };
  if (note.length < 8) {
    return { error: "Write what you actually did. A sentence is enough to mark it verified here." };
  }
  saveVerifiedNote(id, note);
  revalidatePath(`/cases/${id}`);
  revalidatePath("/");
  return null;
}

export async function saveResearch(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await denyWithoutSession();
  if (denied) return denied;
  const id = clean(formData.get("id"), 80);
  const draft = clean(formData.get("draft"), 20000);
  if (!id || !getCase(id)) return { error: "That case is no longer in the book." };
  if (!draft) return { error: "There is no draft to attach." };
  const sources = readSources(clean(formData.get("sources"), 8000));
  attachResearch(id, draft, sources);
  revalidatePath(`/cases/${id}`);
  revalidatePath("/");
  return null;
}
