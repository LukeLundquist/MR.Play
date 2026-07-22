/**
 * MR.Play prototype — shared client-side validation & simulated handoff.
 *
 * Used by both signup.html and login.html. There is no backend anywhere:
 * this file only checks what the player typed, shows inline errors next to
 * the offending field, and — on a valid submit — shows a brief simulated
 * "success" state before opening GAME_URL (from js/config.js) in a new tab.
 *
 * Nothing here reads or writes localStorage, sessionStorage, or cookies,
 * and nothing here makes a network request of any kind.
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
   * Simulated success + handoff into the game
   * ------------------------------------------------------------------- */

  function openGame(card) {
    // GAME_URL comes from js/config.js (loaded before this file). This is
    // the only function in the whole codebase that reads it. Guarded in
    // case config.js failed to load, so a missing constant shows a visible
    // message instead of silently throwing after the success UI is shown.
    if (typeof GAME_URL === 'undefined') {
      var successEl = card && card.querySelector('.success-state');
      var msgEl = successEl && successEl.querySelector('.success-message');
      if (msgEl) {
        msgEl.textContent = 'Something went wrong loading the game link. Please refresh and try again.';
      }
      return;
    }
    window.open(GAME_URL, '_blank');
  }

  function showSuccessState(card, message) {
    var formEl = card.querySelector('form');
    var successEl = card.querySelector('.success-state');

    if (formEl) {
      formEl.setAttribute('aria-hidden', 'true');
      formEl.classList.add('is-hidden');
    }
    if (successEl) {
      successEl.querySelector('.success-message').textContent = message;
      successEl.classList.add('is-visible');
    }

    // Open the game immediately, synchronously within the same user
    // gesture that triggered submit — delaying this risks browsers (Safari
    // especially) blocking the popup because it no longer looks
    // gesture-triggered. The success message stays on screen regardless.
    // The manual "Continue to the game" link stays as a fallback for
    // browsers that block it anyway — there's no pending timer left to
    // race against, so it can't cause a duplicate tab.
    openGame(card);
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
      if (valid) {
        showSuccessState(card, 'Welcome to MR.Play! Taking you to your first game…');
      }
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
      if (valid) {
        showSuccessState(card, 'Welcome back! Taking you into the game…');
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Fallback link in the success state, in case a popup blocker stops the
   * automatic window.open(). Still just a plain link to GAME_URL — no new
   * behavior, just resilience for browsers that block delayed window.open.
   * ------------------------------------------------------------------- */

  function initFallbackLinks() {
    var links = document.querySelectorAll('[data-fallback-link]');
    links.forEach(function (link) {
      link.href = GAME_URL;
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSignupForm();
    initLoginForm();
    initSocialButtons();
    initFallbackLinks();
  });
})();
