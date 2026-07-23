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
   * Each rule receives a container — either the whole form, or (for the
   * signup wizard) a single .form-step div — and returns either null (no
   * error) or { input, message } for the first problem it finds within
   * that container. Scoping to a container is what lets each wizard step
   * validate only its own fields, without the demographic fields on step
   * 2 blocking step 1, or vice versa.
   * ------------------------------------------------------------------- */

  function validateRequiredFields(container) {
    var required = container.querySelectorAll('[required]');
    for (var i = 0; i < required.length; i++) {
      var input = required[i];
      // Checkboxes: .value is just the string that would be SUBMITTED
      // ("on" by default) regardless of checked state — it does not
      // reflect whether the box is actually checked, so a required-but-
      // unchecked checkbox needs its own check rather than isBlank().
      var invalid = input.type === 'checkbox' ? !input.checked : isBlank(input.value);
      if (invalid) {
        var label = input.dataset.label || 'This field';
        return { input: input, message: label + ' is required.' };
      }
    }
    return null;
  }

  function validateEmailField(container) {
    var emailInput = container.querySelector('input[type="email"]');
    if (emailInput && !isBlank(emailInput.value) && !isValidEmail(emailInput.value)) {
      return { input: emailInput, message: 'Enter a valid email address (e.g. name@example.com).' };
    }
    return null;
  }

  function validatePasswordMatch(container) {
    var password = container.querySelector('[data-role="password"]');
    var confirm = container.querySelector('[data-role="password-confirm"]');
    if (password && confirm && password.value !== confirm.value) {
      return { input: confirm, message: 'Passwords do not match.' };
    }
    return null;
  }

  /**
   * Runs the given rules in order against a container, clearing previous
   * errors within it first. Stops at (and reports) the FIRST problem
   * found, per spec: "Block submit, focus first error."
   */
  function runValidation(container, rules) {
    clearAllErrors(container);
    for (var i = 0; i < rules.length; i++) {
      var problem = rules[i](container);
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

  /* ---------------------------------------------------------------------
   * Sign-up wizard: 4 steps inside the one <form>, so nothing is ever
   * destroyed/recreated when moving between them — field values persist
   * automatically. Only this page has steps; login.html has none, so
   * none of this runs there.
   * ------------------------------------------------------------------- */

  var SIGNUP_STEP_RULES = [validateRequiredFields, validateEmailField, validatePasswordMatch];
  var SIGNUP_STEP_LABELS = {
    1: 'Account',
    2: 'Tell Us About You',
    3: 'Shopping Habits',
    4: 'Shopper Preferences'
  };

  function initSignupForm() {
    var form = document.getElementById('signup-form');
    if (!form) {
      return;
    }
    var card = form.closest('.auth-card');
    attachLiveClear(form);

    var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
    var progressSteps = Array.prototype.slice.call(form.querySelectorAll('.form-progress-step'));
    var announceEl = document.getElementById('signup-step-announce');
    var backBtn = document.getElementById('signup-back-btn');
    var nextBtn = document.getElementById('signup-next-btn');
    var submitBtn = document.getElementById('signup-submit-btn');
    var totalSteps = steps.length;
    var currentStep = 1;

    function stepEl(n) {
      return steps[n - 1];
    }

    function render() {
      steps.forEach(function (el) {
        el.hidden = parseInt(el.dataset.step, 10) !== currentStep;
      });

      progressSteps.forEach(function (el) {
        var n = parseInt(el.dataset.progressStep, 10);
        el.classList.toggle('is-current', n === currentStep);
        el.classList.toggle('is-complete', n < currentStep);
      });

      backBtn.classList.toggle('is-invisible', currentStep === 1);

      var isLastStep = currentStep === totalSteps;
      nextBtn.hidden = isLastStep;
      submitBtn.hidden = !isLastStep;

      if (announceEl) {
        announceEl.textContent = 'Step ' + currentStep + ' of ' + totalSteps + ': ' + SIGNUP_STEP_LABELS[currentStep];
      }
    }

    function goToStep(n) {
      currentStep = n;
      render();
    }

    function goToNextStep() {
      var valid = runValidation(stepEl(currentStep), SIGNUP_STEP_RULES);
      if (!valid) {
        return;
      }
      if (currentStep < totalSteps) {
        goToStep(currentStep + 1);
      }
    }

    function goToPrevStep() {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    }

    // Whole-form defense-in-depth check at final submit — steps 1/2's
    // required fields are hidden by then (this form has novalidate, so
    // native browser validation never runs; this JS is the only
    // enforcement there is). If a failing field belongs to a step that
    // isn't currently showing, .focus() on it would otherwise be a silent
    // no-op (elements under a hidden ancestor aren't focusable) — so jump
    // the wizard back to that step first, then show the error and focus.
    function runFinalValidation() {
      clearAllErrors(form);
      for (var i = 0; i < SIGNUP_STEP_RULES.length; i++) {
        var problem = SIGNUP_STEP_RULES[i](form);
        if (problem) {
          var failingStepEl = problem.input.closest('.form-step');
          if (failingStepEl) {
            var failingStep = parseInt(failingStepEl.dataset.step, 10);
            if (failingStep !== currentStep) {
              goToStep(failingStep);
            }
          }
          showFieldError(problem.input, problem.message);
          problem.input.focus();
          return false;
        }
      }
      return true;
    }

    backBtn.addEventListener('click', goToPrevStep);
    nextBtn.addEventListener('click', goToNextStep);

    // Pressing Enter in a text field fires a click on the form's "default
    // button" per the HTML spec — the first type="submit" button in tree
    // order, regardless of whether it's currently visible. Since step 4's
    // real submit button is the only submit-type button in the whole
    // form, Enter on step 1/2/3 would otherwise silently trigger real
    // submission instead of advancing. Intercept Enter globally and drive
    // it off the wizard's own step state instead.
    form.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      event.preventDefault();
      if (currentStep < totalSteps) {
        goToNextStep();
      } else {
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = runFinalValidation();
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

    render();
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
