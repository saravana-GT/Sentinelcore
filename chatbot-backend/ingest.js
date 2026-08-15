import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ChromaClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHROMADB_URL = process.env.CHROMADB_URL || "http://localhost:8000";
const KNOWLEDGE_FILE = path.join(__dirname, "knowledge_base.txt");

if (!GEMINI_API_KEY) {
  console.warn("\n⚠️  WARNING: GEMINI_API_KEY is not set. Ingestion will run in OFFLINE MOCK EMBEDDINGS mode.");
}

// Helper to get Gemini embedding or deterministic mock vector
async function getGeminiEmbedding(text) {
  if (!GEMINI_API_KEY) {
    // Generate a deterministic 768-dimension unit vector from the text content
    const vector = new Array(768).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % 768] += text.charCodeAt(i) / 10.0;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(v => v / magnitude);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: {
        parts: [{ text }]
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini Embedding API error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = [];
  if (!text) return chunks;
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    if (end === text.length) break;
    start += chunkSize - overlap;
  }
  return chunks;
}

async function run() {
  if (!fs.existsSync(KNOWLEDGE_FILE)) {
    console.error(`ERROR: ${KNOWLEDGE_FILE} not found. Please run 'npm run scrape' first.`);
    process.exit(1);
  }

  console.log(`Connecting to ChromaDB at ${CHROMADB_URL}...`);
  const chromaClient = new ChromaClient({ path: CHROMADB_URL });

  // Delete collection if it already exists to avoid duplicates
  try {
    await chromaClient.deleteCollection({ name: "sentinelcore_website" });
    console.log("Deleted existing 'sentinelcore_website' collection.");
  } catch (e) {
    // Ignore error if collection does not exist
  }

  const collection = await chromaClient.createCollection({
    name: "sentinelcore_website"
  });

  const content = fs.readFileSync(KNOWLEDGE_FILE, "utf-8");

  // Split content by page boundaries
  const pages = content.split("=== WEBSITE PAGE:");
  let totalChunks = 0;

  console.log("Indexing pages into ChromaDB...");

  for (const page of pages) {
    if (!page.trim()) continue;

    // Parse the page metadata (title and URL)
    const lines = page.split("\n");
    const titleLine = lines[0].replace(" ===", "").trim();

    let url = "Unknown URL";
    let bodyStartIndex = 1;

    if (lines[1] && lines[1].startsWith("URL: ")) {
      url = lines[1].substring(5).trim();
      bodyStartIndex = 2;
    }

    const bodyText = lines.slice(bodyStartIndex).join("\n").trim();
    if (!bodyText) continue;

    const chunks = chunkText(bodyText, 800, 100);
    console.log(`Processing "${titleLine}" (${chunks.length} chunks)`);

    const ids = [];
    const documents = [];
    const embeddings = [];
    const metadatas = [];

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const chunkId = `${titleLine.replace(/\s+/g, "_")}_chunk_${idx}_${Date.now()}`;

      try {
        const embedding = await getGeminiEmbedding(chunk);

        ids.push(chunkId);
        documents.push(chunk);
        embeddings.push(embedding);
        metadatas.push({
          source: url,
          title: titleLine,
          chunk_index: idx
        });

        totalChunks++;

        if (GEMINI_API_KEY) {
          // Brief sleep to avoid hitting API rate limits
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (err) {
        console.error(`Failed to generate embedding for chunk ${idx} of ${titleLine}:`, err.message);
      }
    }

    if (ids.length > 0) {
      await collection.add({
        ids,
        embeddings,
        documents,
        metadatas
      });
      console.log(`Indexed ${ids.length} chunks for "${titleLine}"`);
    }
  }

  console.log(`\nIngestion Complete! Added ${totalChunks} chunks to 'sentinelcore_website' collection.`);
}

run().catch((err) => {
  console.error("Ingestion failed:", err);
});
