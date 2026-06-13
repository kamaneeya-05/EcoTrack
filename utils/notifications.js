const Notification = require('../notificationModel');
const nodemailer = require('nodemailer');

async function createNotification({ recipientEmail, title, message, relatedReport, channel = 'in-app' }) {
  if (!recipientEmail) return null;

  const notification = await Notification.create({
    recipientEmail,
    title,
    message,
    channel,
    relatedReport
  });

  if ((process.env.SMTP_HOST || process.env.EMAIL_HOST) && channel === 'email') {
    try {
      await sendEmail({ to: recipientEmail, subject: title, text: message });
    } catch (err) {
      console.error('Email send failed:', err && err.message ? err.message : err);
      // don't throw; keep notification persisted even if email fails
    }
  }

  return notification;
}

async function sendEmail({ to, subject, text }) {
  // allow either SMTP_* or EMAIL_* environment variables for configuration
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const secure = (process.env.SMTP_SECURE === 'true') || (process.env.EMAIL_SECURE === 'true') || (port === 465);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  const transportOpts = {
    host,
    port,
    secure
  };

  if (user && pass) transportOpts.auth = { user, pass };

  const transporter = nodemailer.createTransport(transportOpts);

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || 'EcoTrack <no-reply@ecotrack.local>',
      to,
      subject,
      text
    });
    console.log('Email sent:', info && info.messageId ? info.messageId : '(no id)');
    return info;
  } catch (err) {
    // provide helpful error message for invalid credentials or host
    console.error('sendEmail error:', err && err.message ? err.message : err);
    throw err;
  }
}

module.exports = { createNotification, sendEmail };
