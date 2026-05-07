import { NextResponse } from 'next/server';
import { GeminiQuotaError, runGeminiPrompt } from '@/lib/gemini';

export async function POST(req: Request){
  const { task, employee } = await req.json();
  const key = process.env.GEMINI_API_KEY;
  if(!key) return NextResponse.json({ reasoning:['Gemini key missing'], output:`[Mock Mode] ${employee} completed task: ${task}.` });
  try {
    const { text, modelName } = await runGeminiPrompt(key, `You are ${employee}. Complete task with concise reasoning bullets then output. Task: ${task}`);
    return NextResponse.json({ reasoning:['Detected intent','Generated workflow','Executed steps'], output: `${text}\n\nModel: ${modelName}` });
  } catch (e:any) {
    if (e instanceof GeminiQuotaError) {
      return NextResponse.json({ reasoning:['Gemini quota exceeded'], output:`Fallback output for task: ${task}. Please retry${e.retryAfterSeconds ? ` in ${e.retryAfterSeconds}s` : ''}.` });
    }
    return NextResponse.json({ reasoning:['Gemini execution failed'], output:`Fallback output for task: ${task}. Error: ${e?.message || 'Unknown'}` });
  }
}
