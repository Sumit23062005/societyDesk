const transporter = require('../config/mailer');
const { statusChangeTemplate, noticeTemplate } = require('../utils/emailTemplates');

// Generic sender. Failures are logged but never thrown further up,
// so email delivery issues never block the underlying API operation.
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
  }
};

const sendStatusChangeEmail = async ({ resident, complaint, previousStatus, note }) => {
  const html = statusChangeTemplate({
    residentName: resident.name,
    complaintTitle: complaint.title,
    previousStatus,
    newStatus: complaint.status,
    note
  });

  await sendEmail({
    to: resident.email,
    subject: `Complaint Update: ${complaint.title}`,
    html
  });
};

const sendNoticeEmail = async ({ resident, notice }) => {
  const html = noticeTemplate({
    residentName: resident.name,
    noticeTitle: notice.title,
    noticeDescription: notice.description
  });

  await sendEmail({
    to: resident.email,
    subject: `Important Notice: ${notice.title}`,
    html
  });
};

module.exports = { sendEmail, sendStatusChangeEmail, sendNoticeEmail };
