import OpenAI from 'openai';
import { sse } from '@/utils/sse';

export async function POST(req: Request) {
  const { task, employee } = await req.json();
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(enc.encode(sse('progress',{ stage:'TASK', message:'Task received' })));
        controller.enqueue(enc.encode(sse('progress',{ stage:'INTENT_ANALYSIS', message:'Analyzing intent' })));
        const key = process.env.OPENAI_API_KEY;
        if(!key){ controller.enqueue(enc.encode(sse('error',{ message:'OPENAI_API_KEY missing; using fallback mode.' }))); controller.close(); return; }
        const client = new OpenAI({ apiKey: key });
        const prompt = `Return strict JSON keys intent,confidence,riskLevel,workflowPlan,reasoning,outputs,auditLogs,requiresEscalation,clarifyingQuestion. Employee:${employee}. Task:${task}`;
        const ai = await client.responses.create({ model:'gpt-4.1-mini', input: prompt, text:{ format:{ type:'json_object' } } });
        controller.enqueue(enc.encode(sse('progress',{ stage:'OUTPUT_GENERATION', message:'Generating enterprise output' })));
        controller.enqueue(enc.encode(sse('result', JSON.parse(ai.output_text || '{}'))));
      } catch(e:any){
        controller.enqueue(enc.encode(sse('error',{ message:e?.message || 'Streaming failed' })));
      } finally { controller.close(); }
    }
  });
  return new Response(stream,{ headers:{ 'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive' } });
}
