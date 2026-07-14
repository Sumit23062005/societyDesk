require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('🧪 Testing Brevo SMTP Connection...\n');
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP Connection: SUCCESS\n');

    // Send test email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'testuser@example.com',
      subject: 'Society Maintenance Tracker - Test Email',
      html: `
        <h2>Test Email from Society Maintenance Tracker</h2>
        <p>If you received this, email service is working correctly!</p>
        <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Email Sent: SUCCESS');
    console.log(`   Message ID: ${result.messageId}\n`);
    
    console.log('📧 Email Details:');
    console.log(`   From: ${process.env.EMAIL_FROM}`);
    console.log(`   To: testuser@example.com`);
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}\n`);

    console.log('✅ All systems operational!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verify EMAIL_USER is your Brevo login email');
    console.error('   2. Verify EMAIL_PASS is your SMTP Key (not password)');
    console.error('   3. Verify the sender email is verified in Brevo');
    console.error('   4. Check Brevo settings: SMTP & API\n');
  }

  process.exit(0);
};

testEmail();
