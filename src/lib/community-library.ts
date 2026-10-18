import type { LibraryEntry } from "@/lib/types";

export const communityLibrary: LibraryEntry[] = [
  {
    id: "community-idoc-51",
    area: "idoc",
    statusCode: "51",
    title: "Status 51, application document not posted",
    summary:
      "Status 51 is an application rejection after the IDoc reached the posting function module. Read the long text and application log, fix the shared cause, then reprocess with BD87 or RBDMANI2 — not WE20 first.",
    errorText:
      "Status 51. Application document not posted. The IDoc was passed to the application but the posting function module returned an error. BAPI return type A or E. Field is not an input field.",
    signatures: [
      "status 51",
      "application document not posted",
      "application doc not posted",
      "field is not an input field",
      "rbdmani2",
      "type a",
      "type e",
    ],
    landscapeNote:
      "Status 51 is an application rejection. Do not start by rebuilding the partner profile unless the long text actually names the partner or process code. Confirm the inbound FM is idempotent before mass RBDMANI2 — some FMs partially update before returning 51.",
    steps: [
      "Open the IDoc in WE02 or BD87 and read the status 51 long text, then the application log (SLG1 if the FM writes one). The text names the field, master-data object, lock, or function module that rejected posting.",
      "If many IDocs share the same message class and number, treat it as one shared application cause — fix master data, customizing, or open documents once, then mass-reprocess.",
      "Check SM12 and SM13 for locks or update terminates around the posting object. Transient lock 51s are expected to clear with scheduled RBDMANI2 once locks release.",
      "Rebuild the inbound ALE chain only when the long text points at it: WE82, WE42, WE57, BD51, WE20.",
      "Reprocess the same IDoc with BD87 or program RBDMANI2. Schedule RBDMANI2 for transient lock failures with tight message-type and age filters; do not reprocess ancient hard failures every few minutes. Use WE19 only for a debug copy.",
    ],
    sources: [
      {
        title: "SAP Help – Error handling (RBDMANI2 for 51/63)",
        url: "https://help.sap.com/saphelp_aii710/helpdata/en/0b/2a6743507d11d18ee90000e8366fc2/content.htm",
      },
      {
        title: "SAP Help – Exception Handling / status 51",
        url: "https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/4b/42b79961384cb9e10000000a42189b/content.htm?no_cache=true",
      },
      {
        title: "SAP Help – Processing BAPIs (A/E → 51)",
        url: "https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/4c/fed0190b2a3d8ee10000000a42189e/content.htm?no_cache=true",
      },
      {
        title: "KBA 2338156 – RBDMANI2 not reprocessing Status 51",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2338156",
      },
      {
        title: "Resolve IDoc Errors",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/resolve-idoc-errors/m-p/2457056",
      },
    ],
  },
  {
    id: "community-idoc-56",
    area: "idoc",
    statusCode: "56",
    title: "Status 56, EDI partner profile not available",
    summary:
      "ALE could not resolve an inbound partner parameter (EDP21) for the control-record key. Match WE20 exactly — including MESCOD, MESFCT, and receiver port — then reprocess with RBDAGAI2.",
    errorText:
      "Status 56. IDoc with errors added. EDI: Partner profile not available. EDI: Partner profile inbound not available. E0337. EA602. Receiver port invalid.",
    signatures: [
      "status 56",
      "partner profile not available",
      "partner profile inbound not available",
      "idoc with errors added",
      "e0337",
      "e0332",
      "edp21",
      "ea602",
      "rbdagai2",
      "bd84",
      "mescod",
      "mesfct",
    ],
    steps: [
      "In WE02, open EDI_DC40 and copy sender partner number and type, partner function, message type, message code, message function, test flag, and receiver port.",
      "In the receiving system’s WE20, create or correct that exact partner (for ALE, type LS and the sender logical system, including case) and add an inbound parameter with the matching message key and process code. A wrong partner function or message function alone misses the profile.",
      "Verify the receiver port on the control record is a valid WE21 port — invalid RCVPOR can yield 56 with EA602.",
      "Compare the control record to a historically green IDoc of the same interface when the key looks correct but still fails.",
      "After configuration matches, reprocess with BD87 or program RBDAGAI2 (BD84). Do not create a second IDoc in WE19, and do not use RBDMANI2 (that is for application 51).",
    ],
    sources: [
      {
        title: "KBA 1776471 – Partner profile inbound not available",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/1776471",
      },
      {
        title: "KBA 3547363 – Status 56 when transferring IDocs",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3547363",
      },
      {
        title: "KBA 3253456 – Receiver port invalid EA602",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3253456",
      },
      {
        title: "SAP Help – Inbound Partner Profile",
        url: "https://help.sap.com/doc/saphelp_scm700_ehp02/7.0.2/en-US/4b/66af60dfb201bae10000000a42189b/content.htm",
      },
      {
        title: "EDI: Partner profile not available",
        url: "https://community.sap.com/t5/technology-q-a/edi-partner-profile-not-available/qaq-p/3002426",
      },
    ],
  },
  {
    id: "community-idoc-29",
    area: "idoc",
    statusCode: "29",
    title: "Status 29, outbound partner profile not found",
    summary:
      "ALE could not find an EDP13 outbound parameter for the receiver key. Match WE20, watch partner-role blanking, then reprocess with RBDAGAIN — not RSEOUT00 alone.",
    errorText:
      "Status 29. Error in ALE service. No partner profile (outbound parameter) could be found. Entry in outbound table not found. EDP13.",
    signatures: [
      "status 29",
      "no partner profile (outbound parameter)",
      "entry in outbound table not found",
      "error in ale service",
      "edp13",
      "rbdagain",
      "bd83",
      "status 31",
      "outbound parameter",
    ],
    landscapeNote:
      "Blanking the partner role is the fix only when WE20 has a role filled and the IDoc key has that field empty. Some subsequent-send paths mark the old IDoc 31 and transmit a copy — reconcile numbers before declaring success.",
    steps: [
      "Read the status long text. The key is receiver partner, partner type, partner function, message type, message code, message function, and the test flag (table EDP13).",
      "In WE20, under the receiver, add an outbound parameter whose message type, message code, and message function match, with the correct port and basic type (and extension if used).",
      "If every field matches except a partner role that the IDoc never sends, copy the outbound parameter, leave Partner role blank, save, and delete the old parameter. You cannot clear the role on the existing row.",
      "Reprocess from BD87 or program RBDAGAIN (BD83). Status 29 is not cleared by RSEOUT00; the partner row has to exist first.",
    ],
    sources: [
      {
        title: "SAP Help – Processing Technical IDoc Errors (status 29)",
        url: "https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/a9/cccb53ad377114e10000000a174cb4/content.htm?no_cache=true",
      },
      {
        title: "SAP Help – Creating an Outbound Partner Profile",
        url: "https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/4b/408cddf6951ff8e10000000a42189c/content.htm?no_cache=true",
      },
      {
        title: "IDOC error, status 29, entry in outbound table not found",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/idoc-error-status-29-entry-in-outbound-table-not-found/m-p/8754294",
      },
    ],
  },
  {
    id: "community-idoc-30",
    area: "idoc",
    statusCode: "30",
    title: "Status 30, IDoc ready for dispatch",
    summary:
      "Yellow 30 means the IDoc is valid and waiting to leave — Collect needs RSEOUT00; Transfer immediately stuck at 30 is often destination NONE / SMQS, not a bad partner profile.",
    errorText:
      "Status 30. IDoc ready for dispatch (ALE service). Receiver exists, no filters, no conversion. Collect IDocs. Destination NONE. IDOCS_OUTPUT_TO_R3.",
    signatures: [
      "status 30",
      "idoc ready for dispatch",
      "ready for dispatch (ale service)",
      "rseout00",
      "we14",
      "collect idocs",
      "destination none",
      "smqs",
      "idocs_output_to_r3",
    ],
    steps: [
      "Confirm it is status 30 and not 29 or 02. Yellow 30 means the IDoc is valid and has not been handed to the port — not an application error.",
      "In WE20 outbound options, check Collect IDocs versus Transfer IDoc immediately, and packet size.",
      "If Collect: process with BD87 or program RSEOUT00 (WE14) and schedule that job for production volumes with the right message types and date.",
      "If Transfer immediately and documents still sit in 30, check SM58 and SMQS for destination NONE (first hop via IDOCS_OUTPUT_TO_R3) and the real port destination before changing partner profiles. A batch can stay at 30 with no partner SM58 row when NONE is blocked.",
      "After status moves to 03, the port accepted the IDoc; confirming dispatch OK (12) with RBDMOIND and verifying the receiver are separate steps.",
    ],
    sources: [
      {
        title: "SAP Help – Technical errors status 30 / RSEOUT00",
        url: "https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/a9/cccb53ad377114e10000000a174cb4/content.htm?no_cache=true",
      },
      {
        title: "SAP Help – Outbound Partner Profile",
        url: "https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/4b/408cddf6951ff8e10000000a42189c/content.htm?no_cache=true",
      },
      {
        title: "tRFC processing for Transfer IDoc Immediately",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/trfc-processing-for-outbound-idocs-for-transfer-idoc-immediately/ba-p/13357748",
      },
      {
        title: "Outbound IDoc: status code 30",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/outbound-idoc-status-code-30/m-p/5733458",
      },
    ],
  },
  {
    id: "community-idoc-03-sm58",
    area: "idoc",
    statusCode: "03",
    title: "Status 03, receiver never got the IDoc",
    summary:
      "Status 03 means the sender port accepted the IDoc into tRFC — not that the receiver posted it. Clear SM58 with RSARFCEX, confirm with RBDMOIND, and branch to EA390 for XML-HTTP ports.",
    errorText:
      "Status 03. Data passed to port OK. IDoc sent to SAP system or external program. SM58 shows IDOC_INBOUND_ASYNCHRONOUS, Transaction recorded.",
    signatures: [
      "status 03",
      "data passed to port ok",
      "transaction recorded",
      "idoc_inbound_asynchronous",
      "sent not arrived",
      "rsarfcex",
      "rbdmoind",
      "bd75",
      "smqs",
      "xml-http",
      "ea390",
    ],
    steps: [
      "Ask whether the receiver already has the IDoc. If yes and you only need the sender to show dispatch OK (12), run RBDMOIND (BD75).",
      "If the receiver has nothing, open SM58 on the sender for IDOC_INBOUND_ASYNCHRONOUS (and related) entries stuck as Transaction recorded. Destination-wide piles mean a shared RFC problem, not one bad document.",
      "Execute stuck LUWs with program RSARFCEX. If they remain, register and activate the destination in SMQS, then test SM59 (destination name is case-sensitive).",
      "Check the port type in WE21. For XML-HTTP or SOAP outbound that never leaves the sender, switch to status 02 / EA390 diagnostics — do not force a classic 03→12 confirmation path on those ports.",
    ],
    sources: [
      {
        title: "SAP Help – Check the tRFC Status",
        url: "https://help.sap.com/doc/saphelp_snc700_ehp01/7.0.1/en-US/0b/2a66bc507d11d18ee90000e8366fc2/content.htm",
      },
      {
        title: "SAP Help – RBDMOIND Dispatch OK",
        url: "https://help.sap.com/doc/saphelp_snc700_ehp01/7.0.1/en-US/0b/2a66af507d11d18ee90000e8366fc2/content.htm",
      },
      {
        title: "SM58 hang with status Transaction recorded",
        url: "https://community.sap.com/t5/technology-q-a/data-load-problem-due-to-luw-in-sm58-hang-with-status-transaction-recorded/qaq-p/4004187",
      },
      {
        title: "Troubleshooting of ALE Process",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/troubleshooting-of-ale-process/ba-p/12838824",
      },
    ],
  },
  {
    id: "community-idoc-64",
    area: "idoc",
    statusCode: "64",
    title: "Status 64, ready to be transferred to the application",
    summary:
      "Status 64 is inbox waiting — not posted and not rejected. Prefer scheduled RBDAPP01 (also selects 66); sticky 64 under Trigger immediately is usually DIA / resource shortage, not a missing partner.",
    errorText:
      "Status 64. IDoc ready to be transferred to application. No resources, immed. processing not possible. No application document posted yet.",
    signatures: [
      "status 64",
      "ready to be transferred to application",
      "idoc ready to be passed to application",
      "rbdapp01",
      "bd20",
      "no resources",
      "immed. processing not possible",
      "555229",
      "1872637",
      "2038054",
    ],
    landscapeNote:
      "TEDEF BATCHJOB / TRFC-IDOC toggles from note 555229 are release- and landscape-specific — verify SP level with Basis before changing. Prefer background + RBDAPP01 for high volume.",
    steps: [
      "Status 64 is not an application error. Confirm WE20 inbound options: Trigger immediately versus Trigger by background program, and the process code.",
      "For background mode, run or schedule RBDAPP01 (BD20) with a variant that selects status 64 and 66 for the correct message types and date.",
      "For high volume, prefer background over Trigger immediately. If immediate mode is required and IDocs still stick in 64, treat it as dialog work-process / resource shortage (notes 555229 / KBA 1872637): check SM50/SM66, and SM58 → QOUT / RZ12 when free dialog WPs are scarce.",
      "Check SM37 job history, ST22 dumps during the inbound FM, and SWE2 event linkage if “immediate” never fires.",
      "Sample one IDoc in BD87: 53 versus 51 separates handoff from application rejection. If RBDAPP01 is green but IDocs remain 64, check package/parallel settings (KBA 2038054) before declaring the interface healthy.",
    ],
    sources: [
      {
        title: "SAP Help – Technical errors status 64 / RBDAPP01",
        url: "https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/a9/cccb53ad377114e10000000a174cb4/content.htm?no_cache=true",
      },
      {
        title: "SAP Help – Activated Background Processing",
        url: "https://help.sap.com/doc/saphelp_nw73ehp1/7.31.19/en-US/4d/a56ceaf5da1f69e10000000a42189b/content.htm",
      },
      {
        title: "KBA 1872637 – Delays posting status 64 (immediate)",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/1872637",
      },
      {
        title: "KBA 2038054 – Remain in 64 after RBDAPP01",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2038054",
      },
      {
        title: "Note 555229 – hang in 64 for tRFC immediate",
        url: "https://me.sap.com/notes/555229",
      },
    ],
  },
  {
    id: "community-idoc-26-60",
    area: "idoc",
    statusCode: "26",
    title: "Status 26 or 60, syntax error in the IDoc",
    summary:
      "The segment structure failed the ALE syntax check (E0078). Align WE30/WE82/WE20; prefer regenerate over “repair.” Inbound 60 may restart with RBDSYNER after the definition is fixed.",
    errorText:
      "Status 26. Error during syntax check of IDoc (outbound). Status 60. Error during syntax check of IDoc (inbound). EDI: Syntax error in IDoc (segment cannot be identified). E0078.",
    signatures: [
      "status 26",
      "status 60",
      "syntax error in idoc",
      "segment cannot be identified",
      "error during syntax check",
      "e0078",
      "rbdsyner",
      "we30",
      "we82",
      "extension",
    ],
    steps: [
      "Open the detailed status 26 or 60 record itself — the header often only points at the previous status. That record names the offending segment (E0078).",
      "In WE30, segments must appear parent before child in the defined order; a custom segment under the wrong parent produces “segment cannot be identified.”",
      "WE82 must list the message type, basic type, and extension. The same extension name must be on the WE20 parameter. WE19 syntax can pass while production WE20 still points at the basic type alone.",
      "Clearing “Cancel processing after syntax error” in WE20 only skips the check — it does not repair the structure. Prefer correcting the creating program or extension and regenerating; Help states syntactically incorrect IDocs typically cannot be repaired in place.",
      "After the definition is corrected, inbound 60 may be restarted with RBDSYNER where that program applies on your release.",
    ],
    sources: [
      {
        title: "SAP Help – Technical errors syntax 26/60",
        url: "https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/a9/cccb53ad377114e10000000a174cb4/content.htm?no_cache=true",
      },
      {
        title: "KBA 1813697 – E0078 segment cannot be identified",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/1813697",
      },
      {
        title: "KBA 1963598 – E0078 hierarchy",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/1963598",
      },
      {
        title: "Outbound IDOC status error 26",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/outbound-idoc-status-error-26/m-p/3721955",
      },
    ],
  },
  {
    id: "community-idoc-02-port",
    area: "idoc",
    statusCode: "02",
    title: "Status 02, error passing data to the port",
    summary:
      "The IDoc never successfully left via the port. Separate unreachable RFC destinations from Unicode/MDMP code-page failures (Note 647495), and branch to EA390 for SOAP/HTTP ports.",
    errorText:
      "Status 02. Error passing data to port. Could not find code page for receiving system. MDMP. Unicode.",
    signatures: [
      "status 02",
      "error passing data to port",
      "could not find code page for receiving system",
      "code page",
      "mdmp",
      "647495",
      "sm59 unicode",
    ],
    steps: [
      "In WE02, note the receiver port. In WE21, open that port and the RFC destination it uses, then Connection Test in SM59 — host, system number or path, logon language, Unicode flag.",
      "For “could not find code page for receiving system,” fix code-page settings on the Unicode tab (explicit code page or MDMP language map). Note 647495 covers Unicode ↔ non-Unicode RFC.",
      "Confirm WE20 still references the port you tested. A stale port entry is enough to keep the failure.",
      "If the long text is EA390 / SOAP HTTP, follow the Integration Suite SOAP case instead of code-page changes.",
    ],
    sources: [
      {
        title: "SAP Help – SM59 Settings for Code Pages",
        url: "https://help.sap.com/doc/saphelp_nw74/7.4.16/en-US/48/8933fd84b84e6fe10000000a421937/content.htm?no_cache=true",
      },
      {
        title: "SAP Help – Code Pages / RFC Unicode",
        url: "https://help.sap.com/doc/saphelp_snc70/7.0/en-US/22/5a981cfbaa06428abdfa32b81423d2/content.htm",
      },
      {
        title: "Note 647495 – RFC Unicode / non-Unicode",
        url: "https://me.sap.com/notes/647495",
      },
      {
        title: "Could not find code page for receiving system",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/idoc-error-could-not-find-code-page-for-receiving-system/m-p/5091623",
      },
    ],
  },
  {
    id: "community-idoc-02-ea390",
    area: "idoc",
    statusCode: "EA390",
    title: "Status 02, EA390 sending an IDoc to Integration Suite",
    summary:
      "EA390/EA391 means the SOAP IDoc HTTP send did not complete. Separate a bare SM59 connection-test 500 (often expected) from a real outbound IDoc that stays in 02 with or without an MPL.",
    errorText:
      "Status 02. Message no. EA390. The SOAP IDoc application could not be started successfully. SRT: HTTP-Code 500 Internal Server Error. Message no. EA391. No IDoc saved in target system (SOAP HTTP).",
    signatures: [
      "ea390",
      "ea391",
      "soap idoc application could not be started",
      "no idoc saved in target system",
      "srt: http-code 500",
      "xml-http",
      "soap protocol",
      "mpl",
      "anonym",
    ],
    landscapeNote:
      "Exact SSL client PSE required is tenant- and load-balancer-specific. ANONYM cleared EA390 in at least one reported trial landscape — treat it as a check, not the only cause. A connection-test HTTP 500 with a SOAP fault and MPL id is often expected when no IDoc body was sent.",
    steps: [
      "Distinguish a bare SM59 connection test (HTTP 500 with SOAP fault and an MPL id often proves TLS/auth reached the tenant) from a real outbound IDoc that stays in 02.",
      "For a real failure with no Cloud Integration message, verify WE21 is an XML-HTTP port with SOAP protocol pointing at the SM59 destination whose path is the deployed IDoc iFlow endpoint, and verify WE20 outbound uses that port.",
      "Compare the SM59 SSL client PSE to what the tenant expects. If an MPL exists, debug the iFlow (sender auth, namespace, mapping) rather than rebuilding SM59.",
      "WE20 for the Integration Suite logical system needs the outbound message type, that port, the basic type, and Transfer IDoc immediately for single-document tests.",
    ],
    sources: [
      {
        title: "SAP Help – XML-HTTP port / SOAP protocol",
        url: "https://help.sap.com/saphelp_ewm900/helpdata/en/4b/6bf4dfd1e841a8e10000000a421937/content.htm?no_cache=true",
      },
      {
        title: "KBA 3617803 – Problem with SOAP class / EA390",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3617803",
      },
      {
        title: "KBA 3626094 – EA390 HTTP 403 Forbidden",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3626094",
      },
      {
        title: "S/4HANA IDoc outbound to SAP Integration Suite",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/how-sap-s4hana-on-premise-idoc-outbound-to-sap-integration-suite-inbound/ba-p/14352165",
      },
      {
        title: "S/4HANA to CPI connection issue, status 02 EA390",
        url: "https://community.sap.com/t5/enterprise-resource-planning-q-a/s4hana-to-cpi-connection-issue/qaq-p/12580281",
      },
    ],
  },
  {
    id: "community-idoc-65",
    area: "idoc",
    statusCode: "65",
    title: "Status 65, inbound error in the ALE service",
    summary:
      "ALE failed on the inbound path after the IDoc was present, before application handoff. Fix WE20/WE42/WE57/BD51, then reprocess with RBDAGAI2 — not RBDMANI2.",
    errorText:
      "Status 65. Error in ALE service. Inbound IDoc was not passed to the application. Inbound partner profiles are incorrect.",
    signatures: [
      "status 65",
      "error in ale service",
      "inbound partner profiles are incorrect",
      "rbdagai2",
      "bd84",
    ],
    landscapeNote:
      "Public Help emphasizes 56/63 more than 65. Distinguish 56 (added with errors / profile not found at add) from 65 (ALE service error during further inbound handling) by the long text; both share the RBDAGAI2 restart path.",
    steps: [
      "Read the status 65 long text first — it usually names a partner, port, or process code rather than an application field.",
      "Recheck WE20 inbound parameters (active), the process code in WE42, the function-module assignment in WE57, and BD51 attributes.",
      "Distinguish from 56 (profile not found at add) and 63 (error passing to application).",
      "After the linkage is corrected, reprocess with BD87 or program RBDAGAI2 (BD84). Do not start with application master-data fixes unless the long text is clearly an application message (that pattern is status 51).",
    ],
    sources: [
      {
        title: "Community status code reference (65)",
        url: "https://community.sap.com/t5/technology-q-a/what-are-the-status-codes/qaq-p/3551959",
      },
      {
        title: "How to reprocess the IDoc (RBDAGAI2 set)",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/how-to-reprocess-the-idoc-in-inbound-outbound/m-p/3729340",
      },
      {
        title: "SAP Help – Technical IDoc errors",
        url: "https://help.sap.com/saphelp_SCM700_ehp02/helpdata/en/a9/cccb53ad377114e10000000a174cb4/content.htm?no_cache=true",
      },
      {
        title: "KBA 1776471 – Partner profile key",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/1776471",
      },
    ],
  },
  {
    id: "community-idoc-66",
    area: "idoc",
    statusCode: "66",
    title: "Status 66, waiting for a predecessor IDoc",
    summary:
      "Serialization is holding this IDoc until its predecessor in the object channel posts. Fix the predecessor first, then process waiting 66s with RBDAPP01 — not RBDMANI2-first.",
    errorText:
      "Status 66. IDoc is waiting for predecessor IDoc (serialization). Object channel. SERIAL.",
    signatures: [
      "status 66",
      "waiting for predecessor",
      "serialization",
      "object channel",
      "rbdapp01",
      "serial",
      "predecessor",
    ],
    landscapeNote:
      "Community threads sometimes list RBDMANI2 for 66; SAP Help serialization docs require RBDAPP01 after the predecessor posts. Prefer Help. Do not bump serialization counters without understanding gaps.",
    steps: [
      "Confirm status 66 and read serialization fields (SERIAL / object type / channel) on EDIDC.",
      "Identify the predecessor in the same object channel — often still in 51, 64, or 66. Post it, or formally set it aside with functional approval, before touching dependents.",
      "After the predecessor reaches a successful application status, process waiting IDocs with RBDAPP01 (BD20), which SAP Help documents for status 66.",
      "Avoid treating 66 as an application error, and do not start with WE19.",
    ],
    sources: [
      {
        title: "SAP Help – Serialization by Object Type (status 66 → RBDAPP01)",
        url: "https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/4a/b7bc246dbe6d8be10000000a42189c/content.htm?no_cache=true",
      },
      {
        title: "SAP Help – Activated Background Processing (RBDAPP01 selects 66)",
        url: "https://help.sap.com/doc/saphelp_nw73ehp1/7.31.19/en-US/4d/a56ceaf5da1f69e10000000a42189b/content.htm",
      },
      {
        title: "KBA 1849972 – serialization by groups sequence",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/1849972",
      },
    ],
  },
  {
    id: "community-idoc-reprocess",
    area: "idoc",
    title: "Reprocess an IDoc without cloning it",
    summary:
      "BD87 and status-specific reports update the same IDoc number. WE19 always clones. Use RBDAPP01 for 64 and 66; RBDMANI2 for 51; RBDAGAI2 for technical inbound.",
    errorText:
      "How to reprocess an inbound or outbound IDoc without creating a new IDoc number. BD87, WE19, RBDMANI2, RBDAPP01, RSEOUT00, RBDAGAI2, RBDAGAIN.",
    signatures: [
      "reprocess idoc",
      "reprocess inbound",
      "bd87",
      "we19",
      "rbdmani2",
      "rbdapp01",
      "rseout00",
      "rbdagai2",
      "rbdagain",
      "rbdsyner",
      "rbdagaie",
      "bd83",
      "bd84",
      "do not use we19",
      "same idoc number",
    ],
    steps: [
      "Use BD87 to reprocess the existing IDoc. WE19 is a test tool and always creates another IDoc number — do not use it for production recovery.",
      "Status 64 and 66: program RBDAPP01 (Help documents 66 under serialization and background selection).",
      "Status 51: program RBDMANI2. Status 56, 61, 63, or 65: program RBDAGAI2 (BD84).",
      "Status 60: program RBDSYNER after the IDoc definition is corrected. Status 69 (edited): program RBDAGAIE.",
      "Status 30: program RSEOUT00 (WE14). Outbound technical 29/02 after port or partner repair: program RBDAGAIN (BD83).",
      "For batches, fix the shared root cause and sample 1–3 IDocs before any mass job. Search for accidental WE19 clones (same business key, new DOCNUM).",
    ],
    sources: [
      {
        title: "SAP Help – Error handling / RBDMANI2",
        url: "https://help.sap.com/saphelp_aii710/helpdata/en/0b/2a6743507d11d18ee90000e8366fc2/content.htm",
      },
      {
        title: "SAP Help – Serialization → RBDAPP01 for 66",
        url: "https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/4a/b7bc246dbe6d8be10000000a42189c/content.htm?no_cache=true",
      },
      {
        title: "SAP Help – BD87 Status Monitor",
        url: "https://help.sap.com/saphelp_aii710/helpdata/en/d4/0d67e4d85511d2a6080060087832f8/content.htm?no_cache=true",
      },
      {
        title: "Reprocess of inbound IDoc",
        url: "https://community.sap.com/t5/technology-q-a/reprocess-of-inbound-idoc/qaq-p/4196306",
      },
    ],
  },
  {
    id: "community-cpi-pkix",
    area: "cpi",
    title: "PKIX path building failed",
    summary:
      "The Integration Suite runtime does not trust the server certificate chain. Import root and intermediates via Connectivity Test — including a different OAuth token host — and distinguish this from ABAP STRUST or SAP key Activate failures.",
    errorText:
      "sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target. Exception occurred while fetching OAuth Token. Reason: (certificate_unknown) PKIX path building failed. General SSLEngine problem.",
    signatures: [
      "pkix path building failed",
      "unable to find valid certification path",
      "suncertpathbuilderexception",
      "sslhandshakeexception",
      "general sslengine problem",
      "connectivity test",
      "keystore",
      "token host",
      "certificate_unknown",
      "fetching oauth token",
    ],
    steps: [
      "Run Connectivity Test → TLS against the exact host that failed (not a marketing site). First run with Valid Server Certificate Required deselected, download the chain, then import the root and issuing CA into Monitor → Keystore — the leaf alone is often insufficient.",
      "If the error appears while fetching an OAuth token, Connectivity Test the token hostname separately. Success against the API host does not cover a different token host after the IdP rotated its cert.",
      "Re-run Connectivity Test with validation enabled until green, then retry the iFlow. Redeploying Security Material alone does not fix missing trust.",
      "Check Keystore for expired highlighted entries. Do not confuse this with an expired certificate in an ABAP STRUST store, or with SAP-provisioned keystore key activation on the tenant.",
    ],
    sources: [
      {
        title: "Help – Connectivity Tests / certificate download",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63-04ccc5b8639f43e9928d36e944318b32/CLOUD/en-US/6745beb5c8b34bf0a16ebd62e45cc544.html",
      },
      {
        title: "KBA 2511866 – How to maintain the CPI Keystore",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2511866",
      },
      {
        title: "KBA 3169294 – trust warning on import",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3169294",
      },
      {
        title: "KBA 3574634 – PKIX during OAuth token fetch",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3574634",
      },
      {
        title: "PKIX path building failed, Cloud Integration",
        url: "https://community.sap.com/t5/technology-q-a/pkix-path-building-failed-cloud-integration/qaq-p/14158408",
      },
    ],
  },
  {
    id: "community-cpi-401",
    area: "cpi",
    title: "HTTP 401 on an HTTPS sender",
    summary:
      "Inbound 401 means the caller is not authorized for the runtime endpoint. On CF use a Process Integration Runtime service key with MessagingSend — and treat sudden estate-wide 401 after key rotation as a redistribution problem, not an iFlow redesign.",
    errorText:
      "HTTP 401 Unauthorized on the HTTPS sender endpoint of an integration flow. Postman returns 401 with the S-user. Service key clientsecret. tokenurl. MessagingSend.",
    signatures: [
      "401 unauthorized",
      "https sender",
      "messagingsend",
      "esbmessaging.send",
      "process integration runtime",
      "integration-flow",
      "service key",
      "role collection",
      "tokenurl",
      "clientsecret",
    ],
    steps: [
      "Stop using the cockpit S-user password against the Cloud Foundry runtime. Create a SAP Process Integration Runtime service instance (plan integration-flow), create a service key, and call with that client id and secret (or an IdP user holding MessagingSend).",
      "Assign MessagingSend via a role collection — the old ESBMessaging.send role is not assigned the Neo way on CF. Confirm the sender uses User Role authorization and that you call the deployed runtime endpoint.",
      "If callers worked yesterday and fail after a service-key delete/rotate, prove the token endpoint with the current key, then dual-key rotate: create new key → update all senders → verify → delete old key.",
      "Separate this from Certificate-to-User Mapping / subjectAndIssuers failures and from Cloud Connector handshake 401.",
    ],
    sources: [
      {
        title: "Help – Manage user roles / ESBMessaging.send",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63/CLOUD/en-US/b97b7a206c871014bc6ce3c22a1e81b1.html",
      },
      {
        title: "KBA 3592653 – Troubleshooting 401 inbound",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3592653",
      },
      {
        title: "OAuth with Client Credentials Grant for API Clients",
        url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/oauth-with-client-credentials-grant-for-api-clients",
      },
      {
        title: "401 Unauthorized error in HTTPS sender adapter",
        url: "https://community.sap.com/t5/technology-q-a/401-unauthorized-error-in-https-sender-adapter-in-sap-cpi/qaq-p/14051563",
      },
    ],
  },
  {
    id: "community-cpi-oauth",
    area: "cpi",
    title: "OAuth2 client credentials, token fetch failed",
    summary:
      "Outbound OAuth2 Client Credentials fails when the Security Material secret is wrong/rotated, when scope or content-type packaging is wrong (415), or when the token host lacks trust. Fix the alias — do not redesign every iFlow.",
    errorText:
      "Exception occurred while fetching OAuth token. HTTP 415 from the token endpoint. invalid_client. unauthorized_client. OAuth2 Client Credentials in Security Material.",
    signatures: [
      "fetching oauth token",
      "oauth2 client credentials",
      "http 415",
      "415 unsupported",
      "invalid_client",
      "unauthorized_client",
      "security material",
      "include scope",
      "application/x-www-form-urlencoded",
      "client secret",
    ],
    landscapeNote:
      "Empty scope → HTTP 415 is documented for some IdPs (including the Commissions write-up) but is not universal. Secret rotation produces 401/invalid_client across every iFlow sharing that alias.",
    steps: [
      "In Monitor → Security Material, open the OAuth2 Client Credentials artifact. Note Token Service URL, Client ID, and last deploy time. Point receivers at that alias — do not store secrets inline in the iFlow.",
      "If many iFlows failed at once after an IdP or BTP admin change, obtain the new client secret, edit the artifact (secret is required on every edit), Deploy, and prove the token URL outside CPI before changing iFlow design. Prefer create-new-key → update Material → verify → delete old key.",
      "Match Client Authentication and content type to the token endpoint. If the server requires a scope, set it — some servers return HTTP 415 when scope is empty even though the UI field looks optional.",
      "If the error is PKIX while fetching the token, import the token host certificate chain (Connectivity Test that hostname). You do not need a separate Request-Reply just to obtain a bearer token.",
    ],
    sources: [
      {
        title: "Help – Manage Security Material",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63-8b44a976aea34ec0b4a9002822297fe6/CLOUD/en-US/d01dd9e7584040338eeb00400e7f329a.html",
      },
      {
        title: "SAP Community – OAuth2 Client Credentials in OData V2",
        url: "https://community.sap.com/t5/technology-blogs-by-sap/sap-cloud-integration-oauth2-client-credentials-support-in-odata-v2-adapter/bc-p/13369998",
      },
      {
        title: "Commissions OAuth2 authentication in a CPI flow",
        url: "https://community.sap.com/t5/human-capital-management-blog-posts-by-sap/commissions-oauth2-authentication-in-cpi-flow/ba-p/13567899",
      },
      {
        title: "KBA 3336843 – OAuth not working / token 401/403",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3336843",
      },
    ],
  },
  {
    id: "community-cpi-csrf",
    area: "cpi",
    title: "403, CSRF token validation failed",
    summary:
      "A 403 CSRF failure usually means the mutating call is missing the session cookie, not only the token header. Prefer OData CSRF Protected with HTTP Session Reuse On Exchange.",
    errorText:
      "HTTP 403. CSRF token validation failed. CSRF token is invalid. /IWBEP/CM_V4H/042. /IWBEP/CM_V4H/043. x-csrf-token. csrf token is missing.",
    signatures: [
      "csrf token validation failed",
      "csrf token is invalid",
      "iwbep/cm_v4h/042",
      "iwbep/cm_v4h/043",
      "x-csrf-token",
      "csrf token is missing",
      "on exchange",
      "csrf protected",
      "sap-xsrf_",
      "set-cookie",
    ],
    steps: [
      "Prefer the OData receiver adapter with CSRF Protected for POST, PUT, PATCH, or DELETE. Set Runtime Configuration → HTTP Session Reuse to On Exchange so fetch and mutate share a session.",
      "On the HTTP receiver, fetch with x-csrf-token: Fetch on GET/HEAD to the same service and sap-client, enable On Exchange, and send Cookie as name=value pairs (sap-XSRF_ + client, and SAP_SESSIONID when present). sap-usercontext alone is not enough.",
      "Allow Cookie and x-csrf-token on the adapter request headers. Message 042 with the token present and the cookie absent is this case; 043 means the token header itself was missing.",
      "Do not “fix” mass CSRF by disabling protection on CSRF-mandatory SAP APIs. Distinguish from IDoc SOAP 403 (SICF/SRTIDOC/Cloud Connector) and from intermittent inbound missing-token notes on multi-worker tenants (KBA 3512805 — investigate).",
    ],
    sources: [
      {
        title: "SAP blog – CSRF Protected best practice",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/best-practice-for-using-csrf-protected-flag-in-cpi-odata-adapter-outbound/ba-p/13414042",
      },
      {
        title: "KBA 3101477 – X-CSRF with HTTP receiver",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3101477",
      },
      {
        title: "SAP blog – Session handling",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-how-to-configure-session-handling-in-integration-flow/ba-p/13325908",
      },
      {
        title: "CSRF token invalid, /IWBEP/CM_V4H/042",
        url: "https://community.sap.com/t5/technology-q-a/sap-cloud-integration-csrf-token-invalid-iwbep-cm-v4h-run-042/qaq-p/14499931",
      },
    ],
  },
  {
    id: "community-cpi-idoc-403",
    area: "cpi",
    title: "403 posting an IDoc into S/4 or ECC",
    summary:
      "HTTP 403 on the IDoc receiver usually means SICF/SRTIDOC/Cloud Connector path or backend roles — not CSRF. MPL fails while WE02 stays empty until the endpoint accepts traffic.",
    errorText:
      "HTTP 403 Forbidden while posting an IDoc from Cloud Integration to ERP. org.apache.cxf.transport.http.HTTPException: HTTP response 403 Forbidden. Access denied to resource. /sap/bc/srt/idoc?type=receiver.",
    signatures: [
      "403 forbidden",
      "posting idoc",
      "idoc adapter",
      "/sap/bc/srt/idoc",
      "srtidoc",
      "type=receiver",
      "access denied to resource",
    ],
    steps: [
      "On the backend, activate SICF /sap/bc/srt/idoc and run SRTIDOC so the inbound IDoc SOAP runtime is registered.",
      "In Cloud Connector, allow /sap/bc/srt/ with path and all sub-paths. A host ping is not the same as access to the IDoc URL.",
      "Adapter address uses the virtual host and port with ?sap-client= (and type=receiver where required), proxy type On-Premise, and the connector Location ID.",
      "If the 403 body says Logon Error, fix the receiver credential’s backend IDoc roles. Confirm WE02 remains empty until the endpoint works; then replay Suite messages carefully to avoid duplicates. This is not a CSRF token problem and not MessagingSend on the Suite sender.",
    ],
    sources: [
      {
        title: "KBA 2473005 – CPI → on-prem 403 via Cloud Connector",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2473005",
      },
      {
        title: "KBA 3312521 – 403 Access Policy",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3312521",
      },
      {
        title: "Help – Configure IDoc Receiver Adapter",
        url: "https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/configure-idoc-receiver-adapter",
      },
      {
        title: "Error while establishing ERP inbound connection",
        url: "https://community.sap.com/t5/technology-q-a/error-while-establishing-erp-inbound-connection/qaq-p/13790599",
      },
    ],
  },
  {
    id: "community-cpi-unknown-host",
    area: "cpi",
    title: "Unknown host, or backend status could not be determined",
    summary:
      "On-Premise UnknownHostException or “Backend status could not be determined” usually means virtual host/port or Location ID mismatch. Fix connector-host DNS when the internal hostname fails on the SCC side.",
    errorText:
      "java.net.UnknownHostException calling a virtual host. Cloud Connector destination check: Failure reason: Backend status could not be determined. Location ID.",
    signatures: [
      "unknownhostexception",
      "backend status could not be determined",
      "location id",
      "virtual host",
      "on-premise",
      "3403469",
    ],
    steps: [
      "In Cloud Connector Access Control, copy the virtual host and virtual port character for character into the adapter address. The internal hostname is not DNS-visible to the tenant.",
      "Set proxy type On-Premise. Set the same Location ID configured on that connector for the subaccount (Location ID is not a per-backend invention). Blank on both sides is also valid when unused.",
      "The connector’s own Reachable check can succeed while the destination check fails — prefer a real message run and Location ID alignment over the check button alone.",
      "If the connector log shows UnknownHostException for the internal hostname, fix DNS/spelling on the connector host (KBA 3403469) rather than changing the iFlow virtual host. Avoid mixed Location IDs across iFlows to the same virtual host (KBA 3312714).",
    ],
    sources: [
      {
        title: "KBA 3403469 – CC UnknownHostException internal host",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3403469",
      },
      {
        title: "Help – Location ID routing",
        url: "https://help.sap.com/doc/b69dae4df3b8435f9bd9c0eb9707ccb8/1810/en-US/0c356c0337de4c5d80d7047cc0c40624.html",
      },
      {
        title: "KBA 3312714 – Location ID header mismatch",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3312714",
      },
      {
        title: "How to post an IDoc to ECC from CPI",
        url: "https://community.sap.com/t5/technology-q-a/sap-cpi-how-to-post-idoc-to-ecc-using-using-cpi/qaq-p/12611428",
      },
    ],
  },
  {
    id: "community-cpi-handshake",
    area: "cpi",
    title: "Cloud Connector handshake timed out, 401, or subaccount cert expired",
    summary:
      "Handshake failures are between SCC and BTP — not iFlow sender 401. Separate firewall timeouts from handshake 401 Notes, and from subaccount certificate expiry that drops the whole On-Premise tunnel.",
    errorText:
      "Cloud Connector failed to connect. handshake timed out after 10000ms. Invalid status of handshake response: 401 Unauthorized. Received fatal alert: certificate_expired. Tunnel account://. SslHandshakeTimeoutException.",
    signatures: [
      "handshake timed out",
      "sslhandshaketimeoutexception",
      "invalid status of handshake response",
      "401 unauthorized",
      "cloud connector",
      "certificate_expired",
      "received fatal alert",
      "tunnelhandshakeexception",
      "connectivitynotification",
      "2837206",
      "2950537",
      "renew subaccount certificate",
    ],
    landscapeNote:
      "A handshake 401 or certificate_expired is not the same failure as an iFlow HTTPS sender 401. Tunnel down stops all On-Premise proxy scenarios for that subaccount while cloud-to-cloud may still be green.",
    steps: [
      "From the Cloud Connector host, verify port 443 to regional connectivitynotification, connectivitycertsigning, and connectivitytunnel endpoints. Read which connection fails in ljs_trace.log / scc_core.trc.",
      "If traces show certificate_expired or the subaccount is Disconnected with certificate alerts, Renew / Refresh Subaccount Certificate in the SCC UI with a BTP user allowed for that subaccount, Connect again, and record the new valid-to (KBA 2950537 / 3704116).",
      "For Invalid status of handshake response: 401 Unauthorized on an established subaccount, follow KBA 2837206 (often certificate/auth lifetime). For 401/417 while adding a subaccount, follow KBA 2571763 / 2971034 using the S-user password (not Universal ID) and MFA rules.",
      "Do not retune iFlow credentials for this symptom. After the tunnel is up, only then investigate backend STRUST expiry for backend TLS failures.",
    ],
    sources: [
      {
        title: "KBA 2950537 – SCC certificate expired",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2950537",
      },
      {
        title: "KBA 2837206 – handshake 401 Unauthorized",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2837206",
      },
      {
        title: "KBA 2571763 – CF subaccount auth problem",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2571763",
      },
      {
        title: "KBA 2971034 – 417 authorization problem",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2971034",
      },
      {
        title: "KBA 3704116 – refresh subaccount certificate",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3704116",
      },
      {
        title: "Cloud Connector handshake timed out after 10000ms",
        url: "https://community.sap.com/t5/technology-q-a/cloud-connector-failed-to-connect-handshake-timed-out-after-10000ms/qaq-p/12652251",
      },
    ],
  },
  {
    id: "community-cpi-soap-namespace",
    area: "cpi",
    title: "Invalid IDoc SOAP namespace",
    summary:
      "IDocSoapNamespaceInvalid means the payload is not using urn:sap-com:document:sap:idoc:soap:messages. Fix WE21 SOAP protocol and WE20 before rewriting the iFlow; distinguish from Filter XPath empties.",
    errorText:
      "IDocSoapProtocolException: [IDocSoapNamespaceInvalid]: Invalid IDoc SOAP namespace received. urn:sap-com:document:sap:idoc:soap:messages.",
    signatures: [
      "invalid idoc soap namespace",
      "idocsoapnamespaceinvalid",
      "idocsoapprotocolexception",
      "urn:sap-com:document:sap:idoc:soap:messages",
      "xml-http",
      "soap protocol",
    ],
    steps: [
      "On the IDoc sender, the payload namespace must be urn:sap-com:document:sap:idoc:soap:messages. Older plain IDoc XML namespaces are rejected before mapping.",
      "From S/4 or ECC, WE21 must be an XML-HTTP port with SOAP protocol selected, and WE20 must use that port for the message type.",
      "An SM59 connection test that returns HTTP 500 and an MPL id only shows that the HTTPS call arrived. Send a real IDoc before treating the iFlow as broken.",
      "If the outbound partner profile is missing, the SOAP content reaching Cloud Integration may not be a valid IDoc document — fix WE20 before redesigning the iFlow. Mid-flow empty bodies after Filter are a different case (namespace XPath).",
    ],
    sources: [
      {
        title: "Help – XML-HTTP SOAP protocol",
        url: "https://help.sap.com/saphelp_ewm900/helpdata/en/4b/6bf4dfd1e841a8e10000000a421937/content.htm?no_cache=true",
      },
      {
        title: "Invalid IDoc SOAP namespace on a sales quote replication",
        url: "https://community.sap.com/t5/technology-q-a/replication-of-sales-quote-from-ecc-to-c4c-via-cpi-isuue-in-cpi/qaq-p/12289427",
      },
      {
        title: "S/4HANA IDoc outbound to SAP Integration Suite",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/how-sap-s4hana-on-premise-idoc-outbound-to-sap-integration-suite-inbound/ba-p/14352165",
      },
    ],
  },
  {
    id: "community-cpi-empty-filter",
    area: "cpi",
    title: "IDoc filter or mapping sees an empty body",
    summary:
      "When the trace still shows an IDoc but Filter/mapping sees empty, the XPath is ignoring the default namespace. Declare a prefix and use it — KBA 3468705.",
    errorText:
      "Filter on an IDoc from ECC returns an empty body. ADRMAS03 xmlns urn:sap-com:document:sap:idoc:soap:messages. Namespace mapping error in SAP CPI. Empty body after filter.",
    signatures: [
      "namespace mapping",
      "empty body",
      "urn:sap-com:document:sap:idoc:soap:messages",
      "filter idoc",
      "xmlns:p3",
      "adrmas03",
      "empty body after filter",
      "3468705",
      "xpath-default-namespace",
    ],
    steps: [
      "Trace the payload before and after the Filter. If the IDoc is present before and empty after, the XPath ignored the default namespace.",
      "In the iFlow namespace mapping, declare a prefix such as xmlns:p3=urn:sap-com:document:sap:idoc:soap:messages and point the Filter at a prefixed path (for ADRMAS03: /p3:ADRMAS03/p3:IDOC). Use the message name you actually receive.",
      "An unprefixed XPath matches nothing. For XSLT, set xpath-default-namespace to the same URN (XSLT 2.0).",
      "Fix the path before raising maximums or replay counts. This is not IDocSoapNamespaceInvalid (protocol reject at the edge).",
    ],
    sources: [
      {
        title: "KBA 3468705 – Filter with namespaces",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3468705",
      },
      {
        title: "Namespace mapping error in SAP CPI",
        url: "https://community.sap.com/t5/technology-q-a/namespace-mapping-error-in-sap-cpi/qaq-p/12605981",
      },
      {
        title: "XSLT xpath-default-namespace",
        url: "https://community.sap.com/t5/technology-q-a/integration-suite-no-values-coming-out-of-xslt-mapping/qaq-p/12465775",
      },
    ],
  },
  {
    id: "community-cpi-sftp-auth",
    area: "cpi",
    title: "SFTP Auth fail",
    summary:
      "JSch Auth fail means the SSH server rejected the credentials presented. Align known_hosts, key alias, and authorized_keys with Connectivity Test SSH; mass simultaneous fails may be LOD-HCI-PI-RT.",
    errorText:
      "com.jcraft.jsch.JSchException: Auth fail. SSH_MSG_DISCONNECT. SFTP receiver or sender public key authentication failed.",
    signatures: [
      "jsch exception",
      "auth fail",
      "ssh_msg_disconnect",
      "sftp",
      "known_hosts",
      "authorized_keys",
      "3126457",
      "lod-hci-pi-rt",
    ],
    landscapeNote:
      "Whether id_rsa in the alias string is still a defect on current runtimes is uncertain — keep short-alias recreation as an optional check only. Uppercase-only aliases have also failed deployment on some tenants.",
    steps: [
      "Deploy a correct known_hosts entry (Connectivity Test → SSH → Authentication None → Copy Host Key). Retest with Public Key using the same host, user, and private-key alias the adapter uses, and confirm directory access.",
      "Ensure the server’s authorized_keys holds the public half of that exact key pair. A test that uses a different alias looks healthy while the iFlow fails.",
      "If the connectivity test lists the directory but the iFlow still throws Auth fail, realign the adapter alias with the keystore entry (some tenants required recreating the key under a short alias — treat as a check, not dogma).",
      "When every SFTP iFlow breaks at once without server changes, open an incident on LOD-HCI-PI-RT.",
    ],
    sources: [
      {
        title: "Help – Connectivity Tests SSH",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63/CLOUD/en-US/b984f02f6c871014bc6ce3c22a1e81b1.html",
      },
      {
        title: "KBA 3126457 – Auth Fail public key",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3126457",
      },
      {
        title: "KBA 2700759 – get host key",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2700759",
      },
      {
        title: "KBA 2521381 – creating known_hosts",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2521381",
      },
      {
        title: "Cloud Platform Integration SFTP Auth fail",
        url: "https://community.sap.com/t5/technology-q-a/cloud-platform-integration-sftp-strange-error/qaq-p/12423674",
      },
    ],
  },
  {
    id: "community-cpi-sftp-silent",
    area: "cpi",
    title: "SFTP sender deploys and never creates a message",
    summary:
      "A started SFTP sender that finds no matching file writes nothing to message monitoring. Check case-sensitive paths and the idempotent repository (~90 days) before treating the iFlow as down.",
    errorText:
      "SFTP sender adapter is deployed and scheduled. Manage Integration Content shows the iFlow. Monitor Message Processing stays empty. Keep File and Mark as Processed in Idempotent Repository.",
    signatures: [
      "sftp sender",
      "not reading the files",
      "does not execute",
      "idempotent repository",
      "no message processing",
      "last polling time",
      "keep file and mark as processed",
    ],
    steps: [
      "Confirm Manage Integration Content shows the artifact Started and note last poll time. A successful poll with no matching file creates no MPL.",
      "Compare directory and filename (case-sensitive) to the server; wildcards only match names that fit.",
      "For testing, disable Keep File and Mark as Processed in Idempotent Repository or rename the file. With the repository on, a previously seen name will not be picked again (default retention ~90 days; deletion is via the Idempotent Repository API).",
      "Raise maximum messages per poll only after a single renamed test file is consumed. Confirm Connectivity Test SSH + directory access with the same credentials.",
    ],
    sources: [
      {
        title: "Configure the SFTP sender adapter (idempotent repo)",
        url: "https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ci/Development/configure-the-sftp-sender-adapter-2de9ee5.md",
      },
      {
        title: "SFTP sender adapter is not reading the files",
        url: "https://community.sap.com/t5/technology-q-a/sftp-sender-adapter-is-not-reading-the-files-and-iflow-does-not-execute/qaq-p/12663972",
      },
      {
        title: "api.sap.com MessageProcessingLogs Idempotent Repository",
        url: "https://api.sap.com/api/MessageProcessingLogs/resource/Idempotent_Repository",
      },
      {
        title: "KBA 3296056 – post-processing issues",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3296056",
      },
    ],
  },

  // --- Net-new: Suite systemic outages ---
  {
    id: "community-cpi-oauth-auth-code",
    area: "cpi",
    title: "OAuth2 Authorization Code — refresh token invalid_grant",
    summary:
      "Authorization Code Security Material stores a refresh token after Authorize. When it expires or is revoked, every adapter on that alias fails until an admin re-Authorizes — not a Client Credentials redesign.",
    errorText:
      "Access token request via refresh_token grant type for OAuth2 Authorization Code credential failed after 5 retries. invalid_grant. Invalid refresh token. OAuth2 Authorization Code Credential does not contain a refresh token. The Provider Generic did not return a refresh token.",
    signatures: [
      "invalid_grant",
      "invalid refresh token",
      "failed after 5 retries",
      "oauth2 authorization code",
      "does not contain a refresh token",
      "refresh_token",
      "provider generic did not return a refresh token",
    ],
    landscapeNote:
      "On Cloud Foundry, prefer a non-expiring refresh token from the IdP. Neo vs CF refresh-token expiry field behavior differs — verify on your environment. Full KBA resolution text may be S-user gated.",
    steps: [
      "Confirm the credential type is OAuth2 Authorization Code (not Client Credentials). Open Security Material and check Authorize status / last authorization.",
      "Match the MPL for refresh_token, invalid_grant, or “does not contain a refresh token.”",
      "Select the artifact → Authorize again (interactive login) so a new refresh token is stored. Prefer configuring the IdP for a non-expiring (or very long) refresh token on CF.",
      "If the provider cannot issue durable refresh tokens, calendarize re-Authorize before expiry, or switch grant type where the API allows. Do not rebuild iFlows for this symptom.",
    ],
    sources: [
      {
        title: "KBA 3361116 – refresh_token grant failed after 5 retries",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3361116",
      },
      {
        title: "KBA 3246152 – does not contain a refresh token",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3246152",
      },
      {
        title: "Help – Deploying OAuth2 Client Authorization Code (Generic)",
        url: "https://help.sap.com/docs/cloud-integration/sap-cloud-integration/deploying-oauth2-client-authorization-code-with-generic-provider",
      },
      {
        title: "Community – Provider Generic did not return a refresh token",
        url: "https://community.sap.com/t5/technology-q-a/sap-cpi-oauth2-authorization-code-generic-the-provider-generic-did-not/qaq-p/13644058",
      },
    ],
  },
  {
    id: "community-cpi-keystore-expired",
    area: "cpi",
    title: "Keystore certificate or key pair expired",
    summary:
      "Tenant-owned keystore entries expire silently until ValidNotAfter. Every adapter using that alias fails until you renew the chain and retest Connectivity Test with client certificate.",
    errorText:
      "Keystore Monitor expired key or certificate highlighted. ValidNotAfter. Authenticate with Client Certificate failed. Outbound mTLS / signing alias expired.",
    signatures: [
      "keystore",
      "expired",
      "validnotafter",
      "authenticate with client certificate",
      "keystore monitor",
      "certificate expired",
    ],
    steps: [
      "Open Monitor → Keystore, filter by expiry, and note aliases used by failing receivers (client-cert outbound, decrypt/verify).",
      "Generate or renew the key pair with a complete chain; upload under the expected alias (or update adapters to the new alias).",
      "Retest Connectivity Test TLS with Authenticate with Client Certificate and that alias. Update receiver trust if the issuing CA changed.",
      "Add expiry monitoring via Keystore OData API, Alert Notification, or Cloud ALM — there is no universal built-in email for every landscape.",
    ],
    sources: [
      {
        title: "Keystore Monitor (SAP blog)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-keystore-monitor-now-available-for-tenant-administrator/ba-p/13311600",
      },
      {
        title: "KBA 2683479 – keystore expiry alerting",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2683479",
      },
      {
        title: "KBA 2511866 – maintain the CPI Keystore",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2511866",
      },
      {
        title: "Security Content API — Keystore_Entry",
        url: "https://api.sap.com/api/SecurityContent/resource/Keystore_Entry",
      },
    ],
  },
  {
    id: "community-cpi-inbound-client-cert",
    area: "cpi",
    title: "Inbound client certificate expired or subject/issuer mismatch",
    summary:
      "Inbound client-cert auth fails when the sender cert expired or no longer matches Certificate-to-User Mapping / subjectAndIssuers. Distinct from MessagingSend service-key 401.",
    errorText:
      "Unauthorized. Subject and issuer is not contained in the accepted subjectAndIssuers list of the integration flow. Certificate-to-User Mapping ValidUntil. OpenSSL verify result code: 26. Inbound HTTPS 401/403 with client certificate.",
    signatures: [
      "subjectandissuers",
      "certificate-to-user",
      "client certificate",
      "openssl verify result code: 26",
      "inbound 401",
      "inbound 403",
      "validuntil",
    ],
    landscapeNote:
      "Neo uses Certificate-to-User Mapping monitors; CF uses service-key / iFlow certificate configuration paths. Edge rejection may show no MPL — landscape-dependent.",
    steps: [
      "Confirm the sender still presents a cert and whether CN/issuer changed after renewal.",
      "Neo: check Certificate-to-User Mapping ValidUntil and mapped user/role. CF: align service key / iFlow accepted certificate list with what the load balancer presents.",
      "Replace mapping or credential material with the renewed cert. If subject/issuer changed, update the accepted list and redeploy as required (KBA 3538749).",
      "Ensure the renewed cert includes Client Authentication EKU (KBA 3682752). Prefer Certificate-to-User Mapping over hard-coding certs in each iFlow so one update restores many flows.",
    ],
    sources: [
      {
        title: "KBA 3538749 – subjectAndIssuers not accepted",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3538749",
      },
      {
        title: "KBA 3682752 – Client Auth EKU / OpenSSL 26",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3682752",
      },
      {
        title: "Automated notification for client certificates reaching expiry",
        url: "https://community.sap.com/t5/technology-blogs-by-sap/cloud-integration-automated-notification-for-client-certificates-reaching/bc-p/13418526",
      },
      {
        title: "HTTP inbound with client certificates (SAP)",
        url: "https://community.sap.com/t5/integration-blog-posts/cloud-integration-how-to-setup-secure-http-inbound-connection-with-client/ba-p/13336237",
      },
    ],
  },

  // --- Net-new: P0 high-impact Suite ---
  {
    id: "community-cpi-jms-exhausted",
    area: "cpi",
    title: "JMS resources exhausted",
    summary:
      "Finite tenant JMS quotas. One flooded or orphaned queue can starve all JMS/AS2/XI async traffic. Drain unused queues before new deploys.",
    errorText:
      "Message Queues: JMS Resources Critical or Exhausted. Capacity near 100%. Orphan queues. New JMS/AS2/XI deploy fails at queue limit. Async estate stalls.",
    signatures: [
      "jms resources",
      "jms exhausted",
      "jms critical",
      "message queues",
      "orphan queue",
      "queue limit",
    ],
    steps: [
      "Open Message Queues / Queue Monitor → Details. Identify queues with no consumer and queues near size limits.",
      "Fix or redeploy the consumer iFlow; drain or delete orphan queues only with owner approval.",
      "Set per-queue size limits and Alert Notification before the next peak. Delete unused queues before deploying new JMS/AS2/XI scenarios.",
      "Treat this as a tenant capacity outage, not a single-payload mapping bug.",
    ],
    sources: [
      {
        title: "Cloud Integration – JMS Resource and Size Limits (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-jms-resource-and-size-limits/ba-p/13322814",
      },
      {
        title: "Help – Message Queues",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63/CLOUD/en-US/b97d9d336c871014bc6ce3c22a1e81b1.html",
      },
      {
        title: "Cloud Integration – checks in JMS Message Queue Monitor (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-checks-in-jms-message-queue-monitor/ba-p/13347071",
      },
    ],
  },
  {
    id: "community-cpi-jdbc-pool",
    area: "cpi",
    title: "Internal JDBC connection pool exhausted",
    summary:
      "The shared tenant DB pool (often default 8) is held by concurrent persistency or long JDBC Required transactions. Cascades across DataStore/Aggregator iFlows.",
    errorText:
      "Timeout waiting for idle object. CannotGetJdbcConnectionException. Database connection pool RUNTIME is exhausted. DataStore/Aggregator failures. MPL Abandoned.",
    signatures: [
      "timeout waiting for idle object",
      "cannotgetjdbcconnectionexception",
      "database connection pool runtime is exhausted",
      "jdbc pool",
      "datastore",
      "abandoned",
    ],
    steps: [
      "Map which iFlows use DataStore, Aggregator, or JDBC Required around the outage window. Look for long-held transactions and concurrent timers.",
      "Shorten JDBC transaction scope, stagger timers, and follow Help connection-control / performance guidance for data store usage.",
      "Retry after load drops. Escalate with KBA 2492017 / component BC-CP-IS-OPS only after redesign — pool size increases are landscape-controlled.",
      "Do not treat every Abandoned MPL as a mapping bug when many persistency flows fail together.",
    ],
    sources: [
      {
        title: "Q&A citing KBA 2492017 – DB connection pool",
        url: "https://community.sap.com/t5/technology-q-a/sci-sap-cloud-integration-db-connection-always-failed-when-try-to-call-db/qaq-p/12562015",
      },
      {
        title: "Transaction handling in integration flow (SAP)",
        url: "https://community.sap.com/t5/technology-blogs-by-sap/cloud-integration-how-to-configure-transaction-handling-in-integration-flow/ba-p/13332565",
      },
      {
        title: "Help – performance / data store",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63/CLOUD/en-US/b98a7caa6c871014bc6ce3c22a1e81b1.html",
      },
    ],
  },
  {
    id: "community-cpi-sap-keystore-activate",
    area: "cpi",
    title: "SAP-owned keystore key Activate / expiry",
    summary:
      "SAP-provisioned keys are time-bounded. Uncoordinated Activate or expiry breaks client-cert inbound tenant-wide — distinct from missing root in the CPI trust store (PKIX).",
    errorText:
      "Keystore New SAP Keys. Activate SAP Keys. sap_cloudintegrationcertificate invalid. Mass inbound client-cert failures after Activate.",
    signatures: [
      "activate sap keys",
      "new sap keys",
      "sap_cloudintegrationcertificate",
      "sap-owned key",
      "keystore activate",
    ],
    steps: [
      "Inventory backends and partners that trust the current SAP-presented certificate before Activate.",
      "Import the new certificate and update mappings on the partner side before Activate when the procedure requires it.",
      "Activate in Keystore Monitor, restart connection-caching iFlows if needed, and keep Key History for revert.",
      "Calendarize rotations with BASIS/security. Do not treat this as a PKIX import-root problem on the outbound trust store.",
    ],
    sources: [
      {
        title: "Activate SAP Keys in Keystore Monitor (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-activate-sap-keys-in-keystore-monitor/ba-p/13311004",
      },
      {
        title: "Client certificate authentication in Cloud Integration (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/client-certificate-authentication-in-sap-cloud-integration-configuration/ba-p/14058978",
      },
      {
        title: "Help – Managing Keystore Entries",
        url: "https://help.sap.com/docs/cloud-integration/sap-cloud-integration/managing-keystore-entries",
      },
    ],
  },
  {
    id: "community-cpi-abap-peer-cert-expired",
    area: "cpi",
    title: "ABAP→CPI peer certificate expired (SSSLERR_PEER_CERT_EXPIRED)",
    summary:
      "ABAP trust holds an expired leaf or intermediate for the CPI runtime host. Opposite of CPI PKIX outbound, and distinct from SCC↔BTP handshake failures.",
    errorText:
      "SMICM/STRUST: SSSLERR_PEER_CERT_EXPIRED. SSL handshake failed connecting from ECC/S/4 to CPI. All HTTPS to CPI runtime fail.",
    signatures: [
      "ssslerr_peer_cert_expired",
      "peer cert expired",
      "strust",
      "smicm",
      "ssl handshake failed",
    ],
    steps: [
      "Export the current CPI runtime certificate chain and compare to STRUST entries used by the HTTPS destination.",
      "Clean expired leaf/intermediate entries; import the current chain; soft-restart ICM as required by your Basis procedure.",
      "Calendarize cert rotations with BASIS together with CPI runtime renewals.",
      "Do not chase Cloud Connector Location ID or CPI keystore Activate for this ABAP-side trust symptom.",
    ],
    sources: [
      {
        title: "SSSLERR_PEER_CERT_EXPIRED – ECC to CPI",
        url: "https://community.sap.com/t5/technology-q-a/ssl-handshake-failed-ssslerr-peer-cert-expired-connect-from-ecc-to-cpi/qaq-p/12156431",
      },
      {
        title: "Help – validate server certificate (Connectivity Tests)",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63-04ccc5b8639f43e9928d36e944318b32/CLOUD/en-US/6745beb5c8b34bf0a16ebd62e45cc544.html",
      },
    ],
  },
  {
    id: "community-cpi-jms-oom-dlq",
    area: "cpi",
    title: "Worker OOM → JMS dead-letter Blocked",
    summary:
      "A memory-hostile payload crashes the worker on an async JMS path. Without DLQ the same message is polled forever; with DLQ the queue shows Blocked after node crashes.",
    errorText:
      "OutOfMemoryError. Worker restart loops. Queue Blocked after node crashes. Message Locks linger. Dead letter handling JMS adapter.",
    signatures: [
      "outofmemoryerror",
      "jms blocked",
      "dead letter",
      "dlq",
      "message locks",
      "worker restart",
    ],
    steps: [
      "Confirm the JMS sender has dead-letter handling enabled. Locate the Blocked message and its MPL.",
      "Redesign for large payloads (split, stream, size guards) before retrying from DLQ — Retry alone will re-crash the worker.",
      "Set inbound size limits so unbounded messages cannot take down the node.",
      "After the design fix, Retry from the dead-letter queue with owner approval.",
    ],
    sources: [
      {
        title: "Configure dead letter handling in JMS adapter (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-configure-dead-letter-handling-in-jms-adapter/ba-p/13325734",
      },
      {
        title: "How to guard against huge messages (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/how-to-guard-against-huge-messages/ba-p/13333138",
      },
    ],
  },
  {
    id: "community-cpi-eoio-hol",
    area: "cpi",
    title: "Exclusive JMS EOIO head-of-line block",
    summary:
      "Exclusive EOIO queues serialize consumption at concurrency 1. One Failed or stuck head freezes the entire ordered stream until that message is fixed or moved.",
    errorText:
      "Exclusive queue. Exactly Once In Order. Concurrency 1. One Failed or stuck head. Entire ordered stream frozen.",
    signatures: [
      "eoio",
      "exactly once in order",
      "exclusive queue",
      "head-of-line",
      "concurrency 1",
    ],
    steps: [
      "Confirm EOIO is actually required for the business process. Open the head message MPL and fix the root cause.",
      "Retry or move the poison head with owner approval so successors can proceed.",
      "When order is optional, prefer non-exclusive queues plus Idempotent Process Call instead of exclusive EOIO.",
      "Watch JMS resource usage — a blocked exclusive queue still consumes quota.",
    ],
    sources: [
      {
        title: "Ensuring Exactly Once In Order QoS in Cloud Integration",
        url: "https://community.sap.com/t5/integration-blog-posts/ensuring-exactly-once-in-order-quality-of-service-in-cloud-integration/ba-p/14180026",
      },
      {
        title: "JMS Resource and Size Limits (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-jms-resource-and-size-limits/ba-p/13322814",
      },
    ],
  },

  // --- Net-new: P1 high blast ---
  {
    id: "community-cpi-xi-queue",
    area: "cpi",
    title: "XI adapter queue Failed, Blocked, or Overdue",
    summary:
      "XI EO temporary storage retaining after SCC/URL/client misconfig burns JMS quota with infinite retry. Fix the XI endpoint, then Retry or delete with owner OK.",
    errorText:
      "Queues XI... Waiting Failed Blocked Overdue. MPL Retry forever. XI sender or receiver adapter.",
    signatures: [
      "xi queue",
      "xi adapter",
      "blocked",
      "overdue",
      "xi sender",
      "xi receiver",
    ],
    steps: [
      "Open the XI queue entry → linked MPL. Fix XI URL, client, path, and Cloud Connector routing before mass Retry.",
      "Use an explicit retry/alert exception subprocess so failures do not retry forever into JMS exhaustion.",
      "Retry or delete retained messages only with owner approval after the endpoint works.",
      "Reclaim unused XI queues — they count against the same JMS resource pool.",
    ],
    sources: [
      {
        title: "Configuring scenario using the XI sender adapter (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-configuring-scenario-using-the-xi-sender-adapter/ba-p/13350089",
      },
      {
        title: "Configuring scenario using the XI receiver adapter (SAP)",
        url: "https://community.sap.com/t5/integration-blog-posts/cloud-integration-configuring-scenario-using-the-xi-receiver-adapter/ba-p/13358288",
      },
      {
        title: "Explicit retry in exception sub-process for XI (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/cloud-integration-configuring-explicit-retry-in-exception-sub-process-for/ba-p/13352685",
      },
    ],
  },
  {
    id: "community-cpi-as2-mdn",
    area: "cpi",
    title: "AS2 MDN authentication-failed / partner crypto",
    summary:
      "Wrong sign/encrypt/MDN-verify roles or Partner Directory aliases stop a whole B2B partner channel. Fix crypto roles and CA-signed certs — Note 2801396 for self-signed rejection.",
    errorText:
      "MDN Disposition-modifier-extension is error: authentication-failed. ps:ASPartnerId. AS2 partner crypto. Self-signed certificate rejected.",
    signatures: [
      "mdn authentication-failed",
      "disposition-modifier-extension",
      "as2",
      "aspartnerid",
      "2801396",
    ],
    steps: [
      "Separate signing, encryption, and MDN-verify certificate roles for the partner. Confirm Partner Directory alias syntax (ps:ASPartnerId:…).",
      "Prefer CA-signed certificates; self-signed partners are commonly rejected (Note 2801396).",
      "Validate with Mendelson or equivalent lab against Help AS2 sender/receiver configuration before production Retry.",
      "One wrong partner crypto setting strands the whole partner channel — treat as systemic for that trading partner.",
    ],
    sources: [
      {
        title: "MDN authentication-failed AS2",
        url: "https://community.sap.com/t5/technology-q-a/mdn-disposition-modifier-extension-is-error-mdn-authentication-failed-as2/qaq-p/12261137",
      },
      {
        title: "AS2 Partner ID certificate syntax",
        url: "https://community.sap.com/t5/technology-q-a/how-to-use-partner-id-resolution-source-quot-as2-partner-id-header-quot-in/qaq-p/12801100",
      },
      {
        title: "Help – Configure AS2 Sender Adapter",
        url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/configure-as2-sender-adapter",
      },
    ],
  },
  {
    id: "community-cpi-size-limit",
    area: "cpi",
    title: "SizeLimitExceededException / HTTP 413",
    summary:
      "The sender exceeded adapter size guards (SOAP/IDoc/SAP RM defaults often 40–100 MB). Raise only with a memory plan — silent unlimited feeds OOM.",
    errorText:
      "HTTP 413. com.sap.esb.size.limiter.SizeLimitExceededException. Payload too large for SOAP/IDoc/SAP RM adapter.",
    signatures: [
      "sizelimitexceededexception",
      "http 413",
      "413",
      "size limiter",
      "payload too large",
    ],
    steps: [
      "Read MPL sizes and which adapter rejected the payload. Confirm configured limits versus actual body size.",
      "Prefer split, page, or stream designs over raising limits. If you raise, plan worker memory (Note 3262232 family).",
      "Never set silent unlimited in production — that feeds worker OOM and JMS Blocked patterns.",
      "Align partner SLAs with the enforced size before Retry storms.",
    ],
    sources: [
      {
        title: "How to guard against huge messages (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/how-to-guard-against-huge-messages/ba-p/13333138",
      },
      {
        title: "Help – large messages",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63/CLOUD/en-US/b98b57106c871014bc6ce3c22a1e81b1.html",
      },
    ],
  },
  {
    id: "community-cpi-principal-propagation",
    area: "cpi",
    title: "Principal propagation → backend 401",
    summary:
      "SCC accepted the call but the backend rejected the propagated identity. Distinct from Location ID / UnknownHost / SCC↔BTP handshake failures.",
    errorText:
      "Destination PrincipalPropagation. Cloud Connector Principal Type None. Backend 401 while SCC accepted certificate. CERTRULE ambiguous email.",
    signatures: [
      "principal propagation",
      "principalpropagation",
      "principal type none",
      "certrule",
      "backend 401",
    ],
    steps: [
      "Sync SCC ↔ IdP trust. Set Cloud Connector Principal Type to X.509 (not None) when using certificate-based propagation.",
      "Destination Authentication must be PrincipalPropagation. Align STRUST and unique CERTRULE mappings — ambiguous email rules produce 401.",
      "Soft-restart ICM after CERTRULE changes as required by Basis.",
      "Do not retune virtual host / Location ID for this symptom when the connector already accepted the TLS call.",
    ],
    sources: [
      {
        title: "401 Unauthorized from S/4HANA on-premise via SCC",
        url: "https://community.sap.com/t5/technology-q-a/401-unauthorized-error-return-from-s-4hana-on-premise-service/qaq-p/12642716",
      },
      {
        title: "Principal propagation in Integration Suite (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/principal-propagation-in-sap-integration-suite-from-external-system-to-an/ba-p/13543111",
      },
      {
        title: "CERTRULE ambiguity with principal propagation",
        url: "https://community.sap.com/t5/technology-q-a/cap-node-js-use-of-principal-propagation-and-csrf-to-access-on-premise-s-4/qaq-p/12774228",
      },
    ],
  },
  {
    id: "community-cpi-s4-saml-bearer",
    area: "cpi",
    title: "S/4 Cloud communication arrangement / OAuth2 SAML Bearer",
    summary:
      "Public Cloud inbound needs an Active communication arrangement plus OAuth2 SAML Bearer trust — a different grant from client-credentials Security Material.",
    errorText:
      "Mass 401/403 from S/4 Cloud APIs. Communication arrangement not Active. OAuth 2.0 Details. OAuth2 SAML Bearer Assertion. SAP_COM.",
    signatures: [
      "oauth2 saml bearer",
      "communication arrangement",
      "sap_com",
      "s/4hana cloud",
      "oauth 2.0 details",
    ],
    steps: [
      "Confirm the relevant SAP_COM_* communication arrangement is Active in S/4 Cloud.",
      "In the Communication System, configure OAuth IdP material and copy OAuth 2.0 Details into Cloud Integration Security Material for OAuth2 SAML Bearer Assertion.",
      "Point the receiver at OAuth2 SAML Bearer — not client credentials — for that API family.",
      "For mutating OData calls, still apply CSRF session reuse (see CSRF case). Do not merge this with inbound MessagingSend 401.",
    ],
    sources: [
      {
        title: "Set Up Authentication for SAP S/4HANA Cloud Extensions (Help PDF)",
        url: "https://help.sap.com/doc/6ce62b6bdda340ffbeae3f138c3cb71b/SHIP/en-US/Set_Up_Authentication_for_SAP_S4HANA_Cloud_Extensions.pdf",
      },
      {
        title: "Principal propagation to S/4HANA Cloud (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/how-to-set-up-principal-propagation-in-sap-integration-suite-to-sap-s-4hana/ba-p/13522965",
      },
      {
        title: "OAuth between Integration Suite and S/4",
        url: "https://community.sap.com/t5/technology-q-a/how-to-configure-oauth-2-0-authentication-between-sap-integration-suite-cpi/qaq-p/14425039",
      },
    ],
  },
  {
    id: "community-cpi-idoc-eo-sapmessageid",
    area: "cpi",
    title: "IDoc/XI Exactly-Once duplicates — sticky SapMessageId",
    summary:
      "CI IDoc/XI receivers mint a new ID when SapMessageId is absent, so retries create duplicate business documents. Set a stable ID before the receiver.",
    errorText:
      "Retries create duplicate business documents. SapMessageId empty. New ARCKEY each retry. Exactly Once IDoc XI receiver.",
    signatures: [
      "sapmessageid",
      "exactly once",
      "arckey",
      "duplicate idoc",
      "idoc receiver handles duplicates",
    ],
    steps: [
      "Before the IDoc or XI receiver, set SapMessageId from a stable header or payload key that survives Retry.",
      "Follow Exactly-Once design guidelines for IDoc and XI receivers; confirm backend idempotency expectations.",
      "For non-IDoc paths, use Idempotent Process Call when EO semantics are required without a sticky SapMessageId.",
      "Do not mass-retry historical MPLs until the stable ID is in place — you will multiply duplicates.",
    ],
    sources: [
      {
        title: "Exactly Once setup for IDoc and XI receivers (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/exactly-once-setup-for-idoc-and-xi-receivers/ba-p/13573863",
      },
      {
        title: "Help – IDoc Receiver Handles Duplicates",
        url: "https://help.sap.com/docs/cloud-integration/sap-cloud-integration/idoc-receiver-handles-duplicates-based-on-unique-id-in-payload",
      },
      {
        title: "Idempotent Process Call (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/step-by-step-for-implementing-idempotent-process-call-sap-cloud-integration/ba-p/13543161",
      },
    ],
  },

  // --- Net-new: IDoc batch patterns ---
  {
    id: "community-idoc-inbound-stop",
    area: "idoc",
    statusCode: "64",
    title: "Inbound processing stop across message types",
    summary:
      "Arrival continues but nothing posts for hours across multiple message types — auth-failed auto RBDAPP01 jobs, ST22 dump loops, or inactive SWE2 linkage. Engine dead, not one bad document.",
    errorText:
      "Multi-message-type status 64 backlog. Auto RBDAPP01 jobs under PI RFC user fail authorization. ST22 dumps in inbound FM. SWE2 event linkage inactive.",
    signatures: [
      "inbound processing stop",
      "rbdapp01 authorization",
      "3525196",
      "swe2",
      "st22 inbound",
      "auto job rbdapp01",
      "multi-message-type 64",
    ],
    landscapeNote:
      "Do not deregister qRFC or change TEDEF in production without Basis change control. Note 555229 / BATCHJOB behavior is release-specific.",
    steps: [
      "In BD87, check whether all inbound message types are stuck or only one interface. Cross-type stop points at shared runtime, not one partner profile.",
      "SM37: RBDAPP01 and auto jobs named like IDoc numbers — look for authorization failures (KBA 3525196). Restore job user authorizations and scheduled variants.",
      "ST22 / SM21 around the first stuck timestamp; SM12 for mass locks on EDIDC or application objects.",
      "SWE2 / event linkage for IDoc inbound if immediate processing never fires. Fix the dump or linkage root cause, then clear backlog with controlled package size — not WE19.",
    ],
    sources: [
      {
        title: "KBA 3525196 – IDoc stuck in 64, auto-job not processing",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/3525196",
      },
      {
        title: "Jobs under PI RFC user for RBDAPP01",
        url: "https://community.sap.com/t5/technology-q-a/jobs-found-under-pi-rfc-user-for-report-rbdapp01/qaq-p/10943834",
      },
      {
        title: "KBA 1872637 – Delays posting status 64",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/1872637",
      },
    ],
  },
  {
    id: "community-idoc-rbdapp01-residual",
    area: "idoc",
    statusCode: "64",
    title: "RBDAPP01 green but residual status 64 remain",
    summary:
      "A green RBDAPP01 job is not proof the batch cleared. Parallel/package processing can leave a residual 64 subset — compare job log counts to WE02 and rerun controlled.",
    errorText:
      "RBDAPP01 finished successfully. Random subset of selected status 64 IDocs remain. Parallel processing. Package partially processed. KBA 2038054.",
    signatures: [
      "residual 64",
      "rbdapp01 green",
      "2038054",
      "parallel processing",
      "package size",
      "remain in status 64",
    ],
    steps: [
      "Compare SM37 job log processed counts with WE02/BD87 remaining status 64 for the same selection.",
      "Rerun as a control with package size 1 and without parallel processing. Check ST22 during the job window.",
      "Narrow the variant (message type, IDoc numbers, date) so selection matches intent.",
      "Stabilize with non-parallel controlled packages, then re-enable parallelism per notes for your release. Alert on residual 64 count, not only job status.",
    ],
    sources: [
      {
        title: "KBA 2038054 – IDocs remain in status 64 after RBDAPP01",
        url: "https://userapps.support.sap.com/sap/support/knowledge/en/2038054",
      },
      {
        title: "Some IDocs in 64 status",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/some-idocs-in-64-status/td-p/12687213",
      },
      {
        title: "SAP Help – Activated Background Processing",
        url: "https://help.sap.com/doc/saphelp_nw73ehp1/7.31.19/en-US/4d/a56ceaf5da1f69e10000000a42189b/content.htm",
      },
    ],
  },

  // --- Net-new: P2 ---
  {
    id: "community-cpi-processdirect",
    area: "cpi",
    title: "ProcessDirect address mismatch or consumer not deployed",
    summary:
      "ProcessDirect binds by exact in-tenant Address — there is no load balancer. Producer and consumer must match, and the consumer iFlow must be Started.",
    errorText:
      "ProcessDirect producer address does not match consumer. Consumer not Started. Dynamic address on sender ProcessDirect. No consumer listening.",
    signatures: [
      "processdirect",
      "process direct",
      "address mismatch",
      "consumer not deployed",
      "consumer not started",
      "dynamic address",
    ],
    steps: [
      "Compare the Address on the ProcessDirect sender adapter (consumer iFlow) with the Address on the ProcessDirect receiver adapter (producer iFlow). They must match character for character.",
      "Confirm the consumer iFlow (the one with the ProcessDirect sender) is deployed and Started in Manage Integration Content. A stopped or undeployed consumer looks like a dead producer.",
      "Use dynamic Address only on the ProcessDirect receiver (producer) toward fixed known ProcessDirect senders (consumers) — putting a dynamic address on the sender/consumer side is a common misconfiguration.",
      "ProcessDirect is in-tenant only. Do not expect Cloud Connector, load balancing, or cross-tenant routing to bridge a typo.",
    ],
    sources: [
      {
        title: "ProcessDirect Adapter (SAP)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-sap/processdirect-adapter/ba-p/13351290",
      },
      {
        title: "Dynamic address in sender Process Direct adapter",
        url: "https://community.sap.com/t5/technology-q-a/dynamic-address-in-sender-process-direct-adapter/qaq-p/12650604",
      },
      {
        title: "Help – Configure ProcessDirect Receiver Adapter",
        url: "https://help.sap.com/docs/cloud-integration/sap-cloud-integration/configure-processdirect-receiver-adapter",
      },
    ],
  },
  {
    id: "community-cpi-service-key-expiry",
    area: "cpi",
    title: "CF Process Integration service key or X.509 credential expired",
    summary:
      "Inbound callers that worked for months fail when a finite-lifetime service key or X.509 credential hits validUntil. Distinct from “wrong S-user” 401 — this is time-based credential death.",
    errorText:
      "Inbound fails after service key validuntil. X.509 service key expired. No XSUAA token. HTTP 401/403 from previously working senders. Process Integration Runtime credential expiry.",
    signatures: [
      "service key expiry",
      "validuntil",
      "x.509 service key",
      "xsuaa token",
      "credential expired",
      "service key expired",
    ],
    landscapeNote:
      "Complements community-cpi-401 (wrong identity / MessagingSend) and community-cpi-oauth (outbound client-creds). Here the credential was correct until it expired.",
    steps: [
      "Inventory Process Integration Runtime (integration-flow) service keys and note validUntil / creation dates against the outage start.",
      "Create a new service key (or renew X.509 material), update every external sender’s client id/secret/token URL or certificate, verify one caller, then delete the expired key.",
      "Prefer overlapping validity during rotation so senders can cut over without a hard outage.",
      "Add expiry notification (custom iFlow / Alert Notification pattern) before the next cycle — CF does not email every landscape by default.",
    ],
    sources: [
      {
        title: "Notification for expiration of service keys / certificates (CF)",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/notification-for-expiration-of-service-keys-certificates-in-cloud-foundry/ba-p/13559692",
      },
      {
        title: "Help – OAuth inbound client credentials for API clients",
        url: "https://help.sap.com/docs/cloud-integration/sap-cloud-integration/setting-up-oauth-inbound-authentication-with-client-credentials-grant-for-api-clients",
      },
      {
        title: "OAuth with Client Credentials Grant for API Clients",
        url: "https://help.sap.com/docs/integration-suite/sap-integration-suite/oauth-with-client-credentials-grant-for-api-clients",
      },
    ],
  },
  {
    id: "community-cpi-jdbc-tx-design",
    area: "cpi",
    title: "Long-held JDBC transactions / DataStore lock design",
    summary:
      "Keeping JDBC Required open across slow receivers or large DataStore work starves the shared tenant pool. Design for short local persistency — this is the feeder pattern behind JDBC pool exhaustion.",
    errorText:
      "Intermittent Timeout waiting for idle object. DataStore Sender with JDBC Required across slow receivers. Long-held JDBC transaction. Pool starvation under concurrent persistency.",
    signatures: [
      "jdbc required",
      "long transaction",
      "datastore sender",
      "transaction handling",
      "jdbc timeout intermittent",
      "persistency design",
    ],
    landscapeNote:
      "When many iFlows already fail with pool exhausted, clear the acute outage with the JDBC pool case first, then redesign long transactions so it does not recur.",
    steps: [
      "Find iFlows that wrap slow HTTP/receiver calls inside JDBC Required or hold DataStore work across long branches.",
      "Move persistency into short local process steps. Use JDBC Required only when a true rollback boundary is required — not as a default around the whole flow.",
      "Stagger timers and reduce concurrent DataStore/Aggregator writers that hold connections.",
      "After redesign, confirm pool timeouts stop under the same load. Pair with the internal JDBC pool exhausted case for acute triage.",
    ],
    sources: [
      {
        title: "Transaction handling in integration flow (SAP)",
        url: "https://community.sap.com/t5/technology-blogs-by-sap/cloud-integration-how-to-configure-transaction-handling-in-integration-flow/ba-p/13332565",
      },
      {
        title: "Help – performance / data store",
        url: "https://help.sap.com/doc/978cdb2059244c10b55a8bd916484a63/CLOUD/en-US/b98a7caa6c871014bc6ce3c22a1e81b1.html",
      },
      {
        title: "Q&A citing KBA 2492017 – DB connection pool",
        url: "https://community.sap.com/t5/technology-q-a/sci-sap-cloud-integration-db-connection-always-failed-when-try-to-call-db/qaq-p/12562015",
      },
    ],
  },
];
