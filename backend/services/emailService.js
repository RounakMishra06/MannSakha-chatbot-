import nodemailer from "nodemailer";
import crypto from "crypto";

const emailUser = process.env.EMAIL_USERNAME;
const emailPass = process.env.EMAIL_PASSWORD;
let transporterVerified = false;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

const verifyTransporter = async () => {
  if (!emailUser || !emailPass) {
    console.error("[NEWSLETTER][EMAIL] Missing EMAIL_USERNAME or EMAIL_PASSWORD in backend .env");
    return false;
  }

  if (transporterVerified) {
    return true;
  }

  try {
    await transporter.verify();
    transporterVerified = true;
    console.log("[NEWSLETTER][EMAIL] Gmail transporter verified successfully");
    return true;
  } catch (err) {
    console.error("[NEWSLETTER][EMAIL] Transporter verification failed:", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      command: err?.command,
    });
    console.error("[NEWSLETTER][EMAIL] Gmail SMTP requires a 16-character App Password, not your normal Gmail password");
    return false;
  }
};

// ✅ Token generator
export const generateUnsubscribeToken = (email) => {
  return crypto
    .createHmac("sha256", process.env.NEWSLETTER_SUBSCRIBE_SECRET || "default_secret")
    .update(email)
    .digest("hex");
};
// ✅ Confirmation email
export const sendConfirmationEmail = async (email, unsubscribeLink) => {
  try {
    console.log("[NEWSLETTER][EMAIL] Incoming subscription email:", email);

    const isTransporterReady = await verifyTransporter();
    if (!isTransporterReady) {
      return false;
    }

    console.log("[NEWSLETTER][EMAIL] Sending confirmation email to:", email);

    const info = await transporter.sendMail({
      from: `"MannSakha AI" <${emailUser}>`,
      to: email,
      subject: "Welcome to MannSakha AI Newsletter",
      html: `
       <div style="max-width:600px; margin:20px auto; padding:20px; border-radius:12px; background:#f9fafc; font-family:Arial, sans-serif; text-align:center; color:#333; border:1px solid #e0e0e0;">
  <h2 style="color:#4CAF50; margin-bottom:10px;">🎉 Thank you for subscribing!</h2>
  <p style="font-size:16px; line-height:1.6; margin:10px 0;">
    You will now receive regular updates, tips, and news from us.
  </p>
  <p style="font-size:14px; color:#555; margin:20px 0;">
    If you ever wish to unsubscribe, click the button below:
  </p>
  <a href="${unsubscribeLink}" 
     style="display:inline-block; padding:10px 20px; margin-top:10px; background:#ff4d4d; color:#fff; text-decoration:none; border-radius:6px; font-size:14px;">
     Unsubscribe
  </a>
</div>

      `,
    });

    console.log("[NEWSLETTER][EMAIL] Confirmation email sent successfully:", {
      to: email,
      messageId: info?.messageId,
      response: info?.response,
      accepted: info?.accepted,
      rejected: info?.rejected,
    });
    return true;
  } catch (err) {
    console.error("[NEWSLETTER][EMAIL] Email sending failed:", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      command: err?.command,
    });
    console.error("[NEWSLETTER][EMAIL] Ensure EMAIL_PASSWORD is a Gmail App Password (16 chars)");
    return false;
  }
};

// ✅ Bulk newsletter
export const sendBulkNewsletter = async (
  subscribers,
  subject,
  content,
  generateUnsubscribeLink
) => {
  try {
    const isTransporterReady = await verifyTransporter();
    if (!isTransporterReady) {
      return false;
    }

    for (const subscriber of subscribers) {
      const unsubscribeLink = generateUnsubscribeLink(subscriber.email);

      const info = await transporter.sendMail({
        from: `"MannSakha AI" <${emailUser}>`,
        to: subscriber.email,
        subject,
        html: `
          ${content}
          <hr>
          <p style="font-size:12px;color:#666;">
            If you no longer wish to receive these emails, 
            <a href="${unsubscribeLink}" style="color:red;">unsubscribe here</a>.
          </p>
        `,
      });

      console.log("[NEWSLETTER][EMAIL] Bulk send success:", {
        to: subscriber.email,
        messageId: info?.messageId,
      });
    }

    console.log("[NEWSLETTER][EMAIL] Bulk email sent to subscribers:", subscribers.length);
    return true;
  } catch (err) {
    console.error("[NEWSLETTER][EMAIL] Bulk email sending failed:", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      command: err?.command,
    });
    return false;
  }
};
