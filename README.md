# Integration Error Book

A personal lookup for IDoc and SAP Integration Suite errors.

Paste a status, an exception, or the paragraph an analyst forwarded. The book checks fixes you have already confirmed, then the serious failures shipped from SAP Community threads. If nothing lines up, it searches public SAP Community and SAP Help pages and saves a draft. That draft stays unverified until you record what actually worked in your landscape.

The book does not sign in to your mailbox or your Integration Suite tenant. Copy the error out of the email or out of message monitoring and paste it here.

## Run it

```bash
npm install
npm run dev -- --port 4317 --hostname 127.0.0.1
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

Cases are stored in `data/ledger.db`. That file stays on this machine and is not committed. Set `ERROR_BOOK_DATA_DIR` to keep the file somewhere else.

On startup the app syncs the shipped community library (`src/lib/community-library.ts`) into the database. A content hash in a `meta` table detects library changes: new ids are inserted and existing community rows are updated (steps replaced; library source links refreshed) so deepened text reaches databases that already seeded an older build. User-authored cases are never overwritten. Landscape `verified_note`, `research_draft`, `provenance`, and Investigate-attached source URLs on community rows are preserved across refreshes.

## What is already in the book

IDoc: status 51, 56, 29, 30 (including Collect / destination NONE), 03 with stuck tRFC, 64 (including DIA and residual after RBDAPP01), 26 and 60, 02 including code page and EA390 into Integration Suite, 65, 66 (RBDAPP01), inbound processing stop, and the reprocess programs that do not clone the IDoc.

Integration Suite: PKIX / token-host trust, HTTPS sender 401 and service-key expiry, OAuth client credentials and Authorization Code refresh, CSRF 403, IDoc 403 into S/4, Cloud Connector host / handshake / subaccount cert, JMS capacity and EOIO head-of-line, JDBC pool and long-tx design, AS2 MDN, XI queues, size limits, principal propagation, S/4 SAML Bearer, ProcessDirect address mismatch, SapMessageId Exactly-Once, invalid IDoc SOAP namespace, empty IDoc filter, and SFTP auth / silent sender.

Each entry links to SAP Help, KBAs, or Community threads. Where a fix was specific to one landscape, the entry says so.

## Investigate

Investigate searches [SAP Community](https://community.sap.com) through public search results and [SAP Help](https://help.sap.com) through the Help search service. It keeps a handful of links and the snippet that came back with each one. SAP Notes that require an S-user are not opened. If the search does not respond, the case can still be saved.

## Sign-in

A production server asks for a passcode before it shows the book, saves a case, or runs Investigate. `npm run dev` does not, because it is meant for your own machine or a private port forward.

```bash
npm run build
ERROR_BOOK_PASSCODE='a long phrase only you know' npm start
```

- Without `ERROR_BOOK_PASSCODE`, a production server answers 503 and shows nothing, so it cannot be left open by accident.
- A device stays signed in for 180 days. Changing the passcode signs every device out.
- Five wrong passcodes from one address lock that address out for 15 minutes. The count is kept in memory, so a restart clears it.
- Only the sign-in page, the web app manifest and the icons are public.

## One address for laptop and phone

A Home Screen icon opens the address it was added from. A temporary tunnel gets a new address each time, so its icons stop working. Running the book on an always-on host gives it one address that never changes, and you add it to the Home Screen once.

`Dockerfile` and `fly.toml` are set up for [Fly.io](https://fly.io): one small machine and a 1 GB disk that holds `ledger.db`. At current Fly prices that is about $3.84 a month ($3.69 for the machine and $0.15 for the disk). Fly asks for a credit card once the free trial ends.

```bash
APP=pick-a-name-nobody-has   # becomes https://pick-a-name-nobody-has.fly.dev
fly apps create $APP
fly volumes create error_book_data --app $APP --region iad --size 1 --yes
fly secrets set ERROR_BOOK_PASSCODE='a long phrase only you know' --app $APP --stage
fly deploy --app $APP --ha=false
```

`--ha=false` keeps it to one machine, because a disk attaches to one machine. The region in `fly volumes create` has to match `primary_region` in `fly.toml`. Run the same `fly deploy` again after any change. The disk and the cases on it are kept, and phones stay signed in.

Open `https://$APP.fly.dev`, sign in, and add it to the Home Screen once. On an iPhone use Safari, Share, Add to Home Screen. On Android use the Chrome menu, Add to Home screen. Delete any older icons that were added from temporary addresses.

### Move the cases you already have

Make a clean copy of the database, upload it as `restore.db`, and restart. The container swaps it in before the app opens the file and keeps the files it replaced in `/data/replaced-<time>`.

```bash
node -e "require('better-sqlite3')('data/ledger.db').backup('backup.db').then(() => console.log('ok'))"
fly ssh sftp put backup.db /data/restore.db --app $APP
fly apps restart $APP
```

### Back it up

```bash
fly ssh console --app $APP -C "node -e \"require('/app/node_modules/better-sqlite3')('/data/ledger.db').backup('/data/backup.db').then(() => console.log('backed up'))\""
fly ssh sftp get /data/backup.db backup.db --app $APP
```

Fly also snapshots the disk every day and keeps each snapshot for 5 days. Treat that as a safety net, not as your only copy.
