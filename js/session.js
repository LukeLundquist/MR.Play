/**
 * MR.Play — session-scoped "signed in" marker.
 *
 * Wraps sessionStorage for exactly one thing: remembering that this visitor
 * completed signup/login earlier in the current browser tab, so:
 *   - every page's header can show a logged-in pill (name + avatar) instead
 *     of Log In / Sign Up (see js/nav-auth.js)
 *   - games.html can skip the auth prompt on a later Play click
 *
 * This is explicitly NOT real authentication — it's lost when the tab or
 * browser closes, nothing is verified, and it exists only so the demo
 * doesn't ask twice in one visit.
 *
 * Wrapped in try/catch: Safari private browsing and storage-blocking
 * extensions can make sessionStorage throw rather than just return null.
 * If that happens, the site degrades to "always logged out" — never breaks.
 */

var MRPlaySession = (function () {
  'use strict';

  var STORAGE_KEY = 'mrplay_session_user';
  var AVATAR_COLORS = ['cyan', 'violet', 'magenta', 'green'];

  function get() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed.displayName === 'string' && parsed.displayName) {
        return parsed;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  function set(displayName) {
    try {
      var avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ displayName: displayName, avatarColor: avatarColor })
      );
    } catch (err) {
      // Storage unavailable — non-fatal, see file header.
    }
  }

  function clear() {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // Storage unavailable — nothing to clear.
    }
  }

  // Shared with nav-auth.js (header pill) and results.js (Player
  // Overview avatar) so both render the exact same initials for a given
  // display name.
  function initials(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) {
      return '?';
    }
    var parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  return { get: get, set: set, clear: clear, initials: initials };
})();
