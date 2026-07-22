/**
 * MR.Play prototype configuration.
 *
 * GAME_URL is the ONLY place the destination game URL is allowed to appear
 * anywhere in this codebase. When the real MR.Play game URL is ready
 * (expected 2026-07-22), swap the placeholder string below and every page
 * that hands players off into the game will pick it up automatically.
 *
 * Do not import this with ES module `import`/`export` syntax — this file
 * is loaded with a plain <script src="js/config.js"></script> tag so the
 * site keeps working when opened directly from disk (file://), where
 * browsers block module-script loading.
 */
const GAME_URL = 'https://example.com/mrplay-game-placeholder';
