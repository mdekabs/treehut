
import { emailQueue, generateShipmentShippedEmail, generateShipmentDeliveredEmail } from './index.js';

// Utility function to schedule email notifications
const scheduleEmail = (email, subject, message, delay) => {
  emailQueue.add({ to: email, subject, text: message }, { delay });
};

const scheduleShipmentEmails = (email, trackingNumber) => {
  // Schedule shipment in transit email
  const shippedEmail = generateShipmentShippedEmail(trackingNumber);
  scheduleEmail(email, shippedEmail.subject, shippedEmail.message, 60 * 60 * 1000); // 1 hour later

  // Schedule shipment delivered email
  const deliveredEmail = generateShipmentDeliveredEmail(trackingNumber);
  scheduleEmail(email, deliveredEmail.subject, deliveredEmail.message, 2 * 60 * 60 * 1000); // 2 hours later
};

export { scheduleShipmentEmails };
