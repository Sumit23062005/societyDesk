const statusChangeTemplate = ({ residentName, complaintTitle, previousStatus, newStatus, note }) => `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">Complaint Status Update</h2>
      </div>
      <div style="padding: 24px;">
        <p>Hi ${residentName},</p>
        <p>The status of your complaint <strong>"${complaintTitle}"</strong> has been updated.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e0e0e0;"><strong>Previous Status</strong></td>
            <td style="padding: 8px; border: 1px solid #e0e0e0;">${previousStatus || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e0e0e0;"><strong>New Status</strong></td>
            <td style="padding: 8px; border: 1px solid #e0e0e0; color: #2c3e50; font-weight: bold;">${newStatus}</td>
          </tr>
          ${note ? `<tr><td style="padding: 8px; border: 1px solid #e0e0e0;"><strong>Note</strong></td><td style="padding: 8px; border: 1px solid #e0e0e0;">${note}</td></tr>` : ''}
        </table>
        <p>You can log in to the Society Maintenance Tracker portal to view more details.</p>
        <p style="margin-top: 24px; color: #888; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
</html>
`;

const noticeTemplate = ({ residentName, noticeTitle, noticeDescription }) => `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #c0392b; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">Important Notice</h2>
      </div>
      <div style="padding: 24px;">
        <p>Hi ${residentName},</p>
        <p>A new important notice has been posted by the society administration:</p>
        <h3 style="color: #2c3e50;">${noticeTitle}</h3>
        <p style="white-space: pre-line;">${noticeDescription}</p>
        <p style="margin-top: 24px; color: #888; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
</html>
`;

module.exports = { statusChangeTemplate, noticeTemplate };
