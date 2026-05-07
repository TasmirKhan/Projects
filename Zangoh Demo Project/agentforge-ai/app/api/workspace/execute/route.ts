import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { WorkspaceResponse } from '@/types/workspace';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function mock(task:string, employee:string): WorkspaceResponse {
  const confidence = /refund|policy|legal|sensitive/i.test(task) ? 68 : 92;
  const escalation = confidence < 75;
  return {
    intent: `Detected ${employee} intent for: ${task}`,
    confidence,
    riskLevel: escalation ? 'Medium':'Low',
    workflowPlan: ['Classify intent','Draft execution plan','Generate output','Validate confidence'],
    reasoning: ['Detected enterprise request intent.','Mapped task to role-specific workflow.','Generated output with compliance guardrails.',`Confidence score calculated at ${confidence}%.`],
    outputs: { title:'Generated Output', content: `Professional response draft for task: ${task}` },
    auditLogs: [
      { time:new Date().toLocaleTimeString(), event:'Task received', status:'info' },
      { time:new Date().toLocaleTimeString(), event:'Intent classified', status:'success' },
      { time:new Date().toLocaleTimeString(), event: escalation?'Human approval required':'Task completed', status: escalation?'warning':'success' }
    ],
    requiresEscalation: escalation,
    clarifyingQuestion: escalation ? 'Please confirm policy boundaries or customer eligibility constraints.' : undefined
  };
}

export async function POST(req: Request) {
  const { task, employee } = await req.json();
  if (!task) return NextResponse.json({ error:'Task is required' }, { status:400 });
  if (!client) return NextResponse.json(mock(task, employee));

  const prompt = `Return strict JSON with keys intent,confidence,riskLevel,workflowPlan,reasoning,outputs,auditLogs,requiresEscalation,clarifyingQuestion. Employee:${employee}. Task:${task}`;
  const response = await client.responses.create({ model:'gpt-4.1-mini', input: prompt, text:{ format:{ type:'json_object' } } });
  const parsed = JSON.parse(response.output_text || '{}');
  return NextResponse.json(parsed);
}
