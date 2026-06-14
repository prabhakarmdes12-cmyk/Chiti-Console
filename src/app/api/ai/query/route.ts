import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { queryToolSchemas, executeTool, type ToolName } from "@/lib/ai/query-data";

const openai = process.env.OPENAI_API_KEY
  ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM = `You are a business analytics assistant for Chiti Console, an operations management platform for Indian businesses.

Answer questions about orders, revenue, customers, products, and leads.
Call the appropriate tool to query data — never make up data.
Format results as clean markdown tables (if multiple rows) or concise sentences (if single value).
Use ₹ and en-IN formatting (e.g. ₹1,23,456).
Keep answers brief and actionable.`;

const FORMAT_PROMPT = `The user asked a question and we queried the database. Format the raw data below into a friendly, concise answer. Use a markdown table if there are multiple rows, otherwise a short sentence. Do not mention tool calls. Use ₹ for Indian Rupees.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!openai) {
    return Response.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  const result = await generateText({
    model: openai("gpt-5-mini"),
    system: SYSTEM,
    messages,
    tools: queryToolSchemas,
  });

  const toolCalls = (result as any).toolCalls as Array<{ toolName: string; args: Record<string, unknown> }> | undefined;

  if (toolCalls && toolCalls.length > 0) {
    const rawData = await executeTool(toolCalls[0].toolName as ToolName, toolCalls[0].args);
    const formatted = await generateText({
      model: openai("gpt-5-mini"),
      system: FORMAT_PROMPT,
      messages: [
        { role: "user", content: `Question: ${messages[messages.length - 1].content}\n\nData:\n${JSON.stringify(rawData, null, 2)}` },
      ],
    });
    return Response.json({ text: formatted.text });
  }

  return Response.json({ text: result.text || "I couldn't find an answer to that question." });
}
