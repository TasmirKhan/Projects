import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { WorkspaceResponse } from '@/types/workspace';
import { sendWorkflowEmail } from '@/services/email/smtp';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { task, employee } = await req.json();
  if (!task) return NextResponse.json({ error:'Task is required' }, { status:400 });

  const prompt = `You are ${employee} in an enterprise AI operations platform. Return strict JSON with keys: intent,confidence,riskLevel,workflowPlan,reasoning,outputs,auditLogs,requiresEscalation,clarifyingQuestion. Task: ${task}. Include enterprise-professional output content.`;
  const ai = await client.responses.create({ model:'gpt-4.1-mini', input: prompt, text:{ format:{ type:'json_object' } } });
  const parsed = JSON.parse(ai.output_text || '{}') as WorkspaceResponse;

  const emailLike = /send|email|follow-up|outreach|refund/i.test(task);
  let emailStatus = 'No email action requested';
  if (emailLike && parsed.outputs?.content) {
    const result = await sendWorkflowEmail({ subject: `[AgentForge] ${parsed.outputs.title || 'Workflow Output'}`, text: parsed.outputs.content });
    emailStatus = result.sent ? 'Email dispatched via SMTP' : `Email skipped: ${result.reason}`;
    parsed.auditLogs = [...(parsed.auditLogs || []), { time:new Date().toLocaleTimeString(), event: emailStatus, status: result.sent?'success':'warning' }];
  }

  return NextResponse.json({ ...parsed, outputs:{...parsed.outputs, content:`${parsed.outputs?.content || ''}\n\nEmail Status: ${emailStatus}` } });
}
