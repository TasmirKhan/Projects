import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = ['gemini-1.5-flash-latest','gemini-2.0-flash'] as const;

export async function runGeminiPrompt(apiKey:string, prompt:string, timeoutMs=30000) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const op = model.generateContent(prompt).then((r)=>({ text:r.response.text(), modelName }));
      const timed = Promise.race([op, new Promise<never>((_,rej)=>setTimeout(()=>rej(new Error(`Gemini timeout on ${modelName}`)),timeoutMs))]);
      return await timed;
    } catch (e) { lastError = e; }
  }
  throw lastError ?? new Error('No Gemini model available');
}
