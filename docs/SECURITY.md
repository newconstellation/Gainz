# Security and privacy notes

Gainz holds personal fitness data about real people: names, emails, goals, workouts, lifts and notes. This page records how the app protects it and what is still to do before inviting many clients. It is practical guidance, not legal advice.

## What the app does

- **Passwordless sign-in.** Clients and the trainer sign in with a one-time link or code sent to their email (Supabase Auth). There are no passwords to leak or reuse.
- **Access enforced in the database.** Every read and write goes through Postgres row-level security (`supabase/schema.sql`). A client can only read their own client record, workouts and programs, plus the shared exercise library and community feed. The screens hiding other clients is not what keeps them private; the database refuses to return them.
- **Clients can't change what isn't theirs.** A database trigger stops a client from reassigning a workout to someone else, posting as someone else, pinning posts, or changing their own sign-in email or name. Only the trainer can edit templates, the exercise library and settings.
- **Unknown emails get nothing.** Anyone can request a sign-in email, but a signed-in person whose email isn't on a client record sees an empty app.
- **Public key only.** `js/config.js` holds the Supabase *anon* key, which is designed to be public. The `service_role` key must never be added to this repo or the app.
- **No third-party trackers.** The app loads Google Fonts and the Supabase library from a CDN, and embeds YouTube, Vimeo, Spotify or Apple Music only when someone adds a link. There is no analytics or advertising code. Keep it that way unless clients are told and agree (see below).
- **Input limits.** Names, emails, goals and community posts have length limits in the app, and the database rejects unknown collections, malformed ids and oversized documents.

## Before inviting a lot of clients

1. **Privacy policy.** Write a short page saying what you collect (name, email, workouts, notes), why, who can see it (the trainer; other clients see only community posts), and how to ask for a copy or deletion. Link it from the sign-in screen.
2. **FTC Health Breach Notification Rule (US).** Since the 2024 update, the FTC treats health and fitness apps that hold personal health data as covered, including when data is shared without permission. If client data is ever exposed or shared without consent, you may need to notify affected clients and the FTC. The simplest protection: don't add analytics, ad pixels or other third-party scripts that could send client data elsewhere.
3. **HIPAA** generally does not apply to an independent personal trainer, but it can if you work under a medical practice or physical therapist. Check before handling medical records in notes.
4. **Custom email sender.** Set up SMTP (README, step 2) so sign-in emails come from your own domain and aren't rate-limited.
5. **Backups.** Supabase's free plan pauses inactive projects and has limited backups. Before relying on it for paying clients, consider the Pro plan (daily backups) or a scheduled export.
6. **Removing a client.** The app doesn't have a "remove client" button yet. To cut off someone's access right away, delete their user under **Authentication > Users** in Supabase (this also removes their link to the client record), and change the email on their client record so they can't sign back in. To delete their data, remove their rows from the `docs` table in the Supabase Table Editor.

## Sources used

- Supabase: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [RLS performance](https://supabase.com/docs/guides/database/postgres/row-level-security-performance) (policies wrap `auth.uid()` in `select` and use indexed columns), [passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- FTC Health Breach Notification Rule, final rule: [Federal Register, May 30, 2024](https://www.federalregister.gov/documents/2024/05/30/2024-10855/health-breach-notification-rule)
- How established coaching apps onboard clients (email invite, client sees only their own program): [TrueCoach help center](https://help.truecoach.co/en/articles/3889427-creating-an-onboarding-sequence), [Trainerize vs TrueCoach](https://www.trainerize.com/blog/trainerize-vs-truecoach-personal-trainers/)
