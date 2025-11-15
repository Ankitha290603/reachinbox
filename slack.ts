import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
const INTEREST_WEBHOOK = process.env.INTEREST_WEBHOOK;

export async function notifyInterested(email: any) {
  try {
    if (SLACK_WEBHOOK) {
      await axios.post(SLACK_WEBHOOK, {
        text: `:mailbox_with_mail: *Interested email* from ${email.from} — ${email.subject}`
      });
    }
    if (INTEREST_WEBHOOK) {
      await axios.post(INTEREST_WEBHOOK, { event: "interested_email", email });
    }
  } catch (err) {
    console.error("Notification error:", err);
  }
}
