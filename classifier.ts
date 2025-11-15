import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classifyEmail(subject: string, body: string) {
  const prompt = `You are an email classifier. Label the following email into one of: Interested, Meeting Booked, Not Interested, Spam, Out of Office. Respond with only the label.

Email subject: "${subject}"
Email body: "${body}"`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 16,
    temperature: 0
  });
  const label = resp.choices?.[0]?.message?.content?.trim();
  return label;
}
