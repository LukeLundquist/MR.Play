/**
 * MR.Play — games.html page controller.
 *
 * Renders the game portfolio from MRPLAY_GAMES (js/games-data.js), and
 * gates launching an available game behind the auth-prompt modal unless
 * this visitor already completed signup/login earlier in the current tab
 * (MRPlaySession, js/session.js) — in which case Play opens the game
 * directly.
 *
 * No account/credential logic lives here — that's entirely in
 * validation.js. Signing up or logging in no longer auto-opens a game;
 * it returns the visitor to this page (via ?from=games.html) with the
 * header now showing them as signed in, and Play works normally from
 * there.
 */

(function () {
  'use strict';

  var STATUS_LABELS = {
    'available': 'Available',
    'coming-soon': 'Coming Soon',
    'in-development': 'In Development'
  };

  var PLACEHOLDER_THUMB_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M4 14l6-6 10 10"/></svg>';

  var lastFocusedTrigger = null;

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */

  function escapeHtml(value) {
    // Manual replace, not the div.textContent/innerHTML trick — that trick
    // only escapes what's needed for TEXT NODES (&, <, >) and leaves
    // quote characters untouched, which silently corrupts HTML when the
    // value is placed inside an attribute (e.g. alt="...") rather than
    // between tags. Several of this file's real alt-text strings contain
    // literal quotes, so this needs the full attribute-safe escape set.
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderThumb(game) {
    if (game.thumbnail) {
      var badge = game.isConceptArt
        ? '<span class="concept-art-badge">Concept Preview</span>'
        : '';
      return (
        '<div class="game-card-thumb">' +
        '<img src="' + escapeHtml(game.thumbnail) + '" alt="' + escapeHtml(game.imageAlt) + '" />' +
        badge +
        '</div>'
      );
    }
    return '<div class="game-card-thumb">' + PLACEHOLDER_THUMB_SVG + '</div>';
  }

  function renderCard(game) {
    var isAvailable = game.status === 'available' && !!game.url;
    var statusClass = 'status-badge--' + game.status;
    var statusLabel = STATUS_LABELS[game.status] || game.status;
    var categoryHtml = game.category ? '<p class="game-card-category">' + escapeHtml(game.category) + '</p>' : '';
    var purposeHtml = game.researchPurpose
      ? '<p class="game-card-purpose">' + escapeHtml(game.researchPurpose) + '</p>'
      : '';

    var buttonHtml = isAvailable
      ? '<button type="button" class="btn btn-primary" data-play-game="' + escapeHtml(game.id) + '">' + escapeHtml(game.buttonLabel || 'Play Now') + '</button>'
      : '<button type="button" class="btn btn-primary" disabled>' + escapeHtml(game.buttonLabel || statusLabel) + '</button>';

    return (
      '<article class="game-card" id="game-' + escapeHtml(game.id) + '">' +
      renderThumb(game) +
      '<div class="game-card-body">' +
      '<div class="game-card-header">' +
      '<div><p class="game-card-title">' + escapeHtml(game.title) + '</p>' + categoryHtml + '</div>' +
      '<span class="status-badge ' + statusClass + '">' + escapeHtml(statusLabel) + '</span>' +
      '</div>' +
      '<p class="game-card-desc">' + escapeHtml(game.description) + '</p>' +
      purposeHtml +
      '<div class="game-card-footer">' + buttonHtml + '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function renderGrid() {
    var grid = document.getElementById('game-grid');
    if (!grid || typeof MRPLAY_GAMES === 'undefined') {
      return;
    }
    grid.innerHTML = MRPLAY_GAMES.map(renderCard).join('');

    grid.querySelectorAll('[data-play-game]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handlePlayClick(btn, btn.getAttribute('data-play-game'));
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Play button behavior
   * ------------------------------------------------------------------- */

  function findGame(id) {
    if (typeof MRPLAY_GAMES === 'undefined') {
      return null;
    }
    for (var i = 0; i < MRPLAY_GAMES.length; i++) {
      if (MRPLAY_GAMES[i].id === id) {
        return MRPLAY_GAMES[i];
      }
    }
    return null;
  }

  function handlePlayClick(triggerEl, gameId) {
    var game = findGame(gameId);
    if (!game || game.status !== 'available' || !game.url) {
      return;
    }

    var session = window.MRPlaySession ? window.MRPlaySession.get() : null;

    if (session && session.displayName) {
      showWelcomeBack(session.displayName, game.title);
      // Same click gesture, opened synchronously — same popup-blocker
      // discipline as validation.js's showSuccessState.
      window.open(game.url, '_blank');
      return;
    }

    openAuthModal(triggerEl, game);
  }

  function showWelcomeBack(displayName, gameTitle) {
    var el = document.getElementById('games-welcome-back');
    if (!el) {
      return;
    }
    el.textContent = 'Welcome back, ' + displayName + '! Opening ' + gameTitle + '…';
    el.classList.add('is-visible');
  }

  /* ---------------------------------------------------------------------
   * Auth-prompt modal
   * ------------------------------------------------------------------- */

  function openAuthModal(triggerEl, game) {
    var modal = document.getElementById('auth-modal');
    if (!modal) {
      return;
    }

    lastFocusedTrigger = triggerEl;

    document.getElementById('auth-modal-game-title').textContent = game.title;
    document.getElementById('auth-modal-signup').href = 'signup.html?from=games.html';
    document.getElementById('auth-modal-login').href = 'login.html?from=games.html';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('auth-modal-close').focus();

    document.addEventListener('keydown', onModalKeydown);
  }

  function closeAuthModal() {
    var modal = document.getElementById('auth-modal');
    if (!modal) {
      return;
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onModalKeydown);

    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }

  function onModalKeydown(event) {
    if (event.key === 'Escape') {
      closeAuthModal();
    }
  }

  function initModal() {
    var modal = document.getElementById('auth-modal');
    if (!modal) {
      return;
    }
    document.getElementById('auth-modal-close').addEventListener('click', closeAuthModal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeAuthModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderGrid();
    initModal();
  });
})();
