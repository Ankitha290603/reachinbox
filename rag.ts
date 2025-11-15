import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const q = new QdrantClient({ url: process.env.QDRANT_URL || "http://localhost:6333" });
const COLLECTION = "reachinbox";

export async function getSuggestedReply(emailText: string) {
  // 1) embed the query
  const embRes = await openai.embeddings.create({ model: "text-embedding-3-small", input: emailText });
  const qvec = embRes.data[0].embedding;

  // 2) search qdrant
  const searchRes = await q.search({
    collection_name: COLLECTION,
    vector: qvec,
    limit: 3
  });

  const contexts = (searchRes as any).result?.map((r: any) => r.payload).slice(0, 3) || [];
  const contextText = contexts.map((c: any) => `Subject: ${c.subject}\nBody: ${c.body}`).join("\n---\n");

  // 3) use LLM with RAG prompt
  const prompt = `You are an assistant helping write a short professional reply. Use the context below to produce a suggested reply to the user's incoming message.

Context:
${contextText}

Incoming email:
${emailText}

If the email indicates the lead is interested, include the meeting link: https://cal.com/example
Keep the reply concise.`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.2
  });

  return resp.choices?.[0]?.message?.content?.trim();
}
