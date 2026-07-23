/**
 * MR.Play — my-stats.html page controller.
 *
 * Renders the "My Stats" player dashboard from the dummy dataset in
 * js/my-stats-data.js, cross-referencing MRPLAY_GAMES (js/games-data.js)
 * wherever a row needs a real game's title/thumbnail/url. The player's
 * own name/avatar come from MRPlaySession (js/session.js) — nothing in
 * my-stats-data.js is personalized.
 *
 * Gating: my-stats.html's <head> already redirects a signed-out visitor to
 * login.html before this file ever runs (see the inline script there), so
 * by the time DOMContentLoaded fires here, a session is assumed to exist.
 * The one thing that script CAN'T catch is a visitor logging out via the
 * nav pill while already sitting on this page — nav-auth.js only swaps
 * the header, it doesn't know this page's content is gated. This file
 * adds its own listener on the same pill for that one case.
 */

(function () {
  'use strict';

  function escapeHtml(value) {
    // Manual replace, not the div.textContent/innerHTML trick — see
    // games.js for the same fix and why the trick isn't attribute-safe.
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  }

  /* ---------------------------------------------------------------------
   * Player Overview
   * ------------------------------------------------------------------- */

  function renderPlayerOverview(session) {
    setText('results-player-name', session.displayName);

    var avatarEl = document.getElementById('results-player-avatar');
    if (avatarEl) {
      avatarEl.textContent = window.MRPlaySession.initials(session.displayName);
      avatarEl.className = 'nav-user-avatar results-player-avatar nav-user-avatar--' + (session.avatarColor || 'cyan');
    }

    var stats = MRPLAY_PLAYER_STATS;
    setText('stat-games-played', String(stats.gamesPlayed));
    setText('stat-play-time', stats.totalPlayTime);
    setText('stat-last-game', stats.lastGamePlayed + ' — ' + stats.lastGamePlayedDate);
    setText('stat-streak', stats.currentStreak + '-day streak');
  }

  /* ---------------------------------------------------------------------
   * Recent Result
   * ------------------------------------------------------------------- */

  function renderRecentResult() {
    var result = MRPLAY_RECENT_RESULT;
    var game = findGame(result.gameId);
    if (!game) {
      return;
    }

    var mediaEl = document.getElementById('recent-result-media');
    if (mediaEl && game.thumbnail) {
      mediaEl.innerHTML = '<img src="' + escapeHtml(game.thumbnail) + '" alt="' + escapeHtml(game.imageAlt) + '" />';
    }

    setText('recent-result-title', game.title);
    setText('recent-result-score', result.score.toLocaleString());
    setText('recent-result-rank', result.rankLabel);
    setText('recent-result-date', result.dateCompleted);

    var list = document.getElementById('recent-result-decisions');
    if (list) {
      list.innerHTML = result.keyDecisions.map(function (item) {
        return '<li>' + escapeHtml(item) + '</li>';
      }).join('');
    }
  }

  /* ---------------------------------------------------------------------
   * Game History
   * ------------------------------------------------------------------- */

  function renderHistoryRow(entry) {
    var game = findGame(entry.gameId);
    if (!game) {
      return '';
    }

    var isCompleted = entry.status === 'completed';
    var statusClass = isCompleted ? 'status-badge--available' : 'status-badge--in-development';
    var statusLabel = isCompleted ? 'Completed' : 'Previewed';
    var scoreHtml = isCompleted ? escapeHtml(entry.score.toLocaleString()) : '—';

    var replayHtml = '';
    if (isCompleted && game.status === 'available' && game.url) {
      replayHtml = '<button type="button" class="btn btn-secondary btn-small" data-replay-game="' + escapeHtml(game.id) + '">Replay</button>';
    }

    return (
      '<div class="history-row">' +
      '<div class="history-row-game">' +
      '<span class="history-row-title">' + escapeHtml(game.title) + '</span>' +
      '<span class="history-row-category">' + escapeHtml(game.category || '') + '</span>' +
      '</div>' +
      '<span class="status-badge ' + statusClass + '">' + statusLabel + '</span>' +
      '<span class="history-row-score">' + scoreHtml + '</span>' +
      '<span class="history-row-date">' + escapeHtml(entry.date) + '</span>' +
      '<span class="history-row-action">' + replayHtml + '</span>' +
      '</div>'
    );
  }

  function renderHistory() {
    var list = document.getElementById('game-history-list');
    if (!list) {
      return;
    }
    list.innerHTML = MRPLAY_GAME_HISTORY.map(renderHistoryRow).join('');

    list.querySelectorAll('[data-replay-game]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var game = findGame(btn.getAttribute('data-replay-game'));
        if (game && game.url) {
          // Same click gesture, opened synchronously — same popup-blocker
          // discipline as games.js's Play button.
          window.open(game.url, '_blank');
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Leaderboards
   * ------------------------------------------------------------------- */

  function renderLeaderboardRow(entry, displayName) {
    var name = entry.isYou ? displayName : entry.name;
    var rowClass = entry.isYou ? 'leaderboard-row leaderboard-row--you' : 'leaderboard-row';
    return (
      '<div class="' + rowClass + '">' +
      '<span class="leaderboard-rank">#' + entry.rank + '</span>' +
      '<span class="leaderboard-name">' + escapeHtml(entry.isYou ? name + ' (You)' : name) + '</span>' +
      '<span class="leaderboard-score">' + entry.score.toLocaleString() + '</span>' +
      '</div>'
    );
  }

  function renderLeaderboards(session) {
    var lb = MRPLAY_LEADERBOARDS;
    setText('lb-overall', '#' + lb.overall.rank + ' of ' + lb.overall.total.toLocaleString() + ' — ' + lb.overall.label);

    var byGameGame = findGame(lb.byGame.gameId);
    setText('lb-by-game', '#' + lb.byGame.rank + ' in ' + (byGameGame ? byGameGame.title : 'this game') + ' — ' + lb.byGame.label);

    setText('lb-weekly', '#' + lb.weekly.rank + ' this week');
    setText('lb-monthly', '#' + lb.monthly.rank + ' this month');

    var topEl = document.getElementById('lb-top-performers');
    if (topEl) {
      topEl.innerHTML = lb.topPerformers.map(function (entry) {
        return renderLeaderboardRow(entry, session.displayName);
      }).join('');
    }

    var friendsEl = document.getElementById('lb-friends');
    if (friendsEl) {
      friendsEl.innerHTML = lb.friends.map(function (entry) {
        return renderLeaderboardRow(entry, session.displayName);
      }).join('');
    }
  }

  /* ---------------------------------------------------------------------
   * Badges & Achievements
   * ------------------------------------------------------------------- */

  function renderBadge(badge) {
    var cardClass = badge.unlocked ? 'badge-card' : 'badge-card badge-card--locked';
    var stateLabel = badge.unlocked ? 'Unlocked' : 'Locked';
    return (
      '<div class="' + cardClass + '">' +
      '<span class="badge-state">' + stateLabel + '</span>' +
      '<h3>' + escapeHtml(badge.title) + '</h3>' +
      '<p>' + escapeHtml(badge.description) + '</p>' +
      '<p class="badge-meta">' + escapeHtml(badge.meta) + '</p>' +
      '</div>'
    );
  }

  function renderBadges() {
    var grid = document.getElementById('badge-grid');
    if (!grid) {
      return;
    }
    grid.innerHTML = MRPLAY_BADGES.map(renderBadge).join('');
  }

  /* ---------------------------------------------------------------------
   * Research Contribution
   * ------------------------------------------------------------------- */

  function renderResearchContribution() {
    var data = MRPLAY_RESEARCH_CONTRIBUTION;
    var game = findGame(data.activityGameId);

    setText('research-studies', String(data.studiesContributed));
    setText('research-sessions', data.sessionsContributed + ' sessions');
    setText('research-activity-type', game ? game.category : '');
    setText('research-impact', data.impactStatement);
    setText('research-purpose-quote', game ? game.researchPurpose : '');

    var historyEl = document.getElementById('research-history-list');
    if (historyEl) {
      historyEl.innerHTML = data.participationHistory.map(function (date) {
        return '<li>Contributed to ' + escapeHtml(game ? game.category : 'research') + ' — ' + escapeHtml(date) + '</li>';
      }).join('');
    }
  }

  /* ---------------------------------------------------------------------
   * Nav-pill logout while already on this gated page
   * ------------------------------------------------------------------- */

  function initLogoutRedirect() {
    var pill = document.getElementById('nav-user-pill');
    if (!pill) {
      return;
    }
    // nav-auth.js's own listener (registered first, in its own
    // DOMContentLoaded handler) already clears the session and re-renders
    // the header. This just adds the page-specific consequence: unlike
    // every other page, my-stats.html has nothing sensible to show once
    // signed out, so it sends the visitor on to login rather than leaving
    // a stale dashboard on screen.
    pill.addEventListener('click', function () {
      window.location.replace('login.html?from=my-stats.html');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var session = window.MRPlaySession ? window.MRPlaySession.get() : null;
    if (!session) {
      // The head-gate script should already have redirected before this
      // ever runs; this is just a defensive no-op if it somehow didn't.
      return;
    }

    renderPlayerOverview(session);
    renderRecentResult();
    renderHistory();
    renderLeaderboards(session);
    renderBadges();
    renderResearchContribution();
    initLogoutRedirect();
  });
})();
