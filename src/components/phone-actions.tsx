"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const INVESTIGATE_PHASE_EVENT = "error-book:investigate-phase";

export type InvestigatePhaseDetail = {
  phase: "idle" | "loading" | "ready" | "failed";
  label: string;
};

type PhoneAction =
  | { id: string; label: string; href: string }
  | { id: string; label: string; command: "edit" | "investigate" };

const barButton =
  "h-auto min-h-12 min-w-0 flex-1 whitespace-normal px-3 text-center leading-tight";

function thumbLabel(label: string): string {
  if (label.startsWith("Searching")) return "Searching…";
  return label;
}

function openEdit() {
  const panel = document.getElementById("edit-case-panel");
  if (!(panel instanceof HTMLDetailsElement)) return;
  panel.open = true;
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function runInvestigate() {
  const button = document.getElementById("investigate-action");
  if (!(button instanceof HTMLButtonElement) || button.disabled) return;
  button.click();
  document.getElementById("investigate-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PhoneActions({ actions }: { actions: PhoneAction[] }) {
  return (
    <nav className="phone-bar" aria-label="Actions">
      <div className="mx-auto flex w-full max-w-5xl gap-2">
        {actions.map((action) => (
          <PhoneActionButton key={action.id} action={action} />
        ))}
      </div>
    </nav>
  );
}

function PhoneActionButton({ action }: { action: PhoneAction }) {
  if ("href" in action) {
    return (
      <Button nativeButton={false} render={<Link href={action.href} />} className={barButton}>
        {action.label}
      </Button>
    );
  }

  switch (action.command) {
    case "edit":
      return (
        <Button type="button" variant="outline" className={barButton} onClick={openEdit}>
          {action.label}
        </Button>
      );
    case "investigate":
      return <InvestigateBarButton label={action.label} />;
    default: {
      const unreachable: never = action.command;
      return unreachable;
    }
  }
}

function InvestigateBarButton({ label }: { label: string }) {
  const [text, setText] = useState(label);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onPhase(event: Event) {
      const detail = (event as CustomEvent<InvestigatePhaseDetail>).detail;
      if (!detail) return;
      setBusy(detail.phase === "loading");
      setText(thumbLabel(detail.label));
    }
    document.addEventListener(INVESTIGATE_PHASE_EVENT, onPhase);
    return () => document.removeEventListener(INVESTIGATE_PHASE_EVENT, onPhase);
  }, []);

  return (
    <Button
      type="button"
      className={barButton}
      onClick={runInvestigate}
      disabled={busy}
      aria-busy={busy}
    >
      {text}
    </Button>
  );
}
