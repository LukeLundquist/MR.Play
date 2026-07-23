/**
 * MR.Play prototype — purely decorative cursor trail.
 *
 * Desktop/fine-pointer only, and skipped entirely for users who prefer
 * reduced motion — both checked once up front, so nothing is wired up
 * at all rather than being hidden with CSS after the fact. Dots are
 * pointer-events:none (see css/style.css) so they can never intercept
 * clicks, form focus, or text selection.
 */

(function () {
  'use strict';

  var isFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isFinePointer || prefersReducedMotion) {
    return;
  }

  var MAX_DOTS = 6;
  var MIN_SPAWN_INTERVAL_MS = 45;
  var FADE_DELAY_MS = 60;
  var REMOVE_DELAY_MS = 500;
  var COLORS = ['cyan', 'violet', 'magenta'];

  var lastSpawn = 0;
  var colorIndex = 0;
  var activeDots = [];

  function spawnDot(x, y) {
    var dot = document.createElement('span');
    dot.className = 'cursor-trail-dot cursor-trail-dot--' + COLORS[colorIndex % COLORS.length];
    colorIndex += 1;
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    document.body.appendChild(dot);
    activeDots.push(dot);

    if (activeDots.length > MAX_DOTS) {
      var oldest = activeDots.shift();
      oldest.remove();
    }

    window.setTimeout(function () {
      dot.classList.add('is-fading');
    }, FADE_DELAY_MS);

    window.setTimeout(function () {
      dot.remove();
      var idx = activeDots.indexOf(dot);
      if (idx !== -1) {
        activeDots.splice(idx, 1);
      }
    }, REMOVE_DELAY_MS);
  }

  document.addEventListener('mousemove', function (event) {
    var now = Date.now();
    if (now - lastSpawn < MIN_SPAWN_INTERVAL_MS) {
      return;
    }
    lastSpawn = now;
    spawnDot(event.clientX, event.clientY);
  });
})();
