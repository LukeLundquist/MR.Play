# MR.Play — Landing, Registration & Login Prototype

This is a demo prototype of the MR.Play "front door": a branded landing page, a
sign-up form, and a log-in form that hand a player off into the real MR.Play
game. There is no real backend — no account database, no real authentication.
Every "success" you see is simulated on the spot, and nothing you type is
saved anywhere (not even in your browser).

## Running it locally (no developer needed)

1. Find this folder on your computer (`MR.Play`).
2. Double-click `index.html`. It will open in your default web browser.
3. Click around normally — Sign Up, fill out the form, submit it; Log In,
   fill it out, submit it. Both will briefly show a success message and then
   open a new browser tab pointing at the game.

That's it — no install, no server, no command line required.

## About the game link

Right now the "game" link is a **placeholder** (`https://example.com/mrplay-game-placeholder`),
since the real MR.Play game URL isn't available yet. It lives in exactly one
place in the whole project:

```
js/config.js
```

When the real game URL is ready, only that one line needs to change — nothing
else in the site needs to be touched.

## What's simulated vs. real

- **Real:** the branding, the layout, the form fields, the validation
  (required fields, email format, matching passwords), the redirect
  mechanism itself.
- **Simulated:** account creation and login. There's no real password check,
  no real account, and no data is stored anywhere. The "Continue with
  Google / Facebook" buttons are cosmetic only — they don't connect to
  Google or Facebook.

## Deploying (Netlify)

Deployment instructions will be provided separately when it's time to put
this online — no action needed here for now.

## Folder structure

```
index.html        Landing page
signup.html        Registration form
login.html          Login form
css/style.css        Shared styling
js/config.js          The one place the game URL lives
js/validation.js      Form validation + simulated success + redirect
assets/logo.png        Erevna / MR.Play logo
```
