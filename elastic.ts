import { Client } from "@elastic/elasticsearch";

// Create Elasticsearch client
export const client = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://localhost:9200",
  auth: {
    username: process.env.ELASTICSEARCH_USER || "elastic",
    password: process.env.ELASTICSEARCH_PASS || "o7=*yFlEmUCO50PEDFW3",
  },
});

// Function to initialize the 'emails' index if it doesn't exist
export const initElastic = async () => {
  try {
    const indexExists = await client.indices.exists({ index: "emails" });

    if (!indexExists) {
      await client.indices.create({ index: "emails" });
      console.log("Created index: emails");
    } else {
      console.log("Index exists: emails");
    }
  } catch (err) {
    console.error("Elasticsearch connection error:", err);
  }
};

