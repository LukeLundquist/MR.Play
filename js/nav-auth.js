/**
 * MR.Play — header logged-in indicator, shared across every page.
 *
 * On load, checks MRPlaySession (js/session.js). If a session exists,
 * swaps the header's Log In / Sign Up links for a pill showing the
 * visitor's name and a randomized initials avatar — matching whatever
 * this browser tab currently has stored, nothing more. Clicking the pill
 * logs out (clears the session marker) for demo purposes, since there
 * would otherwise be no way to see the logged-out state again without
 * closing the tab.
 *
 * Every page includes the same two markup pieces in its header:
 *   <span class="nav-auth-links">...Log In / Sign Up links...</span>
 *   <button class="nav-user-pill" id="nav-user-pill" hidden>...</button>
 * This script only toggles which one is visible — it never creates or
 * removes the Log In/Sign Up links themselves.
 */

(function () {
  'use strict';

  function render() {
    var linksEl = document.querySelector('.nav-auth-links');
    var pillEl = document.getElementById('nav-user-pill');
    if (!linksEl || !pillEl) {
      return;
    }

    var session = window.MRPlaySession ? window.MRPlaySession.get() : null;

    if (session) {
      linksEl.hidden = true;
      pillEl.hidden = false;

      var nameEl = document.getElementById('nav-user-name');
      var avatarEl = document.getElementById('nav-user-avatar');
      if (nameEl) {
        nameEl.textContent = session.displayName;
      }
      if (avatarEl) {
        avatarEl.textContent = window.MRPlaySession.initials(session.displayName);
        avatarEl.className = 'nav-user-avatar nav-user-avatar--' + (session.avatarColor || 'cyan');
      }
    } else {
      linksEl.hidden = false;
      pillEl.hidden = true;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();

    var pill = document.getElementById('nav-user-pill');
    if (pill) {
      pill.addEventListener('click', function () {
        if (window.MRPlaySession) {
          window.MRPlaySession.clear();
        }
        render();
      });
    }
  });
})();
