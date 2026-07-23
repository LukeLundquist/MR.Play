/**
 * MR.Play prototype configuration.
 *
 * GAME_URL is the ONLY place the destination game URL is allowed to appear
 * anywhere in this codebase. This is a preliminary game build (2026-07-22)
 * and may change later — when it does, swap the string below and every
 * page that hands players off into the game picks it up automatically.
 *
 * CLIENT_RESULTS_URL is the same idea for the separate, client-facing
 * SureTel/EGHub research-results site — the only place that URL is allowed
 * to appear. It's a fully separate destination from GAME_URL/the MR.Play
 * player experience; see client-login.html and js/client-login.js.
 *
 * Do not import this with ES module `import`/`export` syntax — this file
 * is loaded with a plain <script src="js/config.js"></script> tag so the
 * site keeps working when opened directly from disk (file://), where
 * browsers block module-script loading.
 */
const GAME_URL = 'https://gravity-well-erevna.netlify.app/';
const CLIENT_RESULTS_URL = 'https://gravity-well-insights.netlify.app';
