import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { communityLibrary } from "@/lib/community-library";
import { splitSteps } from "@/lib/normalize";
import type {
  Area,
  CaseRecord,
  CaseSummary,
  LibraryEntry,
  Origin,
  Provenance,
  SourceKind,
  SourceLink,
} from "@/lib/types";

const COMMUNITY_LIBRARY_HASH_KEY = "community_library_hash";

function communityLibraryHash(): string {
  return createHash("sha256")
    .update(JSON.stringify(communityLibrary))
    .digest("hex");
}

type CaseRow = {
  id: string;
  created_at: string;
  updated_at: string;
  area: Area;
  origin: Origin;
  provenance: Provenance;
  source: SourceKind;
  title: string;
  summary: string;
  error_text: string;
  signatures: string;
  status_code: string | null;
  message_type: string | null;
  idoc_type: string | null;
  partner: string | null;
  iflow: string | null;
  adapter: string | null;
  landscape_note: string | null;
  verified_note: string | null;
  research_draft: string | null;
  sort_order: number;
};

const globalForDb = globalThis as unknown as { ledger?: Database.Database };

function mapSummary(row: CaseRow): CaseSummary {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    area: row.area,
    origin: row.origin,
    provenance: row.provenance,
    source: row.source,
    title: row.title,
    summary: row.summary,
    errorText: row.error_text,
    signatures: JSON.parse(row.signatures) as string[],
    statusCode: row.status_code,
    messageType: row.message_type,
    idocType: row.idoc_type,
    partner: row.partner,
    iflow: row.iflow,
    adapter: row.adapter,
    landscapeNote: row.landscape_note,
    verifiedNote: row.verified_note,
    researchDraft: row.research_draft,
    sortOrder: row.sort_order,
  };
}

function migrate(db: Database.Database) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      area TEXT NOT NULL,
      origin TEXT NOT NULL,
      provenance TEXT NOT NULL,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      error_text TEXT NOT NULL,
      signatures TEXT NOT NULL DEFAULT '[]',
      status_code TEXT,
      message_type TEXT,
      idoc_type TEXT,
      partner TEXT,
      iflow TEXT,
      adapter TEXT,
      landscape_note TEXT,
      verified_note TEXT,
      research_draft TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      body TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      seeded INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS cases_area ON cases(area);
    CREATE INDEX IF NOT EXISTS cases_provenance ON cases(provenance);

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const sourceCols = db.prepare("PRAGMA table_info(sources)").all() as {
    name: string;
  }[];
  if (!sourceCols.some((col) => col.name === "seeded")) {
    db.exec(
      "ALTER TABLE sources ADD COLUMN seeded INTEGER NOT NULL DEFAULT 0",
    );
    const markSeeded = db.prepare(
      "UPDATE sources SET seeded = 1 WHERE case_id = ? AND url = ?",
    );
    const backfill = db.transaction(() => {
      communityLibrary.forEach((entry) => {
        entry.sources.forEach((source) => {
          markSeeded.run(entry.id, source.url);
        });
      });
    });
    backfill();
  }

  const fts = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'cases_fts'",
    )
    .get();
  if (!fts) {
    db.exec(`
      CREATE VIRTUAL TABLE cases_fts USING fts5(
        title,
        summary,
        error_text,
        signatures,
        status_code,
        message_type,
        idoc_type,
        partner,
        iflow,
        adapter,
        verified_note,
        content='cases',
        content_rowid='rowid'
      );

      CREATE TRIGGER cases_ai AFTER INSERT ON cases BEGIN
        INSERT INTO cases_fts(
          rowid, title, summary, error_text, signatures, status_code,
          message_type, idoc_type, partner, iflow, adapter, verified_note
        ) VALUES (
          new.rowid, new.title, new.summary, new.error_text, new.signatures, new.status_code,
          new.message_type, new.idoc_type, new.partner, new.iflow, new.adapter, new.verified_note
        );
      END;

      CREATE TRIGGER cases_ad AFTER DELETE ON cases BEGIN
        INSERT INTO cases_fts(
          cases_fts, rowid, title, summary, error_text, signatures, status_code,
          message_type, idoc_type, partner, iflow, adapter, verified_note
        ) VALUES (
          'delete', old.rowid, old.title, old.summary, old.error_text, old.signatures, old.status_code,
          old.message_type, old.idoc_type, old.partner, old.iflow, old.adapter, old.verified_note
        );
      END;

      CREATE TRIGGER cases_au AFTER UPDATE ON cases BEGIN
        INSERT INTO cases_fts(
          cases_fts, rowid, title, summary, error_text, signatures, status_code,
          message_type, idoc_type, partner, iflow, adapter, verified_note
        ) VALUES (
          'delete', old.rowid, old.title, old.summary, old.error_text, old.signatures, old.status_code,
          old.message_type, old.idoc_type, old.partner, old.iflow, old.adapter, old.verified_note
        );
        INSERT INTO cases_fts(
          rowid, title, summary, error_text, signatures, status_code,
          message_type, idoc_type, partner, iflow, adapter, verified_note
        ) VALUES (
          new.rowid, new.title, new.summary, new.error_text, new.signatures, new.status_code,
          new.message_type, new.idoc_type, new.partner, new.iflow, new.adapter, new.verified_note
        );
      END;

      INSERT INTO cases_fts(
        rowid, title, summary, error_text, signatures, status_code,
        message_type, idoc_type, partner, iflow, adapter, verified_note
      )
      SELECT
        rowid, title, summary, error_text, signatures, status_code,
        message_type, idoc_type, partner, iflow, adapter, verified_note
      FROM cases;
    `);
  }
}

