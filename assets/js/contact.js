import { populateFormAgencyValues } from './populate_contact_form_agency.js';

// Note: CORS issues seem to persist.

const handleContactForm = () => {
  const elements = {
    form: document.getElementById('contact-us-form'),
    submitButton: document.querySelector(
      'button[type="submit"].usa-button.usa-button--big.usa-button--wide',
    ),
    captcha: document.getElementById('g-recaptcha-response'),
    description: document.getElementById('description'),
    messages: {
      success: document.getElementById('form-success-wrapper'),
      pii: document.getElementById('pii-warning'),
      captchaError: document.getElementById('captcha-error-message'),
    },
  };

  const setVisible = (element, show = true) => {
    if (!element) {
      return;
    }

    element.classList[show ? 'remove' : 'add']('display-none');
  };

  const hasPII = (text) => Boolean(text.match(/\d{4,}/));

  const validateSubmission = () => {
    setVisible(elements.messages.captchaError, false);
    setVisible(elements.messages.pii, false);

    const debug = Array.prototype.slice.apply(document.getElementsByName('debug'))[0];
    if (debug && +debug.value) {
      console.log('debug mode true');
      return true;
    }

    if (!elements.captcha || !elements.captcha.value) {
      // review this logic
      elements.messages.captchaError.textContent = elements.messages.captchaError.dataset.error;
      setVisible(elements.messages.captchaError, true);
      return false;
    }

    if (hasPII(elements.description.value)) {
      setVisible(elements.messages.pii, true);
      return false;
    }
    return true;
  };

  // Note: temporary odd name while testing different payloads
  const submitFormFormData = async (formData) => {
    const response = await fetch(elements.form.action, {
      method: elements.form.method,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Submission failed with status: ${response.status}`);
    }

    return response;
  };

  // const submitFormJson = async (formData) => {
  //  const jsonData = {};
  //  formData.forEach((value, key) => {
  //    if (jsonData[key] !== undefined) {
  //      if (!Array.isArray(jsonData[key])) {
  //        jsonData[key] = [jsonData[key]];
  //      }
  //      jsonData[key].push(value);
  //    } else {
  //      jsonData[key] = value;
  //    }
  //  });

  //  const response = await fetch(elements.form.action, {
  //    method: elements.form.method,
  //    headers: {
  //      'Content-Type': 'application/json'
  //    },
  //    body: JSON.stringify(jsonData)
  //  });

  //  if (!response.ok) {
  //    throw new Error(`Submission failed with status: ${response.status}`);
  //  }
  //  return response;
  // };

  elements.description.addEventListener('change', () => {
    setVisible(elements.messages.pii, false);
  });

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      if (elements.submitButton) {
        elements.submitButton.disabled = true;
      }

      if (!validateSubmission()) {
        return;
      }

      // Double check payload is remapped
      if (!window.remapFormValues.call(elements.form)) {
        console.error('Error remapping values');
        return;
      }

      const formData = new FormData(elements.form);
      await submitFormFormData(formData);

      setVisible(elements.messages.success, true);
      setVisible(elements.form, false);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      if (elements.submitButton) {
        elements.submitButton.disabled = false;
      }
    }
  });
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
