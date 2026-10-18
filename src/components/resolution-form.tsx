"use client";

import { startTransition, useActionState, useLayoutEffect, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveResolution, type ActionState } from "@/lib/actions";
import { applyDraft, commitDraft, draftFromForm, readDraft, writeDraft } from "@/lib/drafts";

const FIELDS = ["note"] as const;

export function ResolutionForm({
  caseId,
  initialNote,
}: {
  caseId: string;
  initialNote: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const draftName = `resolution:${caseId}`;
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const form = formRef.current;
      if (!form) return { error: "The note closed before it saved. Try again." };
      return commitDraft(draftName, form, FIELDS, formData, (data) => saveResolution(prev, data));
    },
    null as ActionState,
  );

  useLayoutEffect(() => {
    const draft = readDraft(draftName);
    const form = formRef.current;
    if (!draft || !form) return;
    applyDraft(form, draft);
  }, [draftName]);

  function persist() {
    const form = formRef.current;
    if (!form) return;
    writeDraft(draftName, draftFromForm(form, FIELDS));
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
      id="what-worked"
      onSubmit={onSubmit}
      onInput={persist}
      onChange={persist}
      className="space-y-3"
    >
      <input type="hidden" name="id" value={caseId} />
      <div className="space-y-2">
        <Label htmlFor="note">What worked in this landscape</Label>
        <Textarea
          id="note"
          name="note"
          required
          rows={6}
          defaultValue={initialNote}
          placeholder="The transaction, the setting, and the order you did it. This is the note you will want when the same error comes back."
          aria-invalid={state?.error ? true : undefined}
        />
      </div>
      {state?.error ? (
        <p className="wrap-block text-base text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Mark verified here"}
      </Button>
    </form>
  );
}
