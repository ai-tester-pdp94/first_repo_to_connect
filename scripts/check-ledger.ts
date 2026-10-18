import { getDb, insertUserCase } from "../src/lib/db";
import { investigateError } from "../src/lib/research";
import { searchCases } from "../src/lib/search";

function show(label: string, result: ReturnType<typeof searchCases>) {
  console.log(`\n== ${label} strong=${result.strong} count=${result.hits.length}`);
  for (const hit of result.hits.slice(0, 3)) {
    console.log(`${hit.score.toFixed(1)} ${hit.provenance} ${hit.title}`);
  }
}

async function main() {
  show(
    "status 51",
    searchCases({
      q: "Status 51 application document not posted IDoc 0000000000123456",
    }),
  );
  show(
    "ea390",
    searchCases({
      q: "Message no. EA390 SOAP IDoc application could not be started HTTP 500",
    }),
  );
  show(
    "pkix",
    searchCases({
      q: "PKIX path building failed unable to find valid certification path",
    }),
  );
  show(
    "csrf",
    searchCases({ q: "/IWBEP/CM_V4H/042 CSRF token is invalid" }),
  );
  show("sftp", searchCases({ q: "com.jcraft.jsch.JSchException: Auth fail" }));
  show("unknown", searchCases({ q: "zebra quartz manifold 998877" }));
  show("bd87", searchCases({ q: "reprocess with BD87 without WE19" }));

  getDb().prepare("DELETE FROM cases WHERE id = ?").run("user-test-51");
  insertUserCase({
    id: "user-test-51",
    area: "idoc",
    source: "email",
    title: "ORDERS status 51 missing sold-to",
    summary: "Customer master was incomplete.",
    errorText: "Status 51 application document not posted. Sold-to party missing for ORDERS.",
    signatures: [
      "Status 51 application document not posted. Sold-to party missing for ORDERS.",
      "status 51",
    ],
    statusCode: "51",
    messageType: "ORDERS",
    idocType: null,
    partner: null,
    iflow: null,
    adapter: null,
    steps: ["Maintained the sold-to and reprocessed with BD87."],
    sources: [],
    provenance: "verified",
    verifiedNote: "Maintained the sold-to in XD02 and reprocessed with BD87.",
    researchDraft: null,
  });
  const ranked = searchCases({ q: "Status 51 application document not posted" });
  show("status 51 after own fix", ranked);
  if (ranked.hits[0]?.id !== "user-test-51") {
    throw new Error("Verified case did not rank first");
  }
  getDb().prepare("DELETE FROM cases WHERE id = ?").run("user-test-51");

  const research = await investigateError(
    "IDoc status 56 EDI partner profile not available",
  );
  console.log(`\n== research ${research.sources.length} ${research.error ?? "ok"}`);
  console.log(research.sources.map((source) => source.title).join(" | "));
  if (research.sources.length < 2) {
    throw new Error("Research returned too few sources");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
