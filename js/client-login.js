/**
 * MR.Play — client-login.html page controller.
 *
 * Deliberately separate from js/validation.js: this form has nothing to
 * do with the MR.Play player account/session system (js/session.js).
 * It's a standalone, fake "client sign-in" — on submit it just checks
 * that both fields are filled in, then opens the real, separately-hosted
 * SureTel/EGHub research-results site (CLIENT_RESULTS_URL, js/config.js)
 * in a new tab. Nothing is stored, nothing is verified, and no MR.Play
 * page is returned to afterward — this page is a gateway to somewhere
 * else, not a login that keeps this tab signed in.
 */

(function () {
  'use strict';

  function fieldWrapper(input) {
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
    form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('.form-field.has-error').forEach(function (el) { el.classList.remove('has-error'); });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }

  function isBlank(value) {
    return !value || !value.trim();
  }

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

      var fallback = successEl.querySelector('[data-fallback-link]');
      if (fallback && typeof CLIENT_RESULTS_URL !== 'undefined') {
        fallback.href = CLIENT_RESULTS_URL;
      }
    }
  }

  function initClientLoginForm() {
    var form = document.getElementById('client-login-form');
    if (!form) {
      return;
    }
    var card = form.closest('.auth-card');

    form.addEventListener('input', function (event) {
      var wrapper = fieldWrapper(event.target);
      if (wrapper && wrapper.classList.contains('has-error')) {
        clearFieldError(event.target);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      clearAllErrors(form);
      var problem = validateRequiredFields(form);
      if (problem) {
        showFieldError(problem.input, problem.message);
        problem.input.focus();
        return;
      }

      // Same click gesture, opened synchronously — same popup-blocker
      // discipline as the game Play button in js/games.js.
      if (typeof CLIENT_RESULTS_URL !== 'undefined') {
        window.open(CLIENT_RESULTS_URL, '_blank');
      }

      showSuccessState(card, 'Opening your research results in a new tab…');
    });
  }

  document.addEventListener('DOMContentLoaded', initClientLoginForm);
})();
