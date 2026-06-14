import { generateText, generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = process.env.OPENAI_API_KEY
  ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export function model(name: string) {
  if (openai) return openai(name);
  return name as any;
}

export const DEFAULT_MODEL = model("gpt-5-mini");
export const FALLBACK_MODEL = model("gpt-5.4");

export { generateText, generateObject };
