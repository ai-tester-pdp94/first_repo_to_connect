"use client";

import { startTransition, useActionState, useLayoutEffect, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCase, type ActionState } from "@/lib/actions";
import { applyDraft, commitDraft, draftFromForm, readDraft, writeDraft, clearDraft } from "@/lib/drafts";
import type { Area, SourceKind } from "@/lib/types";

const FIELDS = [
  "title",
  "errorText",
  "area",
  "source",
  "messageType",
  "idocType",
  "partner",
  "iflow",
  "adapter",
  "resolution",
] as const;

const CONTEXT = ["messageType", "idocType", "partner", "iflow", "adapter"] as const;

export type EditableCase = {
  id: string;
  title: string;
  errorText: string;
  area: Area;
  source: SourceKind;
  messageType: string;
  idocType: string;
  partner: string;
  iflow: string;
  adapter: string;
  resolution: string;
};

export function EditCaseForm({ item }: { item: EditableCase }) {
  const formRef = useRef<HTMLFormElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contextRef = useRef<HTMLDetailsElement>(null);
  const resolutionEdited = useRef(false);
  const draftName = `edit:${item.id}`;
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const form = formRef.current;
      if (!form) return { error: "The edit form closed before it saved. Open it and try again." };
      const result = await commitDraft(draftName, form, FIELDS, formData, (data) =>
        updateCase(prev, data),
      );
      if (!result?.error) {
        resolutionEdited.current = false;
        const resolution = form.elements.namedItem("resolution");
        const loaded = form.elements.namedItem("loadedResolution");
        if (resolution instanceof HTMLTextAreaElement && loaded instanceof HTMLInputElement) {
          loaded.value = resolution.value;
          loaded.defaultValue = resolution.value;
          resolution.defaultValue = resolution.value;
        }
      }
      if (detailsRef.current) detailsRef.current.open = Boolean(result?.error);
      return result;
    },
    null as ActionState,
  );
  const hasContext = Boolean(
    item.messageType || item.idocType || item.partner || item.iflow || item.adapter,
  );

  useLayoutEffect(() => {
    const draft = readDraft(draftName);
    const form = formRef.current;
    if (draft && form) {
      resolutionEdited.current = draft.resolutionEdited === "1";
      const draftFields: Record<string, string> = {};
      for (const name of FIELDS) {
        if (name === "resolution" && !resolutionEdited.current) continue;
        const value = draft[name];
        if (typeof value === "string") draftFields[name] = value;
      }
      applyDraft(form, draftFields);
      if (detailsRef.current) detailsRef.current.open = true;
      if (contextRef.current) {
        contextRef.current.open = CONTEXT.some((name) => draft[name]);
      }
      return;
    }
    if (hasContext && contextRef.current) contextRef.current.open = true;
  }, [draftName, hasContext]);

  useLayoutEffect(() => {
    if (resolutionEdited.current) return;
    const form = formRef.current;
    if (!form) return;
    const resolution = form.elements.namedItem("resolution");
    const loaded = form.elements.namedItem("loadedResolution");
    if (resolution instanceof HTMLTextAreaElement) {
      resolution.value = item.resolution;
      resolution.defaultValue = item.resolution;
    }
    if (loaded instanceof HTMLInputElement) {
      loaded.value = item.resolution;
      loaded.defaultValue = item.resolution;
    }
  }, [item.resolution]);

  function persist() {
    const form = formRef.current;
    if (!form) return;
    const draft = draftFromForm(form, FIELDS);
    draft.resolutionEdited = resolutionEdited.current ? "1" : "";
    writeDraft(draftName, draft);
  }

  function onEdit(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement && target.name === "resolution") {
      resolutionEdited.current = true;
    }
    persist();
  }

  function cancel() {
    resolutionEdited.current = false;
    clearDraft(draftName);
    formRef.current?.reset();
    if (detailsRef.current) detailsRef.current.open = false;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persist();
    const data = new FormData(event.currentTarget);
    startTransition(() => {
      action(data);
    });
  }

  const source =
    item.source === "email" || item.source === "monitoring" || item.source === "other"
      ? item.source
      : "monitoring";

  return (
    <details
      id="edit-case-panel"
      ref={detailsRef}
      className="scroll-under-header rounded-xl border bg-card"
    >
      <summary className="min-h-12 cursor-pointer px-4 py-3 text-base font-medium">Edit case</summary>
      <form
        ref={formRef}
        id="edit-case"
        onSubmit={onSubmit}
        onInput={onEdit}
        onChange={onEdit}
        className="edit-form-pad space-y-5 px-4 pt-1"
      >
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="loadedResolution" defaultValue={item.resolution} />
        <p className="text-base leading-6 text-muted-foreground">
          Saving updates this case. It does not create another one.
        </p>

        <div className="space-y-2">
          <Label htmlFor="edit-errorText">Error text</Label>
          <Textarea
            id="edit-errorText"
            name="errorText"
            required
            defaultValue={item.errorText}
            rows={8}
            className="min-h-40 font-mono"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={state?.error ? true : undefined}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" defaultValue={item.title} placeholder="Short name" />
            <p className="text-base leading-6 text-muted-foreground">
              Optional. The first line is used if you leave this blank.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-area">Area</Label>
            <select
              id="edit-area"
              name="area"
              defaultValue={item.area}
              className="select-touch"
            >
              <option value="idoc">IDoc</option>
              <option value="cpi">Integration Suite</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-source">Where it came from</Label>
            <select
              id="edit-source"
              name="source"
              defaultValue={source}
              className="select-touch"
            >
              <option value="monitoring">Message monitoring</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <details ref={contextRef} className="rounded-xl border">
          <summary className="min-h-12 cursor-pointer px-4 py-3 text-base font-medium">Interface context</summary>
          <div className="mt-1 grid gap-4 px-4 pb-4 sm:grid-cols-2">
            <Field name="messageType" label="Message type" placeholder="ORDERS, INVOIC" defaultValue={item.messageType} />
            <Field name="idocType" label="Basic type" placeholder="ORDERS05" defaultValue={item.idocType} />
            <Field name="partner" label="Partner" placeholder="Logical system or partner" defaultValue={item.partner} />
            <Field name="iflow" label="Integration flow" placeholder="Replicate_Orders" defaultValue={item.iflow} />
            <Field name="adapter" label="Adapter" placeholder="IDoc, SOAP, SFTP, HTTP" defaultValue={item.adapter} />
          </div>
        </details>

        <div className="space-y-2">
          <Label htmlFor="edit-resolution">What cleared it</Label>
          <Textarea
            id="edit-resolution"
            name="resolution"
            rows={5}
            defaultValue={item.resolution}
            placeholder={"Leave this empty if you do not know yet.\nIf you do, put one step per line. The case is marked verified here."}
          />
        </div>

        {state?.error ? (
          <p className="wrap-block text-base text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="form-actions-above-bar">
          <Button type="submit" disabled={pending} className="min-w-0 flex-1 sm:flex-none">
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={cancel} disabled={pending} className="min-w-0 flex-1 sm:flex-none">
            Cancel
          </Button>
        </div>
      </form>
    </details>
  );
}

function Field({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`edit-${name}`}>{label}</Label>
      <Input id={`edit-${name}`} name={name} placeholder={placeholder} defaultValue={defaultValue} />
    </div>
  );
}
