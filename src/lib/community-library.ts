import type { LibraryEntry } from "@/lib/types";

export const communityLibrary: LibraryEntry[] = [
  {
    id: "community-idoc-51",
    area: "idoc",
    statusCode: "51",
    title: "Status 51, application document not posted",
    summary:
      "The inbound function module rejected the document. Read the status long text, fix the application data or the inbound setup, then reprocess the same IDoc with BD87 or RBDMANI2.",
    errorText:
      "Status 51. Application document not posted. The IDoc was passed to the application but the posting function module returned an error.",
    signatures: [
      "status 51",
      "application document not posted",
      "application doc not posted",
      "field is not an input field",
    ],
    landscapeNote:
      "Status 51 is an application rejection. Do not start by rebuilding the partner profile unless the long text actually says the partner or process code is missing.",
    steps: [
      "Open the IDoc in WE02 or BD87 and read the status 51 long text, then the application log. The text names the field, master-data object, or function module that rejected the posting.",
      "Fix that data or customizing in the receiving system. A message such as “field is not an input field” comes from the posting function module, not from the ALE layer.",
      "Confirm the inbound chain only if the long text points at it: message type to basic type in WE82, process code in WE42, function module in WE57 and BD51, partner in WE20.",
      "Reprocess the same IDoc with BD87 or program RBDMANI2. Use WE19 only when you want a debug copy, not to clear the production IDoc.",
    ],
    sources: [
      {
        title: "Resolve IDoc Errors",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/resolve-idoc-errors/m-p/2457056",
      },
      {
        title: "Error Code 51",
        url: "https://community.sap.com/t5/technology-q-a/error-code-51/qaq-p/4008142",
      },
    ],
  },
  {
    id: "community-idoc-56",
    area: "idoc",
    statusCode: "56",
    title: "Status 56, EDI partner profile not available",
    summary:
      "The inbound control-record key has no WE20 partner parameter. Create the logical-system partner with the same name, message type, and process code, then reprocess.",
    errorText:
      "Status 56. IDoc with errors added. EDI: Partner profile not available. EDI: Partner profile inbound not available.",
    signatures: [
      "status 56",
      "partner profile not available",
      "partner profile inbound not available",
      "idoc with errors added",
    ],
    steps: [
      "In WE02, open EDI_DC40 and note sender partner number (SNDPRN), partner type (SNDPRT), message type, message code, and message function.",
      "In the receiving system, WE20 must have that exact partner. For ALE the partner type is LS and the number is the sender logical system, including case.",
      "Add an inbound parameter for the message type and the process code. A wrong message function on the control record is enough to miss the profile.",
      "Reprocess with BD87 or RBDAGAI2. Do not create a second IDoc in WE19.",
    ],
    sources: [
      {
        title: "EDI: Partner profile not available",
        url: "https://community.sap.com/t5/technology-q-a/edi-partner-profile-not-available/qaq-p/3002426",
      },
      {
        title: "Port is missing from the IDoc control record",
        url: "https://community.sap.com/t5/technology-q-a/port-is-missing-from-the-idoc-control-record-receiver-idoc-adapter/qaq-p/5007151",
      },
    ],
  },
  {
    id: "community-idoc-29",
    area: "idoc",
    statusCode: "29",
    title: "Status 29, outbound partner profile not found",
    summary:
      "ALE could not find an EDP13 outbound parameter for the receiver key. Match WE20 to that key. A partner role the IDoc does not send is a known mismatch.",
    errorText:
      "Status 29. Error in ALE service. No partner profile (outbound parameter) could be found. Entry in outbound table not found.",
    signatures: [
      "status 29",
      "no partner profile (outbound parameter)",
      "entry in outbound table not found",
      "error in ale service",
    ],
    landscapeNote:
      "Blanking the partner role is the fix only when WE20 has a role filled and the IDoc key has that field empty. Otherwise maintain the missing key as it is printed in the error.",
    steps: [
      "Read the status long text. The key is receiver partner, partner type, partner function, message type, message code, message function, and the test flag. That key is table EDP13.",
      "In WE20, under the receiver, add an outbound parameter whose message type, message code, and message function match the key, with the correct port and basic type.",
      "If every field matches except a partner role that the IDoc never sends, copy the outbound parameter, leave Partner role blank, save, and delete the old parameter. You cannot clear the role on the existing row.",
      "Reprocess from BD87. Status 29 is not cleared by RSEOUT00; the partner row has to exist first.",
    ],
    sources: [
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
      "The IDoc passed the ALE checks and is waiting to be sent. Run RSEOUT00 or BD87. Collect IDocs in the partner profile is why they sit in 30.",
    errorText:
      "Status 30. IDoc ready for dispatch (ALE service). Receiver exists, no filters, no conversion.",
    signatures: [
      "status 30",
      "idoc ready for dispatch",
      "ready for dispatch (ale service)",
    ],
    steps: [
      "Confirm it is status 30 and not 29 or 02. Yellow 30 means the IDoc is valid and has not been handed to the port.",
      "Process it with BD87 or program RSEOUT00. Schedule RSEOUT00 in SM36 if these should leave on a job.",
      "In WE20 outbound options, Transfer IDoc immediately sends on creation. Collect IDocs leaves them in 30 until RSEOUT00 runs.",
      "After the status moves to 03, the port accepted it. The receiver still has to confirm it; that is a different check.",
    ],
    sources: [
      {
        title: "IDOC fail - Status 30",
        url: "https://community.sap.com/t5/technology-q-a/idoc-fail-status-30/qaq-p/4237479",
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
      "Status 03 means the port accepted the IDoc. If the target has nothing, look in SM58 for a recorded tRFC and push it with RSARFCEX. RBDMOIND moves a delivered IDoc from 03 to 12.",
    errorText:
      "Status 03. Data passed to port OK. IDoc sent to SAP system or external program. SM58 shows IDOC_INBOUND_ASYNCHRONOUS, Transaction recorded.",
    signatures: [
      "status 03",
      "data passed to port ok",
      "transaction recorded",
      "idoc_inbound_asynchronous",
      "sent not arrived",
    ],
    steps: [
      "If the receiver already has the IDoc and you only need the sender to show 12, run RBDMOIND for that IDoc number.",
      "If the receiver has no IDoc, open SM58 on the sender. Enter * in the user, function module, and target fields and keep the default display period.",
      "Entries stuck as Transaction recorded for IDOC_INBOUND_ASYNCHRONOUS are unprocessed tRFC calls. Execute them with program RSARFCEX. A batch job every half hour is the usual workaround when they keep hanging.",
      "If they remain, open SMQS and register and activate the RFC destination. Then test the destination from SE37 with RFC_PING. The destination name is case-sensitive.",
    ],
    sources: [
      {
        title: "Outbound IDoc status 30, including RBDMOIND",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/outbound-idoc-status-code-30/m-p/5733458",
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
      "The IDoc is in the inbox and nothing has posted it. Run RBDAPP01, or set the WE20 inbound option to Trigger immediately.",
    errorText:
      "Status 64. IDoc ready to be transferred to application. No application document posted yet.",
    signatures: [
      "status 64",
      "ready to be transferred to application",
      "idoc ready to be passed to application",
    ],
    steps: [
      "Status 64 is not an application error. The IDoc is waiting for inbound processing.",
      "Run program RBDAPP01 for the message type or IDoc number, or process it from BD87.",
      "In WE20, inbound options set to Trigger immediately post on receipt. Trigger by background program leaves them in 64 until RBDAPP01 is scheduled.",
      "If RBDAPP01 then returns status 51, switch to the status 51 checks. The document reached the application and was rejected there.",
    ],
    sources: [
      {
        title: "Resolve IDoc Errors",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/resolve-idoc-errors/m-p/2457056",
      },
      {
        title: "Reprocess of inbound IDoc",
        url: "https://community.sap.com/t5/technology-q-a/reprocess-of-inbound-idoc/qaq-p/4196306",
      },
    ],
  },
  {
    id: "community-idoc-26-60",
    area: "idoc",
    statusCode: "26",
    title: "Status 26 or 60, syntax error in the IDoc",
    summary:
      "The segment structure does not match the basic type. Open the status 26 or 60 record, compare the segment order with WE30, and check the extension in WE82 and WE20.",
    errorText:
      "Status 26. Error during syntax check of IDoc (outbound). Status 60. Error during syntax check of IDoc (inbound). EDI: Syntax error in IDoc (segment cannot be identified).",
    signatures: [
      "status 26",
      "status 60",
      "syntax error in idoc",
      "segment cannot be identified",
      "error during syntax check",
    ],
    steps: [
      "Open the status record itself. The header often only says to get details from the previous status 26 or 60 record. That record names the segment.",
      "In WE30, the segments must be filled parent before child, in the order defined for the basic type. A custom segment under the wrong parent produces “segment cannot be identified”.",
      "WE82 must list the message type, basic type, and extension. The same extension name must be on the WE20 outbound or inbound parameter. A syntax check in WE19 can pass while WE20 still points at the basic type without the extension.",
      "Clearing “Cancel processing after syntax error” in WE20 only skips the check. It does not repair the segment. Inbound status 60 can be reprocessed with RBDSYNER after the definition is corrected.",
    ],
    sources: [
      {
        title: "Error during syntax check of IDoc (outbound)",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/error-during-syntax-check-of-idoc-outbound/m-p/9373695",
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
      "The IDoc never left the sender. Check the WE21 port, its RFC destination, and SM59: host, Unicode flag, and logon language. Code-page errors are an SM59 setting on a Unicode to non-Unicode hop.",
    errorText:
      "Status 02. Error passing data to port. Could not find code page for receiving system.",
    signatures: [
      "status 02",
      "error passing data to port",
      "could not find code page for receiving system",
    ],
    steps: [
      "In WE02, note the receiver port. In WE21, open that port and the RFC destination it uses.",
      "In SM59, test the destination. Check the host, the system number or path, the logon language, and whether Unicode is selected. A missing logon language has produced “could not find code page for receiving system”.",
      "For a Unicode sender talking to a non-Unicode receiver, the destination must be non-Unicode. On an old MDMP system, set the MDMP flag and the code page per language. SAP Note 647495 covers RFC between Unicode and non-Unicode systems.",
      "Also check that the receiver port on the WE20 outbound parameter is the port you just tested. A stale port entry in WE21 has been enough to keep the code-page error.",
    ],
    sources: [
      {
        title: "IDOC fail - Status 30, then code page on status 02",
        url: "https://community.sap.com/t5/technology-q-a/idoc-fail-status-30/qaq-p/4237479",
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
      "The SOAP IDoc application did not start. An SM59 connection test that returns HTTP 500 with a SOAP fault and an MPL id only proves the tenant was reached. A real send that stays in EA390 with no message in Cloud Integration is the port, the partner, or the SSL client.",
    errorText:
      "Status 02. Message no. EA390. The SOAP IDoc application could not be started successfully. SRT: HTTP-Code 500 Internal Server Error. Message no. EA391. No IDoc saved in target system (SOAP HTTP).",
    signatures: [
      "ea390",
      "ea391",
      "soap idoc application could not be started",
      "no idoc saved in target system",
      "srt: http-code 500",
    ],
    landscapeNote:
      "One S/4 to CPI trial landscape cleared EA390 by setting the SM59 SSL client to ANONYM. Treat that as a check, not the only cause. A connection-test HTTP 500 is the expected result when no IDoc body was sent.",
    steps: [
      "In SM59, a connection test to the Integration Suite IDoc endpoint that returns HTTP 500, a SOAP fault, and an MPL id means TLS and authentication reached the tenant. The iFlow had nothing to process. Look up that MPL id before changing certificates.",
      "If a real IDoc stays in status 02 with EA390 and message monitoring shows no message, check WE21. The port must be an XML HTTP port with SOAP protocol, pointed at the SM59 destination whose path is the deployed iFlow endpoint.",
      "WE20 for the Integration Suite logical system needs the outbound message type, that port, the basic type, and Transfer IDoc immediately if you are testing one document.",
      "On the SM59 Logon and Security tab, compare the SSL client PSE with what the tenant expects. ANONYM (anonymous) was the setting that cleared EA390 in one reported landscape. If the MPL exists, the failure is inside the iFlow, not SM59.",
    ],
    sources: [
      {
        title: "S/4HANA to CPI connection issue, status 02 EA390",
        url: "https://community.sap.com/t5/enterprise-resource-planning-q-a/s4hana-to-cpi-connection-issue/qaq-p/12580281",
      },
      {
        title: "No IDoc saved in target system (SOAP HTTP), EA391",
        url: "https://community.sap.com/t5/crm-and-cx-q-a/no-idoc-saved-in-target-system-soap-http-idoc-to-hci/qaq-p/10887368",
      },
      {
        title: "S/4HANA IDoc outbound to SAP Integration Suite",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/how-sap-s4hana-on-premise-idoc-outbound-to-sap-integration-suite-inbound/ba-p/14352165",
      },
    ],
  },
  {
    id: "community-idoc-65",
    area: "idoc",
    statusCode: "65",
    title: "Status 65, inbound error in the ALE service",
    summary:
      "The IDoc was added, then ALE failed before the application. Recheck the partner, the process code, and the function-module link, then reprocess with RBDAGAI2.",
    errorText:
      "Status 65. Error in ALE service. Inbound IDoc was not passed to the application.",
    signatures: [
      "status 65",
      "error in ale service",
      "inbound partner profiles are incorrect",
    ],
    steps: [
      "Read the status 65 long text. It usually names a partner, a port, or a process code rather than an application field.",
      "Check WE20 inbound parameters, the process code in WE42, the function module assignment in WE57, and the function module entry in BD51.",
      "Reprocess with BD87 or program RBDAGAI2 after the linkage is corrected.",
    ],
    sources: [
      {
        title: "Resolve IDoc Errors",
        url: "https://community.sap.com/t5/application-development-and-automation-discussions/resolve-idoc-errors/m-p/2457056",
      },
      {
        title: "Reprocess of inbound IDoc",
        url: "https://community.sap.com/t5/technology-q-a/reprocess-of-inbound-idoc/qaq-p/4196306",
      },
    ],
  },
  {
    id: "community-idoc-66",
    area: "idoc",
    statusCode: "66",
    title: "Status 66, waiting for a predecessor IDoc",
    summary:
      "Serialization is holding this IDoc until an earlier one in the group is posted. Post or remove the predecessor, then reprocess with RBDMANI2.",
    errorText:
      "Status 66. IDoc is waiting for predecessor IDoc (serialization).",
    signatures: [
      "status 66",
      "waiting for predecessor",
      "serialization",
    ],
    steps: [
      "Find the predecessor in the serialization group. It is often still in 51, 64, or 66 itself.",
      "Post that predecessor, or agree with the functional owner that it can be set aside, before touching the waiting IDoc.",
      "Reprocess the waiting IDoc with BD87 or RBDMANI2.",
    ],
    sources: [
      {
        title: "Reprocess of inbound IDoc",
        url: "https://community.sap.com/t5/technology-q-a/reprocess-of-inbound-idoc/qaq-p/4196306",
      },
    ],
  },
  {
    id: "community-idoc-reprocess",
    area: "idoc",
    title: "Reprocess an IDoc without cloning it",
    summary:
      "BD87 reprocesses the same IDoc. WE19 builds a copy for debugging. Use the program that matches the status.",
    errorText:
      "How to reprocess an inbound or outbound IDoc without creating a new IDoc number. BD87, WE19, RBDMANI2, RBDAPP01, RSEOUT00.",
    signatures: [
      "reprocess idoc",
      "reprocess inbound",
      "bd87",
      "we19",
      "rbdmani2",
      "rbdapp01",
      "rseout00",
    ],
    steps: [
      "Use BD87 to reprocess the existing IDoc. WE19 is a test tool and creates another IDoc.",
      "Status 64: program RBDAPP01.",
      "Status 51 or 66: program RBDMANI2.",
      "Status 56, 61, 63, or 65: program RBDAGAI2.",
      "Status 60: program RBDSYNER, after the syntax definition is fixed.",
      "Status 69, an edited IDoc: program RBDAGAIE.",
      "Status 30: program RSEOUT00.",
    ],
    sources: [
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
      "The Integration Suite JVM does not trust the server certificate chain. Import the root and intermediates from Connectivity Test, and import the token host as well when it is a different name.",
    errorText:
      "sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target. javax.net.ssl.SSLHandshakeException.",
    signatures: [
      "pkix path building failed",
      "unable to find valid certification path",
      "suncertpathbuilderexception",
      "sslhandshakeexception",
      "general sslengine problem",
    ],
    steps: [
      "Run Connectivity Test against the exact host that failed, not only the website you open in a browser. Download the chain the test shows.",
      "Import the root and the issuing CA into the tenant keystore, Monitor, Keystore. The leaf the browser shows is not always the certificate the JVM is missing.",
      "If the OAuth token URL host differs from the API host, import that chain too. A successful call to one host does not cover the other.",
      "Retry the iFlow after the import. A chain that worked yesterday and fails today usually means the server renewed a certificate signed by a CA you never imported.",
    ],
    sources: [
      {
        title: "Exception while fetching OAuth token, PKIX",
        url: "https://community.sap.com/t5/technology-q-a/oauth2-credential-exception-while-fetching-oauth-token-in-ci/qaq-p/12661979",
      },
      {
        title: "PKIX path building failed, Cloud Integration",
        url: "https://community.sap.com/t5/technology-q-a/pkix-path-building-failed-cloud-integration/qaq-p/14158408",
      },
      {
        title: "Unable to find valid certification path to requested target",
        url: "https://community.sap.com/t5/technology-q-a/unable-to-find-valid-certification-path-to-requested-target/qaq-p/756318",
      },
    ],
  },
  {
    id: "community-cpi-401",
    area: "cpi",
    title: "HTTP 401 on an HTTPS sender",
    summary:
      "An S-user password does not call a Cloud Foundry iFlow. The caller needs a Process Integration Runtime service key and the MessagingSend role.",
    errorText:
      "HTTP 401 Unauthorized on the HTTPS sender endpoint of an integration flow. Postman returns 401 with the S-user.",
    signatures: [
      "401 unauthorized",
      "https sender",
      "messagingsend",
      "esbmessaging.send",
    ],
    steps: [
      "Stop using the S-user that signs in to the cockpit. Cloud Foundry does not accept that user on the runtime endpoint.",
      "Create a service instance of SAP Process Integration Runtime, plan integration-flow. Create a service key and call the endpoint with its client id and secret.",
      "Create a role collection that contains the role MessagingSend, and assign that collection to the user or grant it through the service instance. The old ESBMessaging.send role is not assigned directly on Cloud Foundry.",
      "Confirm the iFlow sender uses User Role authorization and that you are calling the endpoint URL shown after deployment, not the design-time URL.",
    ],
    sources: [
      {
        title: "401 Unauthorized error in HTTPS sender adapter",
        url: "https://community.sap.com/t5/technology-q-a/401-unauthorized-error-in-https-sender-adapter-in-sap-cpi/qaq-p/14051563",
      },
    ],
  },
  {
    id: "community-cpi-oauth",
    area: "cpi",
    title: "OAuth2 client credentials, 415 or token fetch failed",
    summary:
      "Create the credential in Security Material and give the scope field a value when the token server requires it. An empty scope has returned HTTP 415. Import the token host certificate if that host differs from the API.",
    errorText:
      "Exception occurred while fetching OAuth token. HTTP 415 from the token endpoint. OAuth2 Client Credentials in Security Material.",
    signatures: [
      "fetching oauth token",
      "oauth2 client credentials",
      "http 415",
      "415 unsupported",
    ],
    landscapeNote:
      "The scope field is not always marked required. On some token servers, including the one in the Commissions write-up, an empty scope is what produced HTTP 415.",
    steps: [
      "In Monitor, Integrations, Security Material, create OAuth2 Client Credentials. Use the token URL, client id, and secret from the target, not a separate HTTP call that stores the secret in the iFlow.",
      "Put a scope value in the credential even if the field looks optional. An empty scope was the cause of HTTP 415 on a token server that otherwise looked correctly configured.",
      "If the token host name differs from the API host, import the token host chain as well. The error then looks like PKIX path building failed during the token fetch.",
      "Point the receiver adapter at that credential. You do not need a first request-reply just to fetch a bearer token.",
    ],
    sources: [
      {
        title: "Commissions OAuth2 authentication in a CPI flow",
        url: "https://community.sap.com/t5/human-capital-management-blog-posts-by-sap/commissions-oauth2-authentication-in-cpi-flow/ba-p/13567899",
      },
      {
        title: "Exception while fetching OAuth token in CI",
        url: "https://community.sap.com/t5/technology-q-a/oauth2-credential-exception-while-fetching-oauth-token-in-ci/qaq-p/12661979",
      },
    ],
  },
  {
    id: "community-cpi-csrf",
    area: "cpi",
    title: "403, CSRF token validation failed",
    summary:
      "The POST is missing the session cookie, not only the token. Fetch with x-csrf-token: Fetch, send the cookies back, and turn HTTP Session Reuse on. The OData receiver can do this itself.",
    errorText:
      "HTTP 403. CSRF token validation failed. CSRF token is invalid. /IWBEP/CM_V4H/042. x-csrf-token.",
    signatures: [
      "csrf token validation failed",
      "csrf token is invalid",
      "iwbep/cm_v4h/042",
      "x-csrf-token",
      "csrf token is missing",
    ],
    steps: [
      "Prefer the OData receiver adapter with CSRF Protected for a POST, PUT, or DELETE to an SAP OData service. It fetches the token and the cookies for you.",
      "If you stay on the HTTP receiver, set a header x-csrf-token with the value Fetch on a GET or HEAD to the same service and the same sap-client. On the integration process, set Runtime Configuration, HTTP Session Reuse, to On Exchange.",
      "Copy every set-cookie value into a Cookie header on the POST: only the name=value part, joined with a semicolon and a space. The cookie that matters is sap-XSRF_ plus the client, and SAP_SESSIONID when the response sends it. sap-usercontext does not satisfy the check.",
      "Add Cookie and x-csrf-token to the HTTP adapter request headers so they are actually sent. A 042 with the token present and the cookie absent is this case. Message 043 means the token header itself was missing.",
    ],
    sources: [
      {
        title: "X-CSRF token with an on-premises system using the HTTP receiver",
        url: "https://community.sap.com/t5/technology-blogs-by-members/x-csrf-token-with-on-premises-sap-system-using-http-receiver-adapter/ba-p/13533518",
      },
      {
        title: "CSRF token invalid, /IWBEP/CM_V4H/042",
        url: "https://community.sap.com/t5/technology-q-a/sap-cloud-integration-csrf-token-invalid-iwbep-cm-v4h-run-042/qaq-p/14499931",
      },
      {
        title: "HTTP versus OData receiver adapter",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/sap-cloud-integration-http-vs-odata-receiver-adapter/ba-p/13852349",
      },
    ],
  },
  {
    id: "community-cpi-idoc-403",
    area: "cpi",
    title: "403 posting an IDoc into S/4 or ECC",
    summary:
      "The IDoc SOAP service on the backend is not open, or the Cloud Connector user cannot call it. Enable SICF, run SRTIDOC, and expose /sap/bc/srt/ through the connector.",
    errorText:
      "HTTP 403 Forbidden while posting an IDoc from Cloud Integration to ERP. org.apache.cxf.transport.http.HTTPException: HTTP response 403 Forbidden.",
    signatures: [
      "403 forbidden",
      "posting idoc",
      "idoc adapter",
      "/sap/bc/srt/idoc",
      "srtidoc",
    ],
    steps: [
      "On the backend, activate the SICF node /sap/bc/srt/idoc and run transaction SRTIDOC so the inbound IDoc SOAP runtime is configured.",
      "In the Cloud Connector, the resource for that host must allow /sap/bc/srt/ with path and all sub-paths. A ping of the host is not the same as access to the IDoc URL.",
      "The adapter address is http://virtual-host:port/sap/bc/srt/idoc?sap-client=your-client. Proxy type is On-Premise. Location ID is the one configured on that Cloud Connector.",
      "The user in the receiver credential needs the backend roles for IDoc inbound. A 403 whose body says Logon Error is this user, not a certificate.",
    ],
    sources: [
      {
        title: "Error while establishing ERP inbound connection",
        url: "https://community.sap.com/t5/technology-q-a/error-while-establishing-erp-inbound-connection/qaq-p/13790599",
      },
      {
        title: "403 when connecting with SOAP through Cloud Connector",
        url: "https://community.sap.com/t5/technology-q-a/403-error-when-trying-to-connect-to-sap-using-soap-using-cloud-connector/qaq-p/12746606",
      },
      {
        title: "How to post an IDoc to ECC from CPI",
        url: "https://community.sap.com/t5/technology-q-a/sap-cpi-how-to-post-idoc-to-ecc-using-using-cpi/qaq-p/12611428",
      },
    ],
  },
  {
    id: "community-cpi-unknown-host",
    area: "cpi",
    title: "Unknown host, or backend status could not be determined",
    summary:
      "The virtual host and port in the adapter must match the Cloud Connector mapping character for character. Location ID belongs to the subaccount, not to each backend host.",
    errorText:
      "java.net.UnknownHostException calling a virtual host. Cloud Connector destination check: Failure reason: Backend status could not be determined.",
    signatures: [
      "unknownhostexception",
      "backend status could not be determined",
      "location id",
      "virtual host",
    ],
    steps: [
      "In the Cloud Connector, copy the virtual host and virtual port. Put that exact value in the adapter address. The internal hostname is not reachable from the tenant.",
      "Set proxy type On-Premise. If the connector has a location ID, set the same location ID on the adapter or destination. A wrong location ID fails the check even when the internal system is reachable from the connector host.",
      "Location ID is defined once for the subaccount on that connector installation. It is not a per-host value you invent on the destination.",
      "The connector’s own reachability check can say Reachable while the destination check still fails. Trust a real message run, and the location ID, over the check button.",
    ],
    sources: [
      {
        title: "How to post an IDoc to ECC from CPI",
        url: "https://community.sap.com/t5/technology-q-a/sap-cpi-how-to-post-idoc-to-ecc-using-using-cpi/qaq-p/12611428",
      },
      {
        title: "Cloud Connector HTTPS and a wrong location ID",
        url: "https://community.sap.com/t5/technology-q-a/cloud-connector-https-for-non-abap-system-is-not-working/qaq-p/12294327",
      },
    ],
  },
  {
    id: "community-cpi-handshake",
    area: "cpi",
    title: "Cloud Connector handshake timed out, or 401 during handshake",
    summary:
      "The connector host cannot complete TLS to the BTP connectivity endpoints, or a backend certificate in STRUST has expired. Notes 2837206 and 2971034 cover the 401 and 417 cases.",
    errorText:
      "Cloud Connector failed to connect. handshake timed out after 10000ms. Invalid status of handshake response: 401 Unauthorized. SslHandshakeTimeoutException.",
    signatures: [
      "handshake timed out",
      "sslhandshaketimeoutexception",
      "invalid status of handshake response",
      "401 unauthorized",
      "cloud connector",
    ],
    landscapeNote:
      "A handshake 401 is not the same failure as an iFlow HTTPS sender 401. This one is between the Cloud Connector and BTP.",
    steps: [
      "From the Cloud Connector host, check that these endpoints answer on port 443: connectivitynotification, connectivitycertsigning, and connectivitytunnel, on the host names for your region. A timeout during the handshake is a firewall or proxy, not an iFlow.",
      "Read ljs_trace.log and see which of the notification, tunnel, or certificate connections timed out.",
      "If the connector logs Invalid status of handshake response: 401 Unauthorized, use SAP Note 2837206. Note 2971034 covers the 417 while adding a subaccount.",
      "An expired server certificate in STRUST on a backend the connector talks to has produced the same timeout after the BTP side was already fine. Check the certificate dates before opening a network change.",
    ],
    sources: [
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
      "The body has to use the namespace urn:sap-com:document:sap:idoc:soap:messages. From S/4, the XML HTTP port needs SOAP protocol and the outbound partner has to point at it.",
    errorText:
      "IDocSoapProtocolException: [IDocSoapNamespaceInvalid]: Invalid IDoc SOAP namespace received.",
    signatures: [
      "invalid idoc soap namespace",
      "idocsoapnamespaceinvalid",
      "idocsoapprotocolexception",
      "urn:sap-com:document:sap:idoc:soap:messages",
    ],
    steps: [
      "On the IDoc sender, the payload namespace must be urn:sap-com:document:sap:idoc:soap:messages. A body in the older IDoc XML namespace is rejected before mapping.",
      "From S/4 or ECC, WE21 must be an XML HTTP port with SOAP protocol selected, and WE20 must use that port for the message type.",
      "An SM59 connection test that returns HTTP 500 and an MPL id only shows that the HTTPS call arrived. Send a real IDoc before treating the iFlow as broken.",
      "If the partner profile on the S/4 side is missing, the SOAP payload that reaches Cloud Integration is not a valid IDoc document. Check that before rewriting the iFlow.",
    ],
    sources: [
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
      "The IDoc XML is in a namespace, so an unprefixed XPath matches nothing. Declare the namespace and use the prefix in the filter.",
    errorText:
      "Filter on an IDoc from ECC returns an empty body. ADRMAS03 xmlns urn:sap-com:document:sap:idoc:soap:messages. Namespace mapping error in SAP CPI.",
    signatures: [
      "namespace mapping",
      "empty body",
      "urn:sap-com:document:sap:idoc:soap:messages",
      "filter idoc",
    ],
    steps: [
      "In the iFlow namespace mapping, declare a prefix, for example xmlns:p3=urn:sap-com:document:sap:idoc:soap:messages.",
      "Point the filter at the prefixed path. For ADRMAS03 that is /p3:ADRMAS03/p3:IDOC. Use the message name you actually receive.",
      "An XPath without the prefix looks at an empty document even when the trace shows the IDoc. The next step then has no body.",
    ],
    sources: [
      {
        title: "Namespace mapping error in SAP CPI",
        url: "https://community.sap.com/t5/technology-q-a/namespace-mapping-error-in-sap-cpi/qaq-p/12605981",
      },
    ],
  },
  {
    id: "community-cpi-sftp-auth",
    area: "cpi",
    title: "SFTP Auth fail",
    summary:
      "The SSH connectivity test and the adapter are not using the same key. Upload known_hosts, retest with the adapter alias, and recreate the key under a short alias if the test works and the iFlow does not.",
    errorText:
      "com.jcraft.jsch.JSchException: Auth fail. SSH_MSG_DISCONNECT. SFTP receiver or sender public key authentication failed.",
    signatures: [
      "jsch exception",
      "auth fail",
      "ssh_msg_disconnect",
      "sftp",
      "known_hosts",
    ],
    landscapeNote:
      "One tenant started working after the key alias no longer contained id_rsa. Uppercase aliases have also failed deployment. If every SFTP iFlow breaks at the same minute, that has been a runtime regression under component LOD-HCI-PI-RT, not a password change.",
    steps: [
      "In Connectivity Test, SSH, test the same host, user, and private key alias the adapter uses. Upload known_hosts from Security Material before the test.",
      "If the test lists the directory and the iFlow still throws Auth fail, undeploy the iFlow, delete the key pair, and import it again with a short alias that does not contain id_rsa. Then set that alias on the adapter and deploy.",
      "Confirm the public key installed on the SFTP server is the public half of that same key pair. A test that uses a different alias will look healthy while the iFlow fails.",
      "When many SFTP iFlows fail at once and the servers did not change, open an incident on LOD-HCI-PI-RT. A hotfix has been required for that pattern.",
    ],
    sources: [
      {
        title: "Cloud Platform Integration SFTP Auth fail",
        url: "https://community.sap.com/t5/technology-q-a/cloud-platform-integration-sftp-strange-error/qaq-p/12423674",
      },
      {
        title: "SFTP public key authentication in Cloud Integration",
        url: "https://community.sap.com/t5/technology-blog-posts-by-members/setup-secure-connection-to-sftp-server-using-public-key-authentication-in/ba-p/13513274",
      },
    ],
  },
  {
    id: "community-cpi-sftp-silent",
    area: "cpi",
    title: "SFTP sender deploys and never creates a message",
    summary:
      "The iFlow is running and the directory or file name does not match. The check is case-sensitive. The idempotent repository will also skip a file it has already seen.",
    errorText:
      "SFTP sender adapter is deployed and scheduled. Manage Integration Content shows the iFlow. Monitor Message Processing stays empty.",
    signatures: [
      "sftp sender",
      "not reading the files",
      "does not execute",
      "idempotent repository",
      "no message processing",
    ],
    steps: [
      "A started sender that finds no file writes nothing to message monitoring. Check Manage Integration Content for the deployed artifact and the last poll time before treating it as down.",
      "Compare the directory and the file name with the server, including case. A pattern such as UserDefault*.xlsx only matches names that actually start that way.",
      "While you are testing, turn off the idempotent repository. With it on, a file that was already processed, even by a failed attempt you later fixed, will not be picked again until the name changes.",
      "Raise the maximum messages per poll only after a single renamed test file is picked up.",
    ],
    sources: [
      {
        title: "SFTP sender adapter is not reading the files",
        url: "https://community.sap.com/t5/technology-q-a/sftp-sender-adapter-is-not-reading-the-files-and-iflow-does-not-execute/qaq-p/12663972",
      },
    ],
  },
];
