import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = ['gemini-1.5-flash-latest','gemini-2.0-flash'] as const;

export class GeminiQuotaError extends Error {
  retryAfterSeconds?: number;
  constructor(message:string,retryAfterSeconds?:number){ super(message); this.name='GeminiQuotaError'; this.retryAfterSeconds=retryAfterSeconds; }
}

const getRetrySeconds = (message:string) => {
  const m = message.match(/retry in\s+(\d+(?:\.\d+)?)s/i) || message.match(/retryDelay":"(\d+)s"/i);
  return m ? Math.ceil(Number(m[1])) : undefined;
};

export async function runGeminiPrompt(apiKey:string, prompt:string, timeoutMs=30000) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const op = model.generateContent(prompt).then((r)=>({ text:r.response.text(), modelName }));
      const timed = Promise.race([op, new Promise<never>((_,rej)=>setTimeout(()=>rej(new Error(`Gemini timeout on ${modelName}`)),timeoutMs))]);
      return await timed;
    } catch (e:any) {
      const msg = String(e?.message || e);
      if (/429|quota exceeded|rate limit/i.test(msg)) throw new GeminiQuotaError('Gemini quota exceeded', getRetrySeconds(msg));
      lastError = e;
    }
  }
  throw lastError ?? new Error('No Gemini model available');
}
