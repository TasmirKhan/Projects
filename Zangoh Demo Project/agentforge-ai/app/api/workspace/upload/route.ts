import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const ALLOWED = ['application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/markdown','application/json'];

export async function POST(req: Request){
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if(!file) return NextResponse.json({ error:'No file provided' },{ status:400 });
    if(!ALLOWED.includes(file.type)) return NextResponse.json({ error:'Unsupported type' },{ status:400 });
    const buf = Buffer.from(await file.arrayBuffer());
    let text='';
    if(file.type==='application/pdf') text=(await pdf(buf)).text;
    else if(file.type.includes('wordprocessingml')) text=(await mammoth.extractRawText({ buffer: buf })).value;
    else text=buf.toString('utf-8');
    return NextResponse.json({ name:file.name, size:file.size, text:text.slice(0,30000) });
  } catch(e:any){
    return NextResponse.json({ error:e?.message || 'Upload parsing failed' },{ status:500 });
  }
}
