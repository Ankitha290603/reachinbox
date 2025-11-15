import { simpleParser } from "mailparser";
import Imap from "imap";
import { elasticClient } from "./elastic";

interface ImapAccount {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}

// Read accounts from .env
const accounts: ImapAccount[] = JSON.parse(process.env.IMAP_ACCOUNTS_JSON || "[]");

if (!accounts.length) {
  console.log("No IMAP accounts configured.");
}

accounts.forEach((acct) => {
  const imap = new Imap({
    user: acct.auth.user,
    password: acct.auth.pass,
    host: acct.host,
    port: acct.port,
    tls: acct.secure,
  });

  const openInbox = (cb: any) => {
    imap.openBox("INBOX", false, cb);
  };

  imap.once("ready", () => {
    console.log(`Starting IMAP worker for ${acct.id} at ${acct.host}`);
    openInbox((err: any, box: any) => {
      if (err) throw err;
      const f = imap.seq.fetch("1:*", { bodies: "" });
      f.on("message", (msg: any) => {
        let rawMessage = "";
        msg.on("body", (stream: any) => {
          stream.on("data", (chunk: any) => {
            rawMessage += chunk.toString("utf8");
          });
        });

        msg.once("end", async () => {
          const parsed = await simpleParser(rawMessage);
          // Save to Elasticsearch
          try {
            await elasticClient.index({
              index: "emails",
              body: {
                subject: parsed.subject,
                from: parsed.from?.text,
                to: parsed.to?.text,
                date: parsed.date,
                text: parsed.text,
              },
            });
          } catch (err) {
            console.error("Failed to index email:", err);
          }
        });
      });
      f.once("error", (err: any) => console.error("Fetch error:", err));
    });
  });

  imap.once("error", (err: any) => console.error("IMAP worker error", err));
  imap.once("end", () => console.log(`Connection closed for ${acct.id}`));

  imap.connect();
});
