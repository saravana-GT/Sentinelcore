import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChromaClient } from "chromadb";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5005);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHROMADB_URL = process.env.CHROMADB_URL || "http://localhost:8000";
const COLLECTION_NAME =
    process.env.CHROMA_COLLECTION || "sentinelcore_website";

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.6-flash";

const EMBEDDING_MODEL =
    process.env.EMBEDDING_MODEL || "gemini-embedding-001";

const EMBEDDING_DIMENSIONS =
    Number(process.env.EMBEDDING_DIMENSIONS || 768);

// Optional live-data API
const LIVE_DATA_URL = process.env.LIVE_DATA_URL || "";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set.");
}

const chromaClient = new ChromaClient({
    path: CHROMADB_URL,
});

let collection = null;

// ============================================================
// CHROMADB CONNECTION
// ============================================================

async function initChroma() {
    try {
        collection = await chromaClient.getCollection({
            name: COLLECTION_NAME,
        });

        console.log(
            `Connected to ChromaDB collection: '${COLLECTION_NAME}'`
        );
    } catch (err) {
        collection = null;

        console.warn(
            `Warning: Could not connect to '${COLLECTION_NAME}'.`
        );

        console.warn(
            `Run "npm run ingest" after ChromaDB is running.`
        );

        console.warn(`Chroma error: ${err.message}`);
    }
}

await initChroma();

// ============================================================
// GEMINI EMBEDDING
// ============================================================

async function getQueryEmbedding(text) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${EMBEDDING_MODEL}:embedContent`;

    const response = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
        },

        body: JSON.stringify({
            model: `models/${EMBEDDING_MODEL}`,

            content: {
                parts: [
                    {
                        text,
                    },
                ],
            },

            outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `Gemini Embedding API error: ${JSON.stringify(data)}`
        );
    }

    if (!data.embedding?.values) {
        throw new Error(
            "Gemini did not return an embedding vector."
        );
    }

    return data.embedding.values;
}

// ============================================================
// GEMINI AI RESPONSE
// ============================================================

async function generateAiResponse(systemPrompt, userPrompt) {
    if (!GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is not configured."
        );
    }

    const modelsToTry = [
        GEMINI_MODEL,
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
    ].filter(
        (value, index, arr) =>
            arr.indexOf(value) === index
    );

    let lastError = null;

    for (const model of modelsToTry) {
        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/` +
            `${model}:generateContent`;

        try {
            const response = await fetch(url, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY,
                },

                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: systemPrompt,
                            },
                        ],
                    },

                    contents: [
                        {
                            role: "user",

                            parts: [
                                {
                                    text: userPrompt,
                                },
                            ],
                        },
                    ],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                lastError = new Error(
                    `Model ${model} failed: ${JSON.stringify(data)}`
                );

                if (
                    response.status === 404 ||
                    response.status === 400
                ) {
                    continue;
                }

                throw lastError;
            }

            const text =
                data?.candidates?.[0]?.content?.parts
                    ?.map((part) => part.text || "")
                    .join("")
                    .trim();

            if (text) {
                console.log(
                    `Gemini response generated with model: ${model}`
                );

                return text;
            }

            throw new Error(
                `Model ${model} returned no text.`
            );
        } catch (err) {
            lastError = err;
            continue;
        }
    }

    throw (
        lastError ||
        new Error(
            "No Gemini model could generate a response."
        )
    );
}

// ============================================================
// OPTIONAL LIVE DATA
// ============================================================
//
// Live data can come from:
//
// 1. React frontend:
//    POST /api/chat
//
//    {
//      "message": "What incidents are currently registered?",
//      "liveData": {
//        "incidents": [...],
//        "devices": [...],
//        "alerts": [...]
//      }
//    }
//
// 2. A real backend API through LIVE_DATA_URL.
//
// The server cannot directly read React state/localStorage.
// The live state must be sent to this server or fetched from
// a backend API.
//

