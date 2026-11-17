# Gainz Workout Tracker

A workout app for a personal trainer and their clients. The trainer builds workouts and multi-week programs, sets 1-rep maxes and manages an exercise library. Clients open the app on their phone, log sets with rest timers and RPE, track progress and personal records, and share wins in a community feed.

It is a plain HTML, CSS and JavaScript web app (no build step). Data and sign-in run on [Supabase](https://supabase.com).

## How it works for people

- **The trainer** signs in with their email and sees everything: clients, programs, templates, the exercise library and the community.
- **A client** is added by the trainer with their email. The trainer copies an invite message from the client's page and sends it by text or email. The client opens the link, types their email, and gets a sign-in link (and a 6-digit code) by email. No password and no app store download.
- **Each client sees only their own** workouts, programs, progress and settings, plus the shared exercise library and community feed. This is enforced in the database (row-level security), not just hidden in the screens.
- **Anyone else** who signs in sees nothing until the trainer adds their email to a client.

## Project layout

```
index.html               page shell; loads the files below
css/app.css              all styles (light and dark themes, phone and desktop)
js/config.js             your Supabase URL and public key (empty = demo mode)
js/exercise-library.js   the starter exercise library (data only)
js/store-supabase.js     sign-in and the data layer on Supabase
js/app.js                screens and app logic
supabase/schema.sql      database tables, access rules and live updates
supabase/tests/          access-rule tests you can run against Postgres
docs/SECURITY.md         privacy and security notes for client fitness data
```

## Demo mode

With `js/config.js` left empty the app runs exactly like the original prototype: no sign-in, a "view as" switcher at the top, and data kept only in that browser. Open `index.html` through any local web server, for example:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Going live (about 20 minutes)

### 1. Create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (the free plan is fine to start).
2. Open **SQL Editor > New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and **change `trainer@example.com` to the trainer's own email** (the line marked `TRAINER EMAIL`). Click **Run**.
3. Open **Project Settings > API** and copy the **Project URL** and the **anon public** key into [`js/config.js`](js/config.js). Never use the `service_role` key in the app.

### 2. Set up sign-in emails

1. **Authentication > Sign In / Providers > Email**: keep Email enabled. Passwords are not used.
2. **Authentication > Email Templates > Magic Link**: add the code so clients can type it if the link opens in the wrong browser, for example:
   `<p>Your Gainz sign-in code is <b>{{ .Token }}</b></p>` next to the existing link.
3. **Custom email sender (recommended before inviting clients):** Supabase's built-in email is only for testing and sends a few emails an hour. On the **SMTP Settings** page in the Authentication section, connect a sending service such as Resend, Postmark or Amazon SES.

### 3. Put it on the web

Any static host works. Two easy free options that work with a private GitHub repo:

- **Netlify** or **Vercel**: "Import from GitHub", pick this repo, no build command, publish directory `/`.
- **Cloudflare Pages**: same idea, framework preset "None".

Then in Supabase, **Authentication > URL Configuration**, set **Site URL** to your live address (for example `https://gainz.netlify.app`) and add it under **Redirect URLs**.

### 4. First sign-in

1. Open the live site and sign in with the trainer email from step 1.
2. Click your name at the top to set the name clients will see.
3. Add a client with their email, then use **Invite** on their page to copy the invite message.

## Testing the access rules

`supabase/tests/rls_test.sql` signs in as the trainer, two clients and a stranger, and checks what each can read and change. To run it against a local Postgres 16:

```
createdb gainz_test
psql -d gainz_test -f supabase/tests/supabase_stub.sql   # minimal stand-in for Supabase's auth schema
psql -d gainz_test -f supabase/schema.sql
psql -d gainz_test -f supabase/tests/rls_test.sql
```

Lines marked `expect error` should fail with "not allowed" or a row-level security error.

## Moving data from the Claude prototype

The prototype stored its data inside the Claude artifact. If it holds real client data you want to keep, ask Claude to export it and load it into the `docs` table: the shapes are the same (one row per document, keyed by collection and id).
