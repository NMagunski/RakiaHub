# Supabase Auth diagnosis — 2026-10-28

Initial diagnosis used project-scoped, read-only Supabase MCP. That diagnostic
step made no changes. Subsequent explicitly authorized work reset the selected
user password through a private local flow and activated migrations 004–008.
See [activation report](ACTIVATION-2026-10-29.md) for the current state.

## Confirmed causes

- The signup captured at 17:35:49 Europe/Sofia (14:35:49 UTC) failed with
  SQLSTATE 23505: duplicate key violates `profiles_username_key`.
- `test` is already a registered username. `handle_new_user()` copies the submitted
  username into `profiles`; a collision correctly aborts signup but Auth exposes
  only the generic HTTP 500 `Database error saving new user` to the browser.
- Password login attempts returned HTTP 400 `invalid_credentials`, not a DB 500.
  This confirms that the submitted credentials were not accepted; it does not
  establish which email/password was entered or why it was incorrect.
- There are six Auth users and six profile rows. Aggregate checks found no missing
  password hashes, unconfirmed email accounts, active bans, or missing email
  identities. No actual hash, credential or personal user record was retrieved.

## Local fix

`POST /api/auth/username` checks only whether a public username is available.
Its server-only admin client reads `profiles.id`, returns only a boolean, validates
input and does not change profiles RLS. The registration form checks before signup
and rechecks after a generic DB failure to identify a concurrent username claim.
The DB uniqueness constraint remains authoritative. No database migration is
required for this fix. Deploying the local code is a separate action, not performed.

For the existing production UI, a different, unused username should avoid the
observed collision. A successful new signup has not been performed by the agent.
For an existing account, use the registered email and the password reset action
if necessary. Password reset emails have not been sent by the agent.

## Other live schema observations

At the time of the initial diagnosis, `profiles` had no `age_verified_at` column.
The subsequent activation added it and the theme field. The following observation
describes the earlier state: The deployed registration
form's follow-up write to that field cannot succeed. This happens after Auth signup
and is separate from the observed username collision. The larger local schema
upgrade must be reviewed separately before deployment.

The security advisor also reports mutable search_path settings and broad EXECUTE
permissions on existing SECURITY DEFINER functions. These were not identified as
causes of this signup error, and were not modified. Relevant remediation guides:

- [Function search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Anonymous function execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Authenticated function execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Follow-up: local login button did nothing

The user's local Chrome page at `localhost:4319/login` showed
`ChunkLoadError: Loading chunk app/layout failed`. Without hydrated JavaScript,
the visible form submitted as a plain GET to `/login?` and did not call Supabase.
This was separate from password validity. A production build had been run while
the development server was using the same `.next` directory, and the service
worker also cached mutable development chunks.

Local fixes:

- Development now uses `.next-dev`; production builds keep `.next`. Test servers
  can set `NEXT_DIST_DIR=.next-test` to avoid touching the running app's files.
- The development page unregisters only this app's existing `/sw.js` worker,
  removes `rakiq-*` caches and reloads once if an old worker controlled the page.
  New worker registration runs only in production.
- Service worker v4 bypasses mutable Next development chunks; only versioned
  Next JS/CSS chunks are eligible for static caching.

The local Next server automatically restarted after the config change. In the
user's Chrome tab, a controlled attempt with deliberately invalid test
credentials then showed `Влизане…` followed by `Невалиден имейл или парола.`.
This verifies that the submit handler and Auth request run again. Test fields
were cleared and the user was invited to sign in with their actual credentials.
No password was changed as part of this follow-up.
