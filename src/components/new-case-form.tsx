"use client";

import { startTransition, useActionState, useLayoutEffect, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCase, type ActionState } from "@/lib/actions";
import { applyDraft, commitDraft, draftFromForm, readDraft, writeDraft } from "@/lib/drafts";
import { guessArea } from "@/lib/normalize";

const DRAFT = "new-case";
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

export function NewCaseForm({ initialError = "" }: { initialError?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const contextRef = useRef<HTMLDetailsElement>(null);
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const form = formRef.current;
      if (!form) return { error: "The form closed before it saved. Try again." };
      return commitDraft(DRAFT, form, FIELDS, formData, (data) => createCase(prev, data));
    },
    null as ActionState,
  );

  useLayoutEffect(() => {
    const draft = readDraft(DRAFT);
    const form = formRef.current;
    if (!draft || !form) return;
    applyDraft(form, draft);
    if (CONTEXT.some((name) => draft[name]) && contextRef.current) {
      contextRef.current.open = true;
    }
  }, []);

  function persist() {
    const form = formRef.current;
    if (!form) return;
    writeDraft(DRAFT, draftFromForm(form, FIELDS));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => {
      action(data);
    });
  }

  return (
    <form
      ref={formRef}
      id="new-case"
      onSubmit={onSubmit}
      onInput={persist}
      onChange={persist}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="errorText">Error text</Label>
        <Textarea
          id="errorText"
          name="errorText"
          required
          defaultValue={initialError}
          rows={8}
          placeholder="Paste the status long text, the message monitoring exception, or the paragraph from the analyst's email."
          className="min-h-40 font-mono"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={state?.error ? true : undefined}
        />
        <p className="text-base leading-6 text-muted-foreground">
          IDoc numbers, message GUIDs, and host names are ignored when this is matched later.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Short name" />
          <p className="text-base leading-6 text-muted-foreground">
            Optional. The first line is used if you leave this blank.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Area</Label>
          <select
            id="area"
            name="area"
            defaultValue={guessArea(initialError)}
            className="select-touch"
          >
            <option value="idoc">IDoc</option>
            <option value="cpi">Integration Suite</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Where it came from</Label>
          <select
            id="source"
            name="source"
            defaultValue="monitoring"
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
          <Field name="messageType" label="Message type" placeholder="ORDERS, INVOIC" />
          <Field name="idocType" label="Basic type" placeholder="ORDERS05" />
          <Field name="partner" label="Partner" placeholder="Logical system or partner" />
          <Field name="iflow" label="Integration flow" placeholder="Replicate_Orders" />
          <Field name="adapter" label="Adapter" placeholder="IDoc, SOAP, SFTP, HTTP" />
        </div>
      </details>

      <div className="space-y-2">
        <Label htmlFor="resolution">What cleared it</Label>
        <Textarea
          id="resolution"
          name="resolution"
          rows={5}
          placeholder={"Leave this empty if you do not know yet.\nIf you do, put one step per line. The case is marked verified here."}
        />
      </div>

      {state?.error ? (
        <p className="wrap-block text-base text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="form-actions-dock">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Save case"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} />
    </div>
  );
}
