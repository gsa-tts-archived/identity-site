import { populateFormAgencyValues } from './populate_contact_form_agency.js';

// Note: The Salesforce endpoint doesn't allow JavaScript requests from different domains due to CORS,
// unlike the Zendesk endpoint seen in /partners/contact.js.
//
// At the moment this approach uses traditional form submission due to testing difficulties.
// The style will likely change.

const handleContactForm = () => {
  const elements = {
    form: document.getElementById('contact-us-form-wrapper'),
    description: document.getElementById('description'),
    messages: {
      success: document.getElementById('form-success-wrapper'),
      pii: document.getElementById('pii-warning'),
      captcha: document.getElementById('captcha-error-message'),
    },
  };

  const setVisible = (element, show = true) =>
    element?.classList[show ? 'remove' : 'add']('display-none');

  const validateSubmission = () => {
    const debug = Array.prototype.slice.apply(document.getElementsByName('debug'))[0];
    const captcha = document.getElementById('g-recaptcha-response');

    if (!(debug && +debug.value) && !captcha?.value) {
      elements.messages.captcha.textContent = elements.messages.captcha.dataset.error;
      setVisible(elements.messages.captcha, true);
      return false;
    }

    const hasPII = elements.description.value.match(/\d{4,}/);
    elements.messages.pii.hidden = !hasPII;
    return !hasPII;
  };

  elements.description.addEventListener('change', () => {
    elements.messages.pii.hidden = true;
  });

  elements.form.addEventListener('submit', (event) => {
    if (!validateSubmission()) {
      event.preventDefault();
    }
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    setVisible(elements.messages.success, true);
    setVisible(elements.form, false);
  }
};

window.clearCaptchaError = () => {
  const error = document.getElementById('captcha-error-message');
  if (error.textContent) {
    error.textContent = '';
    error.classList.add('display-none');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  handleContactForm();
  populateFormAgencyValues();
});
