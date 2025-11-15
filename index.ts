import express from "express";
import { client } from "./elastic";

const app = express();
app.use(express.json());

// GET /emails route
app.get("/emails", async (req, res) => {
  try {
    const result = await client.search({
      index: "emails",
      size: 100, // number of emails to fetch
      query: { match_all: {} }, // fetch all
    });

    // Extract email data
    const emails = result.hits.hits.map((hit: any) => hit._source);
    res.json(emails);
  } catch (err) {
    console.error("Failed to fetch emails", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
