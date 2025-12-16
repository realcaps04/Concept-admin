/**
 * Notification Service for Project Concept
 * Handles sending of OTPs via EmailJS (Email) and console/backend (SMS)
 */

// =========================================================================
// ⚠️ ACTION REQUIRED: Configure your EmailJS keys inside .init() and .send()
// 1. Sign up at https://www.emailjs.com/
// 2. Create a generic email service (e.g., Gmail) -> Get SERVICE_ID
// 3. Create a template -> Get TEMPLATE_ID
//    - Add {{to_name}}, {{otp_code}}, {{message_html}} to your template
// 4. Account -> API Keys -> Get PUBLIC_KEY
// =========================================================================

(function () {
  // Initialize EmailJS (Replace 'YOUR_PUBLIC_KEY' with your actual key)
  if (window.emailjs) {
    emailjs.init("Ug3CeFbsmTr5kkPVE");
  }
})();

const NotificationService = {
  // Generate Beautiful HTML Email Template
  generateEmailHtml: (otp, name) => {
    return `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 480px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e6e9f2; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #f6f8fb 0%, #f1f5fa 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid #e6e9f2;">
          <h1 style="color: #1d2433; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.02em;">Secure Login</h1>
          <p style="color: #5f6b85; font-size: 14px; margin: 6px 0 0 0;">Super Admin Console</p>
        </div>
        
        <div style="padding: 40px 30px; text-align: center;">
          <p style="color: #1d2433; font-size: 16px; margin: 0 0 24px 0;">Hello <strong>${name}</strong>,</p>
          <p style="color: #5f6b85; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
            We received a request to access your administrative account. Use the code below to complete the verification process.
          </p>
          
          <div style="background: #f0f7ff; border: 1px dashed #5ba6ff; color: #1d4ed8; font-size: 36px; font-weight: 800; letter-spacing: 8px; padding: 24px 16px; border-radius: 12px; display: inline-block; min-width: 200px;">
            ${otp}
          </div>
          
          <p style="color: #94a3b8; font-size: 13px; margin: 32px 0 0 0;">
            This code expires in 10 minutes.<br>
            If you didn't request this, please secure your account immediately.
          </p>
        </div>
        
        <div style="background: #fafbfc; padding: 16px; text-align: center; border-top: 1px solid #e6e9f2;">
          <p style="color: #cbd5e1; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Project Concept Security</p>
        </div>
      </div>
    `;
  },

  // Generate Minimal SMS Template
  generateSmsText: (otp) => {
    return `[Concept] Your secure access code is ${otp}. Expires in 10m. Don't share.`;
  },

  // Send OTP
  sendOtp: async (email, phone, otp, name) => {
    console.group('%c 🔒 Sending Verification Code', 'color: #5ba6ff; font-weight: bold; font-size: 14px;');
    console.log(`To Email: ${email}`);
    console.log(`OTP: ${otp}`);

    try {
      // 1. Send Email via EmailJS
      // Service ID provided by user: service_su2n3x9
      // ⚠️ STILL REQUIRED: Replace 'YOUR_TEMPLATE_ID' and 'YOUR_PUBLIC_KEY_HERE' (above)
      const emailResult = await emailjs.send("service_su2n3x9", "template_n2q0cvw", {
        to_name: name,
        to_email: email,
        otp_code: otp,
        message_html: NotificationService.generateEmailHtml(otp, name),
        reply_to: "security@projectconcept.com"
      });

      console.log('%cEmail Sent Successfully!', 'color: #10b981;', emailResult);

      // 2. Alert for Development (Fallback until keys are set)
      // If keys are wrong, this might fail, so we still show alert for safety in dev
      // alert(`[DEV MODE] OTP sent to ${email}: ${otp}`);

    } catch (error) {
      console.error('Failed to send email via EmailJS:', error);

      // Fallback for Development: If email fails (likely due to missing keys), show alert
      console.warn('%c⚠️ EmailJS keys missing or invalid. Falling back to browser alert.', 'color: orange;');
      alert(`[DEVELOPMENT FALLBACK]\n\nSince EmailJS is not configured yet:\n\nVerification Code Sent to ${email}:\n${otp}`);
    }

    // 3. Send SMS via Textbelt (Free Tier: 1 per day)
    let smsSent = false;
    if (phone) {
      try {
        console.log(`%c[SMS SYSTEM] Attempting to send via Textbelt (Free Quota)...`, 'color: #5ba6ff;');

        // Textbelt API for free testing
        const response = await fetch('https://textbelt.com/text', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone,
            message: NotificationService.generateSmsText(otp),
            key: 'textbelt', // Public key for 1 free text per day
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log('%cSMS Sent Successfully via Textbelt!', 'color: #10b981;');
          smsSent = true;
        } else {
          console.warn(`%c[SMS Failed] Textbelt Error: ${data.error}`, 'color: orange;');
          // Fallback log
          console.log(`Would have sent to ${phone}: "${NotificationService.generateSmsText(otp)}"`);
        }
      } catch (err) {
        console.error('Failed to send SMS via Textbelt:', err);
      }
    }

    console.groupEnd();

    return { email: true, sms: smsSent };
  }
};
