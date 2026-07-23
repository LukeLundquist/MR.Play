/**
 * MR.Play prototype — shared client-side validation & simulated handoff.
 *
 * Used by both signup.html and login.html. There is no backend anywhere:
 * this file only checks what the player typed, shows inline errors next to
 * the offending field, marks the visitor "signed in" for this browser tab
 * (js/session.js), and returns them to whichever page they came from —
 * it does NOT open any game. (Games are launched separately, from
 * games.html, once the visitor is recognized as signed in — see js/games.js.)
 *
 * "Which page to return to" is carried as a ?from=<page>.html query param
 * rather than document.referrer, deliberately — referrer comes back empty
 * under file://, which is exactly how this prototype is meant to be run by
 * a non-developer (double-click index.html). Every link that points at
 * these two forms includes ?from=; if a visitor detours from one form to
 * the other before submitting (the "already have an account? Log in"
 * link), that same value is forwarded so it still resolves correctly.
 *
 * The only persistence anywhere is that session-scoped "signed in" marker.
 * No cookies, no localStorage, no network request of any kind.
 */

(function () {
  'use strict';

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------------------------------------------------------------------
   * Small DOM helpers
   * ------------------------------------------------------------------- */

  function fieldWrapper(input) {
    // Errors render inside the field's ".form-field" wrapper so they land
    // directly under that specific input, not in a page-level banner.
    return input.closest('.form-field') || input.parentElement;
  }

  function showFieldError(input, message) {
    var wrapper = fieldWrapper(input);
    wrapper.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');

    var errorEl = wrapper.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'field-error';
      errorEl.setAttribute('role', 'alert');
      wrapper.appendChild(errorEl);
    }
    errorEl.textContent = message;

    if (!input.id) {
      input.id = 'field-' + Math.random().toString(36).slice(2, 9);
    }
    errorEl.id = input.id + '-error';
    input.setAttribute('aria-describedby', errorEl.id);
  }

  function clearFieldError(input) {
    var wrapper = fieldWrapper(input);
    wrapper.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    var errorEl = wrapper.querySelector('.field-error');
    if (errorEl) {
      errorEl.remove();
    }
  }

  function clearAllErrors(form) {
    var errors = form.querySelectorAll('.field-error');
    errors.forEach(function (el) {
      el.remove();
    });
    var wrappers = form.querySelectorAll('.form-field.has-error');
    wrappers.forEach(function (el) {
      el.classList.remove('has-error');
    });
    var invalidInputs = form.querySelectorAll('[aria-invalid="true"]');
    invalidInputs.forEach(function (el) {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }

  function isBlank(value) {
    return !value || !value.trim();
  }

  function isValidEmail(value) {
    return EMAIL_PATTERN.test(value.trim());
  }

  /* ---------------------------------------------------------------------
   * Validation rules
   *
   * Each rule receives the form and returns either null (no error) or
   * { input, message } for the first problem it finds.
   * ------------------------------------------------------------------- */

  function validateRequiredFields(form) {
    var required = form.querySelectorAll('[required]');
    for (var i = 0; i < required.length; i++) {
      var input = required[i];
      if (isBlank(input.value)) {
        var label = input.dataset.label || 'This field';
        return { input: input, message: label + ' is required.' };
      }
    }
    return null;
  }

  function validateEmailField(form) {
    var emailInput = form.querySelector('input[type="email"]');
    if (emailInput && !isBlank(emailInput.value) && !isValidEmail(emailInput.value)) {
      return { input: emailInput, message: 'Enter a valid email address (e.g. name@example.com).' };
    }
    return null;
  }

  function validatePasswordMatch(form) {
    var password = form.querySelector('[data-role="password"]');
    var confirm = form.querySelector('[data-role="password-confirm"]');
    if (password && confirm && password.value !== confirm.value) {
      return { input: confirm, message: 'Passwords do not match.' };
    }
    return null;
  }

  /**
   * Runs the given rules in order against a form, clearing previous errors
   * first. Stops at (and reports) the FIRST problem found, per spec:
   * "Block submit, focus first error."
   */
  function runValidation(form, rules) {
    clearAllErrors(form);
    for (var i = 0; i < rules.length; i++) {
      var problem = rules[i](form);
      if (problem) {
        showFieldError(problem.input, problem.message);
        problem.input.focus();
        return false;
      }
    }
    return true;
  }

  /* ---------------------------------------------------------------------
   * Where to return to after a successful submit
   * ------------------------------------------------------------------- */

  var RETURN_TARGET_PATTERN = /^[a-zA-Z0-9_-]+\.html$/;
  var DEFAULT_RETURN_TARGET = 'index.html';

  function getFromParam() {
    var params = new URLSearchParams(window.location.search);
    var from = params.get('from');
    // Only ever a bare same-directory page name — this is a static
    // same-origin site, so "from" should never be anything else. Guards
    // against an implausible but cheap-to-block open-redirect shape.
    if (from && RETURN_TARGET_PATTERN.test(from)) {
      return from;
    }
    return null;
  }

  function resolveReturnTarget() {
    return getFromParam() || DEFAULT_RETURN_TARGET;
  }

  // The "switch to the other form" link (signup ↔ login) needs to carry
  // the SAME ?from= value forward, so a visitor who detours through both
  // forms still lands back on the page they originally came from — not
  // on whichever auth form they happened to submit from.
  function initCrossLinkForwarding() {
    var from = getFromParam();
    if (!from) {
      return;
    }
    var links = document.querySelectorAll('a[href="signup.html"], a[href="login.html"]');
    links.forEach(function (link) {
      link.href = link.getAttribute('href') + '?from=' + encodeURIComponent(from);
    });
  }

  /* ---------------------------------------------------------------------
   * Simulated success — mark this tab signed in, then return the visitor
   * to where they came from. No game is opened here.
   * ------------------------------------------------------------------- */

  function showSuccessState(card, message, returnTarget) {
    var formEl = card.querySelector('form');
    var successEl = card.querySelector('.success-state');

    if (formEl) {
      formEl.setAttribute('aria-hidden', 'true');
      formEl.classList.add('is-hidden');
    }
    if (successEl) {
      successEl.querySelector('.success-message').textContent = message;
      successEl.classList.add('is-visible');

      // Manual fallback in case the timed redirect below doesn't fire for
      // some reason (e.g. a script error elsewhere on the page) — same-tab
      // navigation, so no popup-blocker concerns the way window.open had.
      var fallback = successEl.querySelector('[data-fallback-link]');
      if (fallback) {
        fallback.href = returnTarget;
      }
    }

    // Brief pause so the welcome message is actually readable before the
    // page navigates away. This is same-tab navigation (not window.open),
    // so — unlike the old game-launch flow — there's no popup-blocker
    // reason this has to be synchronous with the click.
    window.setTimeout(function () {
      window.location.href = returnTarget;
    }, 900);
  }

  /* ---------------------------------------------------------------------
   * Wiring: live error clearing as the player fixes a field
   * ------------------------------------------------------------------- */

  function attachLiveClear(form) {
    form.addEventListener('input', function (event) {
      var wrapper = fieldWrapper(event.target);
      if (wrapper && wrapper.classList.contains('has-error')) {
        clearFieldError(event.target);
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Cosmetic-only social-connect buttons
   *
   * No network call, no navigation, no OAuth — just a brief inline note
   * confirming the click registered, exactly as scoped in the spec.
   * ------------------------------------------------------------------- */

  function initSocialButtons() {
    var buttons = document.querySelectorAll('[data-social-button]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var note = btn.parentElement.querySelector('.social-note');
        if (!note) {
          return;
        }
        note.textContent = 'Preview only — ' + btn.dataset.socialButton + ' sign-in isn’t wired up yet.';
        note.classList.add('is-visible');
        window.clearTimeout(btn._noteTimeout);
        btn._noteTimeout = window.setTimeout(function () {
          note.classList.remove('is-visible');
        }, 2500);
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Page wiring
   * ------------------------------------------------------------------- */

  function initSignupForm() {
    var form = document.getElementById('signup-form');
    if (!form) {
      return;
    }
    var card = form.closest('.auth-card');
    attachLiveClear(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = runValidation(form, [
        validateRequiredFields,
        validateEmailField,
        validatePasswordMatch
      ]);
      if (!valid) {
        return;
      }

      var nameInput = form.querySelector('[name="name"]');
      var displayName = nameInput ? nameInput.value.trim() : '';

      if (window.MRPlaySession) {
        window.MRPlaySession.set(displayName);
      }

      var message = 'Welcome, ' + displayName + '! You’re all set.';
      showSuccessState(card, message, resolveReturnTarget());
    });
  }

  function initLoginForm() {
    var form = document.getElementById('login-form');
    if (!form) {
      return;
    }
    var card = form.closest('.auth-card');
    attachLiveClear(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = runValidation(form, [validateRequiredFields]);
      if (!valid) {
        return;
      }

      var identifierInput = form.querySelector('[name="identifier"]');
      var identifier = identifierInput ? identifierInput.value.trim() : '';

      // No backend exists, so there is no prior registration record to
      // look up — the welcome message uses exactly what's currently typed
      // in this field, never a fabricated or "remembered" Full Name.
      if (window.MRPlaySession) {
        window.MRPlaySession.set(identifier);
      }

      var message = 'Welcome back, ' + identifier + '!';
      showSuccessState(card, message, resolveReturnTarget());
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCrossLinkForwarding();
    initSignupForm();
    initLoginForm();
    initSocialButtons();
  });
})();
