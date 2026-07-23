# MR.Play — Landing, Games, Registration & Login Prototype

This is a demo prototype of the MR.Play "front door": a branded landing page,
a public Games page, a sign-up form, and a log-in form. There is no real
backend — no account database, no real authentication, no real credential
check. Every "success" you see is simulated on the spot, and nothing you
type is permanently stored anywhere (see "Session state," below, for the
one deliberate, temporary exception).

## Running it locally (no developer needed)

1. Find this folder on your computer (`MR.Play`).
2. Double-click `index.html`. It will open in your default web browser.
3. Click around normally:
   - **Games** (in the header) — browse the game portfolio. Anyone can look
     around here without an account.
   - Click **Play** on an available game. If you're not "signed in" yet
     this browser session, you'll be asked to Sign Up or Log In first.
   - Fill out either form and submit it. You'll briefly see a personalized
     welcome message, then land back on whichever page you came from —
     the header now shows you as signed in (your name/username + a colored
     initials avatar) instead of Log In / Sign Up.
   - Click **Play** again (same or a different available game) — it opens
     directly this time, no form, because this prototype remembers you're
     signed in for the rest of this browser tab.
   - Click your name/avatar in the header to log out again (a demo
     convenience — see "Session state" below).

That's it — no install, no server, no command line required.

## About the game links

Each game's launch URL lives in exactly one place:

- The one currently-real game (**Gravity Well**) has its URL defined once,
  as `GAME_URL`, in `js/config.js`.
- The full game portfolio — titles, descriptions, thumbnails, status, and
  which URL each one uses — lives in `js/games-data.js`. The one real entry
  references `GAME_URL` rather than repeating it, so `config.js` stays the
  single place any actual game URL is typed.

Signing up or logging in never opens a game by itself — it only marks the
visitor "signed in" for this browser tab and returns them to whichever page
they came from. Games are only launched from the **Games** page, by
clicking Play on a specific one.

## Updating the game portfolio (no code changes needed)

Open `js/games-data.js`. It's one array, `MRPLAY_GAMES`, of plain objects —
add, edit, reorder, or delete entries directly, save the file, refresh the
page. Each entry:

| Field | What it does |
|---|---|
| `id` | Short, unique, URL-safe (used internally to track which game was picked) |
| `title` | Shown on the card |
| `description` | One to two sentences, shown on the card |
| `thumbnail` | Optional image path. Leave `null` for a card with no art yet — it renders a branded placeholder instead of a broken image |
| `imageAlt` | Required whenever `thumbnail` is set — real descriptive alt text, never a filename |
| `isConceptArt` | `true` if the image is early concept/mockup art rather than a real screenshot — shows a "Concept Preview" badge on the card |
| `url` | Where "Play" sends the player. Use `null` for a game that isn't launchable yet |
| `status` | `'available'`, `'coming-soon'`, or `'in-development'` |
| `buttonLabel` | Text on the card's button |
| `category` | Optional short tag, e.g. `"Preference Mapping"` |
| `researchPurpose` | Optional one-line note on what the gameplay contributes to — keep it general, never overclaim what's tracked or how |

**Current portfolio:** Gravity Well is the only available/deployed game.
Breakfast Tycoon, Stormfront, and Temple Trail are real games from Erevna's
design briefs (`MR.PlayGames/`), marked "In Development" — none has a
deployed build yet, so all three use concept art labeled "Concept Preview"
on their cards rather than being presented as final screenshots.

Optimized card images live in `assets/games/` (resized/cropped copies —
the original source files in `MR.PlayGames/` are untouched reference
material, not meant to be linked directly from the site).

## Session state (the one thing that *is* remembered)

To avoid asking the same visitor to sign up or log in more than once in a
visit, this prototype remembers **that a form was completed**, for the
current browser tab only — not a verified identity, and nothing checked
against a real account. This uses `sessionStorage`, which:

- Is **not** a real login session — there's no backend to check a password
  against, and nothing here proves who anyone actually is.
- Powers two things: the header's logged-in pill (name + a randomly
  assigned colored avatar, chosen fresh each time someone signs up/logs
  in), and skipping the auth prompt on a second Play click.
- Is scoped to the current browser tab and clears itself when the tab or
  browser closes. Clicking the header pill also clears it immediately —
  that's a demo convenience so you can see the logged-out state again
  without closing the tab; a real product wouldn't need a "log out" button
  quite this prominent.
- May behave inconsistently in private/incognito windows or if a browser
  extension blocks storage — the site is written to degrade gracefully if
  that happens (it just asks again), never breaks.
- Is never sent anywhere — it stays entirely in your browser.

Nothing else is stored: not the demographic fields, not passwords, not
your name or email beyond that one session-scoped, front-end-only marker.

## Returning to the right page after signing in

After a successful signup/login, the visitor lands back on the page they
came from — the Games page if they clicked Play there, the landing page if
they clicked Sign Up/Log In from the header, etc. This is carried as a
`?from=<page>.html` link parameter rather than the browser's built-in
"referrer," deliberately: referrers come back empty when a page is opened
via `file://` (exactly how this prototype is meant to be run — see
"Running it locally," above), so relying on it would silently break for
the primary way anyone actually opens this site.

## What's simulated vs. real

- **Real:** the branding, the layout, the form fields, the validation
  (required fields, email format, matching passwords), the game portfolio
  and its status states, the redirect mechanism itself.
- **Simulated:** account creation and login. There's no real password
  check, no real account, and no permanent data storage. The welcome
  message after signup uses whatever you typed into the Full Name field
  that moment — it is not a saved user record. The welcome message after
  login uses whatever you typed into the Username/Email field — this
  prototype cannot look up a name from an earlier signup, because nothing
  is actually stored between visits. The "Continue with Google / Facebook"
  buttons are cosmetic only — they don't connect to Google or Facebook.

## Deploying (Netlify)

Deployment instructions will be provided separately when it's time to put
this online — no action needed here for now.

## Folder structure

```
index.html            Landing page
games.html             Public game portfolio + launch-time auth gate
signup.html             Registration form
login.html               Login form
css/style.css              Shared styling
js/config.js                The one place GAME_URL (the default game) lives
js/games-data.js             The game portfolio — edit this to add/change games
js/session.js                 "Signed in this browser tab" helper
js/nav-auth.js                 Renders the header's logged-in pill on every page
js/games.js                     Games page behavior (cards, auth prompt)
js/validation.js                 Form validation + simulated success + return-to-page
js/effects.js                     Purely decorative cursor-trail effect
assets/icon.png                    Erevna / MR.Play icon mark
assets/favicon.png                  Browser-tab icon
assets/games/                        Optimized card images (source: MR.PlayGames/)
MR.PlayGames/                          Reference briefs + source art for each game (not linked directly from the site)
```
