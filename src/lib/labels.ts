import type { Area, Provenance, SourceKind } from "@/lib/types";

export function areaLabel(area: Area): string {
  return area === "idoc" ? "IDoc" : "Integration Suite";
}

export function provenanceLabel(provenance: Provenance): string {
  if (provenance === "verified") return "Verified here";
  if (provenance === "open") return "Open";
  return "SAP Community";
}

export function sourceLabel(source: SourceKind): string {
  if (source === "email") return "Email";
  if (source === "monitoring") return "Message monitoring";
  if (source === "community") return "SAP Community";
  return "Other";
}
