import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { WorkspaceResponse } from '@/types/workspace';
import { sendWorkflowEmail } from '@/services/email/smtp';

function safeParse(text:string){ try{return JSON.parse(text);}catch{return null;} }
function fallback(task:string, employee:string, reason:string): WorkspaceResponse {
  return { intent:`Fallback execution for ${employee}`, confidence:72, riskLevel:'Medium', workflowPlan:['Validate request','Generate safe draft','Require review'], reasoning:[`Primary AI execution unavailable: ${reason}`,'Generated safe fallback response.'], outputs:{title:'Fallback Output',content:`Could not run full AI execution. Draft for task: ${task}`}, auditLogs:[{time:new Date().toLocaleTimeString(),event:'Fallback execution activated',status:'warning'}], requiresEscalation:true, clarifyingQuestion:'Retry execution or verify API configuration.' };
}

export async function POST(req: Request) {
  try {
    const { task, employee } = await req.json();
    if (!task) return NextResponse.json({ error:'Task is required' }, { status:400 });
    const key = process.env.GEMINI_API_KEY;
    if(!key) return NextResponse.json(fallback(task,employee,'GEMINI_API_KEY missing'));

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Return ONLY strict JSON with keys: intent,confidence,riskLevel,workflowPlan,reasoning,outputs,auditLogs,requiresEscalation,clarifyingQuestion. Employee:${employee}. Task:${task}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = safeParse(text) as WorkspaceResponse | null;
    if(!parsed) return NextResponse.json(fallback(task,employee,'Malformed Gemini JSON response'));

    const emailLike = /send|email|follow-up|outreach|refund/i.test(task);
    let emailStatus = 'No email action requested';
    if (emailLike && parsed.outputs?.content) {
      const e = await sendWorkflowEmail({ subject: `[AgentForge] ${parsed.outputs.title || 'Workflow Output'}`, text: parsed.outputs.content });
      emailStatus = e.sent ? 'Email dispatched via SMTP' : `Email skipped: ${e.reason}`;
      parsed.auditLogs = [...(parsed.auditLogs || []), { time:new Date().toLocaleTimeString(), event: emailStatus, status: e.sent?'success':'warning' }];
    }
    return NextResponse.json({ ...parsed, outputs:{...parsed.outputs, content:`${parsed.outputs?.content || ''}\n\nEmail Status: ${emailStatus}` } });
  } catch(e:any) {
    return NextResponse.json(fallback('Unknown task','Digital Employee',e?.message || 'Unhandled execution error'), { status:200 });
  }
}
