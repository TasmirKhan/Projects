import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { WorkspaceResponse } from '@/types/workspace';
import { sendWorkflowEmail } from '@/services/email/smtp';

function fallback(task:string, employee:string, reason:string): WorkspaceResponse {
  return { intent:`Fallback execution for ${employee}`, confidence:72, riskLevel:'Medium', workflowPlan:['Validate request','Generate safe draft','Require review'], reasoning:[`Primary AI execution unavailable: ${reason}`,'Generated safe fallback response.'], outputs:{title:'Fallback Output',content:`Could not run full AI execution. Draft for task: ${task}`}, auditLogs:[{time:new Date().toLocaleTimeString(),event:'Fallback execution activated',status:'warning'}], requiresEscalation:true, clarifyingQuestion:'Retry execution or verify API configuration.' };
}

export async function POST(req: Request) {
  try {
    const { task, employee } = await req.json();
    if (!task) return NextResponse.json({ error:'Task is required' }, { status:400 });
    const key = process.env.OPENAI_API_KEY;
    if(!key) return NextResponse.json(fallback(task,employee,'OPENAI_API_KEY missing'));
    const client = new OpenAI({ apiKey: key });
    const prompt = `You are ${employee}. Return strict JSON keys intent,confidence,riskLevel,workflowPlan,reasoning,outputs,auditLogs,requiresEscalation,clarifyingQuestion. Task: ${task}`;
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
  } catch(e:any) {
    return NextResponse.json(fallback('Unknown task','Digital Employee',e?.message || 'Unhandled execution error'), { status:200 });
  }
}
