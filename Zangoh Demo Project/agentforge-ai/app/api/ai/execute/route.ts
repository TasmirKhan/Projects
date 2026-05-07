import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request){
  const { task, employee } = await req.json();
  const key = process.env.GEMINI_API_KEY;
  if(!key) return NextResponse.json({ reasoning:['Gemini key missing'], output:`[Mock Mode] ${employee} completed task: ${task}.` });
  try {
    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model:'gemini-1.5-flash' });
    const result = await model.generateContent(`You are ${employee}. Complete task with concise reasoning bullets then output. Task: ${task}`);
    return NextResponse.json({ reasoning:['Detected intent','Generated workflow','Executed steps'], output: result.response.text() });
  } catch (e:any) {
    return NextResponse.json({ reasoning:['Gemini execution failed'], output:`Fallback output for task: ${task}. Error: ${e?.message || 'Unknown'}` });
  }
}
