import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Send a response email to a patient via EmailJS.
 *
 * @param {Object} params
 * @param {string} params.patientName  - Patient's display name
 * @param {string} params.patientEmail - Patient's email address
 * @param {string} params.subject      - Email subject line
 * @param {string} params.message      - The response body text
 * @param {string} params.staffName    - Name of the doctor/nurse who responded
 * @returns {Promise} EmailJS send result
 */
export async function sendPatientEmail({ patientName, patientEmail, subject, message, staffName }) {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('[EmailJS] Missing config — email not sent. Check VITE_EMAILJS_* in .env');
        return null;
    }

    const templateParams = {
        to_name: patientName,
        to_email: patientEmail,
        subject: subject || 'Response to Your Query — TetherX',
        message: message,
        from_name: staffName || 'TetherX Medical Team',
    };

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('[EmailJS] Email sent:', result.status);
    return result;
}
