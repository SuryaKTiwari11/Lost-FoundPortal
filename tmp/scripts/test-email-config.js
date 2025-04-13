// Test script to verify email configuration
require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmailConfiguration() {
  console.log("Testing email configuration...");
  console.log("----------------------------");

  // Check if required environment variables exist
  const requiredVars = [
    "EMAIL_SERVICE",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "EMAIL_FROM",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingVars.join(", ")}`
    );
    console.error(
      "Please set these variables in your .env file and try again."
    );
    return false;
  }

  console.log("✅ All required environment variables are present");
  console.log(`📧 Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`📧 User: ${process.env.EMAIL_USER}`);
  console.log(`📧 From: ${process.env.EMAIL_FROM}`);

  // Create email transporter
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection configuration
    console.log("Verifying connection to email server...");
    const verification = await transporter.verify();

    if (verification) {
      console.log("✅ Email server connection successful!");

      // Optionally send a test email
      if (process.argv.includes("--send-test")) {
        const testEmail = process.argv[process.argv.indexOf("--send-test") + 1];

        if (!testEmail || !testEmail.includes("@")) {
          console.error(
            "❌ Please provide a valid email address with the --send-test flag"
          );
          return false;
        }

        console.log(`Sending test email to ${testEmail}...`);

        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: testEmail,
          subject: "Lost & Found Portal - Email Configuration Test",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #222; border-bottom: 1px solid #eee; padding-bottom: 10px;">Email Configuration Test</h2>
              
              <p>If you're reading this, your Lost & Found Portal email configuration is working correctly! 🎉</p>
              
              <p>Details:</p>
              <ul>
                <li>Service: ${process.env.EMAIL_SERVICE}</li>
                <li>User: ${process.env.EMAIL_USER}</li>
                <li>From: ${process.env.EMAIL_FROM}</li>
                <li>Time: ${new Date().toISOString()}</li>
              </ul>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
                This is a test message from the Lost & Found Portal.
              </p>
            </div>
          `,
        });

        console.log(`✅ Test email sent: ${info.messageId}`);
      }

      return true;
    } else {
      console.error("❌ Failed to verify email connection");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing email configuration:", error);
    return false;
  }
}

// Run the test function
testEmailConfiguration()
  .then((success) => {
    if (success) {
      console.log("\n✅ Email configuration test completed successfully!");
    } else {
      console.log("\n❌ Email configuration test failed.");
    }
  })
  .catch((error) => {
    console.error(
      "\n❌ Unexpected error during email configuration test:",
      error
    );
  });

// Usage instructions
console.log("\nUsage:");
console.log(
  "  node test-email-config.js            - Check email configuration"
);
console.log(
  "  node test-email-config.js --send-test your@email.com - Send a test email"
);
