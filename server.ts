import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Chatbot endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [], currentContext = {} } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAI();
    if (!ai) {
      // Graceful fallback if key is not configured in local environment
      return res.json({
        reply: `Here is an operational recommendation based on current queue: Make sure prep stations (pizza dough cold proofing, brioche burger buns toast station, smash patty temperature) are synchronized with rush orders. Currently you have ${
          currentContext.taskCount || "several"
        } tasks tracked. How would you like to optimize your kitchen flow today?`,
        suggestedActions: [
          "Auto-prioritize critical prep tasks",
          "Generate prep checklist for peak rush",
          "Summarize shift progress",
        ],
      });
    }

    const contextSnippet = `
Context of Pizza & Burger Operations workspace:
- Total tasks: ${currentContext.taskCount ?? "N/A"}
- Completed tasks: ${currentContext.completedCount ?? "N/A"}
- High/Critical priority tasks: ${currentContext.criticalCount ?? "N/A"}
- Active projects: ${JSON.stringify(currentContext.projectNames || ["Gourmet Pizza Quality", "Burger Bar Operations", "Kitchen POS & Delivery"])}
- Sample tasks in progress: ${JSON.stringify(currentContext.activeTaskTitles || [])}
`;

    const systemInstruction = `You are "Chef Luigi & Burger Bob AI", the senior culinary operations and task management copilot for Pizza & Burger.
You specialize in:
1. Fast-casual kitchen operations, pizza dough fermentation/baking schedules, smash burger griddle temperatures, ingredient stock, food cost, and POS/order queue bug management.
2. Helping managers and chefs organize tasks, prioritize critical rush-hour work, resolve operational bugs/bottlenecks, and summarize progress.
3. Keeping answers crisp, practical, encouraging, and structured with bullet points where appropriate.
If the user asks to create or suggest tasks, provide actionable, concrete culinary/operational tasks.
${contextSnippet}
`;

    const formattedContents = [
      ...history.slice(-6).map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "I've reviewed the queue. Let's keep cooking and moving orders efficiently!",
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      error: "Failed to generate AI response",
      details: error?.message || "Internal server error",
    });
  }
});

// AI Prioritize endpoint
app.post("/api/ai/prioritize", async (req, res) => {
  try {
    const { tasks = [], criteria = "Kitchen Rush & Customer Experience" } = req.body;

    const ai = getAI();
    if (!ai) {
      // Fallback sorting
      const sorted = [...tasks].sort((a: any, b: any) => {
        const pOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
      });
      return res.json({
        prioritizedTaskIds: sorted.map((t: any) => t.id),
        summary: "Tasks prioritized by urgency and prep timeline.",
        recommendations: [
          "Complete critical food safety & dough proofing first",
          "Ensure patty press and flat-top are preheated before rush",
          "Verify POS ticket printer sync",
        ],
      });
    }

    const taskSummaries = tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
    }));

    const prompt = `Analyze these Pizza & Burger operations tasks and provide an optimized prioritization plan.
Tasks to prioritize based on "${criteria}":
${JSON.stringify(taskSummaries, null, 2)}

Provide your response in JSON format with:
- "prioritizedTaskIds": string array of task IDs in recommended execution order
- "summary": concise executive rationale (2-3 sentences)
- "recommendations": array of 3 actionable tips for the crew
- "urgentWarning": optional string if any safety, quality, or delivery bottleneck needs immediate attention`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prioritizedTaskIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of task IDs in prioritized order",
            },
            summary: {
              type: Type.STRING,
              description: "Rationale for the priority ranking",
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 key actionable operational tips",
            },
            urgentWarning: {
              type: Type.STRING,
              description: "Immediate bottleneck or alert, if any",
            },
          },
          required: ["prioritizedTaskIds", "summary", "recommendations"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Prioritize Error:", error);
    res.status(500).json({ error: "Failed to prioritize tasks", details: error?.message });
  }
});

// AI Shift Progress Summarizer endpoint
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { tasks = [], projects = [], timeframe = "Current Shift / Week" } = req.body;

    const ai = getAI();
    if (!ai) {
      const completed = tasks.filter((t: any) => t.status === "done").length;
      return res.json({
        healthScore: 88,
        headline: "Operations Running Smoothly Across Pizza & Burger Lines",
        summary: `The crew has completed ${completed} out of ${tasks.length} tracked items for ${timeframe}. Dough fermentation and grill stations are currently on schedule.`,
        keyWins: ["Completed dough recipe hydration tests", "Resolved fry station temperature bottleneck"],
        actionItems: ["Restock organic San Marzano tomatoes", "Test new double-smash burger bun supplier"],
      });
    }

    const prompt = `You are the executive operations director for a high-volume gourmet Pizza & Burger kitchen and business.
Analyze the following operational snapshot:
Timeframe: ${timeframe}
Projects: ${JSON.stringify(projects.map((p: any) => ({ name: p.name, progress: p.progress, category: p.category })))}
Tasks: ${JSON.stringify(
      tasks.map((t: any) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        category: t.category,
      })),
      null,
      2
    )}

Generate a structured executive progress summary in JSON format with:
- "healthScore": number from 0 to 100 representing overall operational health
- "headline": punchy positive or alert headline
- "summary": concise narrative review of shift progress, velocity, and culinary excellence
- "keyWins": array of 2-3 notable accomplishments or completed tasks
- "actionItems": array of 3 prioritized next steps to prevent delays`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER },
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyWins: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["healthScore", "headline", "summary", "keyWins", "actionItems"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Summarize Error:", error);
    res.status(500).json({ error: "Failed to summarize progress", details: error?.message });
  }
});

// AI Generate Tasks from Objective
app.post("/api/ai/generate-tasks", async (req, res) => {
  try {
    const { objective, category = "Kitchen & Prep", projectId } = req.body;

    if (!objective) {
      return res.status(400).json({ error: "Objective is required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({
        tasks: [
          {
            title: `Prepare equipment & mise en place for: ${objective}`,
            description: "Check kitchen stations, verify ingredients, prep seasonings and clean surfaces.",
            category: category,
            priority: "high",
            estimatedMinutes: 30,
            subtasks: ["Inspect ingredients", "Clean line", "Test temperatures"],
          },
          {
            title: `Execute trial batch & temperature test: ${objective}`,
            description: "Perform taste and cook test under standard oven/griddle conditions.",
            category: category,
            priority: "medium",
            estimatedMinutes: 45,
            subtasks: ["Cook sample", "Log internal temp", "Taste evaluate"],
          },
        ],
      });
    }

    const prompt = `You are a culinary workflow architect for a modern Pizza & Burger kitchen and restaurant enterprise.
The user wants to accomplish this objective: "${objective}"
Target Category: "${category}"

Generate 3 to 4 concrete, highly actionable, well-organized tasks to accomplish this objective seamlessly.
Return JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: "One of: Kitchen & Prep, Menu & Recipes, Delivery & Inventory, Bug & Equipment, Staff & Service",
                  },
                  priority: {
                    type: Type.STRING,
                    description: "One of: critical, high, medium, low",
                  },
                  estimatedMinutes: { type: Type.INTEGER },
                  subtasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["title", "description", "category", "priority", "estimatedMinutes", "subtasks"],
              },
            },
          },
          required: ["tasks"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{"tasks": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error("Generate Tasks Error:", error);
    res.status(500).json({ error: "Failed to generate tasks", details: error?.message });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
