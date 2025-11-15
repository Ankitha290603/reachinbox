import express from "express";
import dotenv from "dotenv";
import { startImapWorkers } from "./imapWorker";
import { initElastic, indexEmail } from "./elastic";
import routes from "./routes";
dotenv.config();

const app = express();
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 4000;

async function main() {
  await initElastic();

  // optional: seed a dummy email for testing
  await indexEmail("1", {
    accountId: "acct1",
    folder: "inbox",
    from: "test@mail.com",
    to: "you@mail.com",
    subject: "Test Email",
    body: "This is a dummy email for testing",
    date: new Date(),
    ai_label: "test"
  });

  await startImapWorkers(); // starts real-time IMAP workers
  app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
}

main().catch(err => {
  console.error("Fatal error", err);
  process.exit(1);
});