async function getLiveDataFromApi() {
    if (!LIVE_DATA_URL) {
        return null;
    }

    try {
        const response = await fetch(
            LIVE_DATA_URL,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            console.warn(
                `Live data API returned ${response.status}`
            );

            return null;
        }

        return await response.json();
    } catch (err) {
        console.warn(
            `Could not fetch live data: ${err.message}`
        );

        return null;
    }
}

// ============================================================
// CLEAN LIVE DATA
// ============================================================

function cleanLiveData(data) {
    if (!data) {
        return null;
    }

    const json = JSON.stringify(data);

    if (json.length <= 50000) {
        return data;
    }

    return {
        note:
            "Live data was too large to include completely.",
    };
}

function formatLiveDataForPrompt(liveData) {
    if (!liveData) {
        return "No live website data was supplied.";
    }

    return JSON.stringify(
        liveData,
        null,
        2
    );
}

// ============================================================
// CHROMADB RAG SEARCH
// ============================================================

async function retrieveContext(userQuery) {
    if (!collection) {
        try {
            collection =
                await chromaClient.getCollection({
                    name: COLLECTION_NAME,
                });
        } catch {
            return [];
        }
    }

    const queryEmbedding =
        await getQueryEmbedding(userQuery);

    const results =
        await collection.query({
            queryEmbeddings: [
                queryEmbedding,
            ],

            nResults: 5,
        });

    const documents =
        results?.documents?.[0] || [];

    const metadatas =
        results?.metadatas?.[0] || [];

    return documents
        .map((doc, index) => ({
            document: doc,

            metadata:
                metadatas[index] || {},
        }))
        .filter(
            (item) =>
                item.document &&
                item.document.trim()
        );
}

// ============================================================
// CHAT API
// ============================================================

