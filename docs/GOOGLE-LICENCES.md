# Google CSV licences

English Mastery now uses the published CSV supplied by Sam:
https://docs.google.com/spreadsheets/d/e/2PACX-1vSvrXJ6k3ZDkOgoa9383xhJhSULy5DHuLTHKhAMIYHPjhqcIEDrg0-QVLKhwZvrA4PFTUIawHMmjMSE/pub?gid=1318597772&single=true&output=csv

The live header was confirmed: AUTH CODE, Org Code, User Name, email, Validity Upto, Validation Status. No Apps Script deployment is required. The earlier Apps Script file is an unused private-sheet alternative.

Setup:
1. Apply 20261003160000_google_csv_licences.sql after the previous individual migrations.
2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and the deployment server environment. Use the service-role key for this project's Supabase instance. Never use a NEXT_PUBLIC variable, paste the key into chat, or commit it. Restart the dev server after configuring it.
3. Maintain unique AUTH CODE values, assigned email, DD-MM-YYYY expiry and Active status in EM_Licenses. Publishing must have automatic republishing enabled. Google publication propagation may delay edits being visible in the CSV.
4. Create the user in English Mastery and share their prefilled sheet key. The app does not create or write sheet keys. Existing local generated keys do not grant access. Each user validates the sheet key once after email/password authentication. Future logins recheck the saved key, current auth email, exact Active status and expiry by reading the CSV afresh on the server. A first activation against this new source is required even for users who previously validated a local key.

The sheet expiry controls individual validity; local licence status and start date, profile activation and TrustGate checks remain additional restrictions. Individual badges use the verified sheet expiry. The administrator individual list and read-only Ends field read expiry directly from the CSV by the holder contact email. Refresh CSV validity fetches updated dates. Duplicate-email rows and invalid dates display an error instead of a local fallback. Account badges fetch the current assigned key expiry from the CSV on load/focus. Local individual end dates are no longer edited through the form. Password/device resets preserve the assigned external key; a changed licence membership requires a new activation.

The authenticated API validates the fresh CSV result, records it through a service-role-only RPC and activates the current session through the user's authenticated RPC. Browser clients cannot record a sheet-verification result. Old local activation RPCs are disabled. Protected page requests also recheck the remote sheet, including individuals with staff access. Unavailable, malformed, invalid-date, duplicate-key, inactive, expired and wrong-email rows block access. There is no offline grace period. Ordinary Super Admin accounts and school accounts retain their existing authentication.

Verification: node tests/licence-csv.cjs; node tests/admin-session.cjs; npm run typecheck; npm run build. After applying the migration and configuring the server key, test first activation, subsequent login without key entry, wrong email, status change to Inactive, expiry, CSV unavailable and TrustGate ON/OFF. SQL and end-to-end checks have not been run remotely from this task.
