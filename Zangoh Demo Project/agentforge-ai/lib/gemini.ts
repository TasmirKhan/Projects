import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = ['gemini-1.5-flash-latest','gemini-2.0-flash'] as const;

const maskKey = (key:string) => key.length <= 8 ? 'configured key' : `${key.slice(0,4)}…${key.slice(-4)}`;

export function parseGeminiApiKeys(apiKey:string) {
  return apiKey
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
}

export class GeminiQuotaError extends Error {
  retryAfterSeconds?: number;
  constructor(message:string,retryAfterSeconds?:number){ super(message); this.name='GeminiQuotaError'; this.retryAfterSeconds=retryAfterSeconds; }
}

const getRetrySeconds = (message:string) => {
  const m = message.match(/retry in\s+(\d+(?:\.\d+)?)s/i) || message.match(/retryDelay":"(\d+)s"/i);
  return m ? Math.ceil(Number(m[1])) : undefined;
};

export async function runGeminiPrompt(apiKey:string, prompt:string, timeoutMs=30000) {
  const apiKeys = parseGeminiApiKeys(apiKey);
  if (!apiKeys.length) throw new Error('No Gemini API key configured');

  let lastError: unknown;
  let longestRetryAfter: number | undefined;
  const quotaFailures: string[] = [];

  for (const currentKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(currentKey);
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const op = model.generateContent(prompt).then((r)=>({ text:r.response.text(), modelName }));
        const timed = Promise.race([op, new Promise<never>((_,rej)=>setTimeout(()=>rej(new Error(`Gemini timeout on ${modelName}`)),timeoutMs))]);
        return await timed;
      } catch (e:any) {
        const msg = String(e?.message || e);
        if (/429|quota exceeded|rate limit/i.test(msg)) {
          const retryAfter = getRetrySeconds(msg);
          if (retryAfter && (!longestRetryAfter || retryAfter > longestRetryAfter)) longestRetryAfter = retryAfter;
          quotaFailures.push(`${maskKey(currentKey)} on ${modelName}`);
          lastError = e;
          continue;
        }
        lastError = e;
      }
    }
  }

  if (quotaFailures.length) {
    throw new GeminiQuotaError(`Gemini quota exceeded for ${quotaFailures.join(', ')}`, longestRetryAfter);
  }

  throw lastError ?? new Error('No Gemini model available');
}