app.post(
    "/api/chat",
    async (req, res) => {
        const message =
            typeof req.body?.message === "string"
                ? req.body.message.trim()
                : "";

        const clientLiveData =
            req.body?.liveData || null;

        if (!message) {
            return res.status(400).json({
                error:
                    "Message content cannot be empty.",
            });
        }

        console.log(
            `Received query: "${message}"`
        );

        try {
            // ------------------------------------------------------
            // 1. STATIC WEBSITE KNOWLEDGE
            // ------------------------------------------------------

            let ragResults = [];

            try {
                ragResults =
                    await retrieveContext(message);

                console.log(
                    `RAG results: ${ragResults.length}`
                );
            } catch (err) {
                console.warn(
                    `RAG retrieval failed: ${err.message}`
                );
            }

            // ------------------------------------------------------
            // 2. LIVE WEBSITE DATA
            // ------------------------------------------------------

            let liveData =
                cleanLiveData(
                    clientLiveData
                );

            if (!liveData) {
                liveData =
                    await getLiveDataFromApi();
            }

            // ------------------------------------------------------
            // 3. STATIC CONTEXT
            // ------------------------------------------------------

            const contextText =
                ragResults
                    .map(
                        (item, index) =>
                            `--- Knowledge ${index + 1} ---\n${item.document}`
                    )
                    .join("\n\n");

            // ------------------------------------------------------
            // 4. LIVE CONTEXT
            // ------------------------------------------------------

            const liveContextText =
                formatLiveDataForPrompt(
                    liveData
                );

            // ------------------------------------------------------
            // 5. SYSTEM PROMPT
            // ------------------------------------------------------

            const systemPrompt = `
You are Sentinel AI, the official cybersecurity assistant for the SentinelCore website.

Your job is to answer questions about SentinelCore using BOTH:

A) Static SentinelCore knowledge retrieved from ChromaDB
B) Live website/application data supplied in the LIVE DATA section

IMPORTANT RULES:

1. If the user asks about current incidents, current alerts, current devices,
current vulnerabilities, current health, current telemetry, or other changing
information, prefer LIVE DATA over static knowledge.

2. Never invent live data.

3. If live data does not contain the requested information, clearly say that
the current live data is not available.

4. Use static knowledge for questions about SentinelCore features, dashboard
functionality, security concepts, workflows, CVE management, SOAR, SIEM,
asset inventory, and other website documentation.

5. You may combine static knowledge and live data.

6. Never mention ChromaDB, embeddings, RAG, prompts, source files,
developer instructions, API keys, or internal implementation details unless
the user explicitly asks about the technical implementation.

7. Never make up an incident, device, alert, CVE, analyst, severity, count,
status, or timestamp.

8. If the user asks:
"What incidents are currently registered?"
answer from LIVE DATA if incidents are present.

9. If the user asks for a count, calculate it from the supplied live data.

10. If multiple incidents/devices/alerts exist, use a clean bullet list.

11. Keep answers concise and natural.

12. If neither static knowledge nor live data supports the answer, say:
"Sorry, I couldn't find that information in SentinelCore."

13. Answer in the same language as the user when practical.
`.trim();

            // ------------------------------------------------------
            // 6. FINAL PROMPT
            // ------------------------------------------------------

            const prompt = `
STATIC SENTINELCORE KNOWLEDGE:

${contextText ||
                "No static knowledge was retrieved."}


LIVE WEBSITE/APPLICATION DATA:

${liveContextText}


USER QUESTION:

${message}


Answer the user directly.
`.trim();

            // ------------------------------------------------------
            // 7. GEMINI
            // ------------------------------------------------------

            const reply =
                await generateAiResponse(
                    systemPrompt,
                    prompt
                );

            return res.json({
                reply,

                meta: {
                    ragResults:
                        ragResults.length,

                    liveDataAvailable:
                        Boolean(liveData),
                },
            });
        } catch (err) {
            console.error(
                "Error generating AI response:",
                err.message
            );

            return res.status(500).json({
                reply:
                    "I couldn't connect to the AI service right now. Please try again.",

                error:
                    err.message,
            });
        }
    }
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/health",
    async (req, res) => {
        let chromaConnected =
            collection !== null;

        if (!chromaConnected) {
            try {
                collection =
                    await chromaClient.getCollection({
                        name: COLLECTION_NAME,
                    });

                chromaConnected = true;
            } catch {
                chromaConnected = false;
            }
        }

        res.json({
            status: "ok",

            chroma_connected:
                chromaConnected,

            gemini_configured:
                Boolean(
                    GEMINI_API_KEY
                ),

            live_data_url_configured:
                Boolean(
                    LIVE_DATA_URL
                ),

            collection:
                COLLECTION_NAME,

            port:
                PORT,
        });
    }
);

// ============================================================
// STATUS
// ============================================================

app.get(
    "/api/status",
    async (req, res) => {
        res.json({
            backend: "online",

            port: PORT,

            chromadb: {
                connected:
                    collection !== null,

                url:
                    CHROMADB_URL,

                collection:
                    COLLECTION_NAME,
            },

            gemini: {
                configured:
                    Boolean(
                        GEMINI_API_KEY
                    ),

                model:
                    GEMINI_MODEL,

                embeddingModel:
                    EMBEDDING_MODEL,

                embeddingDimensions:
                    EMBEDDING_DIMENSIONS,
            },

            liveData: {
                configured:
                    Boolean(
                        LIVE_DATA_URL
                    ),
            },
        });
    }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {
        console.log("");
        console.log(
            "=============================================="
        );

        console.log(
            " SentinelCore Chatbot Backend"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `Backend:   http://localhost:${PORT}`
        );

        console.log(
            `Health:    http://localhost:${PORT}/health`
        );

        console.log(
            `Status:    http://localhost:${PORT}/api/status`
        );

        console.log(
            `ChromaDB:  ${CHROMADB_URL}`
        );

        console.log(
            `Collection: ${COLLECTION_NAME}`
        );

        console.log(
            `Gemini:    ${GEMINI_MODEL}`
        );

        console.log(
            `Embedding: ${EMBEDDING_MODEL} (${EMBEDDING_DIMENSIONS}D)`
        );

        console.log(
            `Live data: ${LIVE_DATA_URL ||
            "frontend payload / not configured"
            }`
        );

        console.log(
            "=============================================="
        );

        console.log("");
    }
);