function replaceStepsAndLibrarySources(
  db: Database.Database,
  entry: LibraryEntry,
  insertStep: Database.Statement,
  insertLibrarySource: Database.Statement,
) {
  db.prepare("DELETE FROM steps WHERE case_id = ?").run(entry.id);
  entry.steps.forEach((step, position) => {
    insertStep.run(entry.id, position, step);
  });

  // Drop only library-seeded links; Investigate / attachResearch rows stay (seeded = 0).
  db.prepare("DELETE FROM sources WHERE case_id = ? AND seeded = 1").run(
    entry.id,
  );
  entry.sources.forEach((source) => {
    insertLibrarySource.run(entry.id, source.title, source.url);
  });
}

/**
 * Sync shipped community cases from `communityLibrary`.
 * When the library content hash changes, upsert every community entry so
 * deepened text reaches existing DBs. User-authored cases are never touched.
 * Preserves created_at, verified_note, research_draft, provenance, and
 * non-library source URLs (e.g. Investigate attachments) on update.
 */
function seed(db: Database.Database) {
  const hash = communityLibraryHash();
  const stored = db
    .prepare("SELECT value FROM meta WHERE key = ?")
    .get(COMMUNITY_LIBRARY_HASH_KEY) as { value: string } | undefined;
  if (stored?.value === hash) return;

  const insertCase = db.prepare(`
    INSERT INTO cases (
      id, created_at, updated_at, area, origin, provenance, source, title, summary,
      error_text, signatures, status_code, landscape_note, sort_order
    ) VALUES (
      @id, @created_at, @updated_at, @area, 'community', 'community', 'community', @title, @summary,
      @error_text, @signatures, @status_code, @landscape_note, @sort_order
    )
  `);
  const updateCase = db.prepare(`
    UPDATE cases SET
      updated_at = @updated_at,
      area = @area,
      title = @title,
      summary = @summary,
      error_text = @error_text,
      signatures = @signatures,
      status_code = @status_code,
      landscape_note = @landscape_note,
      sort_order = @sort_order
    WHERE id = @id AND origin = 'community'
  `);
  const insertStep = db.prepare(
    "INSERT INTO steps (case_id, position, body) VALUES (?, ?, ?)",
  );
  const insertLibrarySource = db.prepare(
    "INSERT INTO sources (case_id, title, url, seeded) VALUES (?, ?, ?, 1)",
  );
  const selectOrigin = db.prepare("SELECT origin FROM cases WHERE id = ?");
  const seedNow = "2026-01-01T00:00:00.000Z";
  const refreshAt = new Date().toISOString();

  const syncCommunity = db.transaction(() => {
    communityLibrary.forEach((entry, index) => {
      const existing = selectOrigin.get(entry.id) as { origin: Origin } | undefined;
      if (existing?.origin === "user") return;

      const payload = {
        id: entry.id,
        area: entry.area,
        title: entry.title,
        summary: entry.summary,
        error_text: entry.errorText,
        signatures: JSON.stringify(entry.signatures),
        status_code: entry.statusCode ?? null,
        landscape_note: entry.landscapeNote ?? null,
        sort_order: index,
      };

      if (existing?.origin === "community") {
        updateCase.run({ ...payload, updated_at: refreshAt });
        replaceStepsAndLibrarySources(db, entry, insertStep, insertLibrarySource);
        return;
      }

      insertCase.run({
        ...payload,
        created_at: seedNow,
        updated_at: seedNow,
      });
      replaceStepsAndLibrarySources(db, entry, insertStep, insertLibrarySource);
    });

    db.prepare(
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).run(COMMUNITY_LIBRARY_HASH_KEY, hash);
  });
  syncCommunity();
}

