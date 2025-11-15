import { QdrantClient } from "@qdrant/js-client-rest";

import dotenv from "dotenv";
dotenv.config();
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const client = new QdrantClient({ url: QDRANT_URL });

const COLLECTION = "reachinbox";

export async function ensureCollection() {
  try {
    const exists = await client.getCollections();
    const found = (exists.collections || []).some(c => c.name === COLLECTION);
    if (!found) {
      await client.createCollection({
        collection_name: COLLECTION,
        vectors: { size: 1536, distance: "Cosine" } // 1536 for OpenAI embedding dim
      });
      console.log("Created qdrant collection");
    }
  } catch (e) {
    console.error("Qdrant init error", e);
    throw e;
  }
}

export async function upsertVector(id: string, payload: any) {
  // create embedding via OpenAI
  const embedding = await createEmbedding(`${payload.subject}\n\n${payload.body}`).catch(() => null);
  await ensureCollection();
  if (embedding) {
    await client.upsert({
      collection_name: COLLECTION,
      points: [{ id: id, vector: embedding, payload }]
    });
  }
}

import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function createEmbedding(text: string) {
  const r = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return r.data[0].embedding;
}
