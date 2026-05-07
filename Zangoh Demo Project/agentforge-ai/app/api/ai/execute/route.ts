import OpenAI from 'openai';
import { NextResponse } from 'next/server';
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
export async function POST(req: Request){const { task, employee }=await req.json();
if(!client){return NextResponse.json({ reasoning:[`Detected ${employee} intent.`,`Planning workflow actions.`,`Confidence Score: 91%`], output:`[Mock Mode] ${employee} completed task: ${task}.` });}
const completion=await client.responses.create({model:'gpt-4.1-mini',input:`You are ${employee}. Complete task with reasoning bullets then output. Task: ${task}`});
return NextResponse.json({ reasoning:['Detected intent','Generated workflow','Executed steps'], output: completion.output_text });}