export function getDb() {
  if (!globalForDb.ledger) {
    const dir = process.env.ERROR_BOOK_DATA_DIR || path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    const db = new Database(path.join(dir, "ledger.db"));
    migrate(db);
    seed(db);
    globalForDb.ledger = db;
  }
  return globalForDb.ledger;
}

/** Re-check library hash and upsert community cases when the shipped catalog changed. */
export function syncCommunityLibrary() {
  seed(getDb());
}

export function listCases(): CaseSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM cases
       ORDER BY CASE origin WHEN 'user' THEN 0 ELSE 1 END,
                updated_at DESC,
                sort_order ASC`,
    )
    .all() as CaseRow[];
  return rows.map(mapSummary);
}

export function getCase(id: string): CaseRecord | null {
  const row = getDb().prepare("SELECT * FROM cases WHERE id = ?").get(id) as
    | CaseRow
    | undefined;
  if (!row) return null;
  const steps = getDb()
    .prepare(
      "SELECT body FROM steps WHERE case_id = ? ORDER BY position ASC",
    )
    .all(id) as { body: string }[];
  const sources = getDb()
    .prepare(
      "SELECT title, url FROM sources WHERE case_id = ? ORDER BY id ASC",
    )
    .all(id) as SourceLink[];
  return { ...mapSummary(row), steps: steps.map((step) => step.body), sources };
}

export function ftsIds(match: string): Set<string> {
  try {
    const rows = getDb()
      .prepare(
        `SELECT cases.id AS id
         FROM cases
         JOIN cases_fts ON cases.rowid = cases_fts.rowid
         WHERE cases_fts MATCH ?
         LIMIT 80`,
      )
      .all(match) as { id: string }[];
    return new Set(rows.map((row) => row.id));
  } catch {
    return new Set();
  }
}

export type NewCaseInput = {
  id: string;
  area: Area;
  source: SourceKind;
  title: string;
  summary: string;
  errorText: string;
  signatures: string[];
  statusCode: string | null;
  messageType: string | null;
  idocType: string | null;
  partner: string | null;
  iflow: string | null;
  adapter: string | null;
  steps: string[];
  sources: SourceLink[];
  provenance: Provenance;
  verifiedNote: string | null;
  researchDraft: string | null;
};

export function insertUserCase(input: NewCaseInput) {
  const now = new Date().toISOString();
  const db = getDb();
  const write = db.transaction(() => {
    db.prepare(
      `INSERT INTO cases (
        id, created_at, updated_at, area, origin, provenance, source, title, summary,
        error_text, signatures, status_code, message_type, idoc_type, partner, iflow, adapter,
        verified_note, research_draft, sort_order
      ) VALUES (
        @id, @now, @now, @area, 'user', @provenance, @source, @title, @summary,
        @errorText, @signatures, @statusCode, @messageType, @idocType, @partner, @iflow, @adapter,
        @verifiedNote, @researchDraft, 0
      )`,
    ).run({
      ...input,
      now,
      signatures: JSON.stringify(input.signatures),
    });
    const step = db.prepare(
      "INSERT INTO steps (case_id, position, body) VALUES (?, ?, ?)",
    );
    input.steps.forEach((body, position) => step.run(input.id, position, body));
    const source = db.prepare(
      "INSERT INTO sources (case_id, title, url) VALUES (?, ?, ?)",
    );
    input.sources.forEach((item) => source.run(input.id, item.title, item.url));
  });
  write();
}

export function updateUserCase(
  id: string,
  input: Omit<NewCaseInput, "id" | "sources" | "researchDraft">,
  options?: { keepResolution: boolean },
): boolean {
  const now = new Date().toISOString();
  const db = getDb();
  const keepResolution = options?.keepResolution ? 1 : 0;
  let updated = false;
  const write = db.transaction(() => {
    const result = db
      .prepare(
        `UPDATE cases SET
          updated_at = @now,
          area = @area,
          provenance = CASE WHEN @keepResolution THEN provenance ELSE @provenance END,
          source = @source,
          title = @title,
          summary = CASE WHEN @keepResolution THEN summary ELSE @summary END,
          error_text = @errorText,
          signatures = @signatures,
          status_code = @statusCode,
          message_type = @messageType,
          idoc_type = @idocType,
          partner = @partner,
          iflow = @iflow,
          adapter = @adapter,
          verified_note = CASE WHEN @keepResolution THEN verified_note ELSE @verifiedNote END
        WHERE id = @id AND origin = 'user'`,
      )
      .run({
        id,
        now,
        keepResolution,
        area: input.area,
        provenance: input.provenance,
        source: input.source,
        title: input.title,
        summary: input.summary,
        errorText: input.errorText,
        signatures: JSON.stringify(input.signatures),
        statusCode: input.statusCode,
        messageType: input.messageType,
        idocType: input.idocType,
        partner: input.partner,
        iflow: input.iflow,
        adapter: input.adapter,
        verifiedNote: input.verifiedNote,
      });
    if (result.changes !== 1) return;
    if (!keepResolution) {
      db.prepare("DELETE FROM steps WHERE case_id = ?").run(id);
      const step = db.prepare(
        "INSERT INTO steps (case_id, position, body) VALUES (?, ?, ?)",
      );
      input.steps.forEach((body, position) => step.run(id, position, body));
    }
    updated = true;
  });
  write();
  return updated;
}

export function saveVerifiedNote(id: string, note: string) {
  const now = new Date().toISOString();
  const steps = splitSteps(note);
  const recorded = steps.length > 0 ? steps : [note.trim()];
  const summary = recorded[0];
  const db = getDb();
  const write = db.transaction(() => {
    const existing = db
      .prepare("SELECT origin FROM cases WHERE id = ?")
      .get(id) as { origin: Origin } | undefined;
    if (!existing) return;
    db.prepare(
      `UPDATE cases
       SET verified_note = ?, provenance = 'verified', summary = ?, updated_at = ?
       WHERE id = ?`,
    ).run(note, summary, now, id);
    // Shipped community steps stay read-only. A landscape note is the verified summary.
    if (existing.origin === "community") return;
    db.prepare("DELETE FROM steps WHERE case_id = ?").run(id);
    const insert = db.prepare(
      "INSERT INTO steps (case_id, position, body) VALUES (?, ?, ?)",
    );
    recorded.forEach((body, position) => insert.run(id, position, body));
  });
  write();
}

export function attachResearch(
  id: string,
  draft: string,
  sources: SourceLink[],
) {
  const db = getDb();
  const now = new Date().toISOString();
  const write = db.transaction(() => {
    db.prepare(
      "UPDATE cases SET research_draft = ?, updated_at = ? WHERE id = ?",
    ).run(draft, now, id);
    const insert = db.prepare(
      `INSERT INTO sources (case_id, title, url, seeded)
       SELECT ?, ?, ?, 0
       WHERE NOT EXISTS (SELECT 1 FROM sources WHERE case_id = ? AND url = ?)`,
    );
    sources.forEach((source) => {
      insert.run(id, source.title, source.url, id, source.url);
    });
  });
  write();
}

export function counts() {
  const rows = getDb()
    .prepare(
      `SELECT
         SUM(CASE WHEN origin = 'community' AND provenance != 'verified' THEN 1 ELSE 0 END) AS community,
         SUM(CASE WHEN provenance = 'verified' THEN 1 ELSE 0 END) AS verified,
         SUM(CASE WHEN provenance = 'open' THEN 1 ELSE 0 END) AS open
       FROM cases`,
    )
    .get() as { community: number | null; verified: number | null; open: number | null };
  return {
    community: rows.community ?? 0,
    verified: rows.verified ?? 0,
    open: rows.open ?? 0,
  };
}
