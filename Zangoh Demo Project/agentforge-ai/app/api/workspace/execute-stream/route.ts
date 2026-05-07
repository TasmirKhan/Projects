import { GoogleGenerativeAI } from '@google/generative-ai';
import { sse } from '@/utils/sse';

export async function POST(req: Request) {
  const { task, employee } = await req.json();
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(enc.encode(sse('progress',{ stage:'TASK', message:'Task received' })));
        controller.enqueue(enc.encode(sse('progress',{ stage:'INTENT_ANALYSIS', message:'Analyzing intent' })));
        const key = process.env.GEMINI_API_KEY;
        if(!key){ controller.enqueue(enc.encode(sse('error',{ message:'GEMINI_API_KEY missing; using fallback mode.' }))); controller.close(); return; }
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model:'gemini-1.5-flash' });
        const prompt = `Return ONLY strict JSON keys intent,confidence,riskLevel,workflowPlan,reasoning,outputs,auditLogs,requiresEscalation,clarifyingQuestion. Employee:${employee}. Task:${task}`;
        const result = await model.generateContent(prompt);
        let parsed:any={}; try{parsed=JSON.parse(result.response.text());}catch{ controller.enqueue(enc.encode(sse('error',{message:'Malformed Gemini JSON response'}))); controller.close(); return; }
        controller.enqueue(enc.encode(sse('progress',{ stage:'OUTPUT_GENERATION', message:'Generating enterprise output' })));
        controller.enqueue(enc.encode(sse('result', parsed)));
      } catch(e:any){ controller.enqueue(enc.encode(sse('error',{ message:e?.message || 'Streaming failed' }))); }
      finally { controller.close(); }
    }
  });
  return new Response(stream,{ headers:{ 'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive' } });
}
