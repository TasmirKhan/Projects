'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '@/store/useAgentStore';
import { executeWorkspaceTask } from '@/services/ai/workspace-service';
import { activateTo, getInitialStages } from '@/services/workflows/workflow-engine';
import { EscalationCard } from '@/components/workspace/EscalationCard';
import { QuickActions, employees } from '@/components/workspace/QuickActions';

export default function Workspace(){
const s=useAgentStore(); const [live,setLive]=useState<string[]>([]); const [error,setError]=useState<string>(''); const [uploading,setUploading]=useState(0); const [fileMeta,setFileMeta]=useState<{name:string;text:string}|null>(null);
useEffect(()=>{if(!s.stages.length) s.setStages(getInitialStages());},[s]);
const uploadFile = async(file:File)=>{setUploading(20);setError('');const fd=new FormData();fd.append('file',file);try{const timer=setInterval(()=>setUploading(v=>Math.min(v+15,90)),200);const res=await fetch('/api/workspace/upload',{method:'POST',body:fd});clearInterval(timer);const data=await res.json();if(!res.ok) throw new Error(data.error||'Upload failed');setFileMeta({name:data.name,text:data.text});setUploading(100);setTimeout(()=>setUploading(0),400);}catch(e:any){setError(e.message);setUploading(0);}};
const run = async()=>{if(!s.task.trim()) return; s.setRunning(true); setLive([]); setError(''); let local=getInitialStages(); s.setStages(local);
try {
const streamRes = await fetch('/api/workspace/execute-stream',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:s.task,employee:s.employee})});
const reader = streamRes.body?.getReader(); const decoder = new TextDecoder();
if(reader){let chunk=''; while(true){const {done,value}=await reader.read(); if(done) break; chunk += decoder.decode(value,{stream:true}); const parts = chunk.split('\n\n'); chunk = parts.pop() || ''; for(const p of parts){const m=p.match(/event: (.*)\ndata: (.*)/s); if(m){const evt=m[1].trim(); const d=JSON.parse(m[2]); if(evt==='progress'&&d.stage) setLive(v=>[...v,`${d.stage}: ${d.message}`]); if(evt==='error') setError(d.message);}}}}
const enrichedTask = fileMeta ? `${s.task}\n\nUploaded File (${fileMeta.name}):\n${fileMeta.text.slice(0,5000)}` : s.task;
const res=await executeWorkspaceTask({task:enrichedTask,employee:s.employee});
for(let i=0;i<6;i++) local=activateTo(local,i,[s.task,res.intent,res.workflowPlan.join(' • '),'Autonomous actions completed',res.outputs.title,res.requiresEscalation?'Escalated to human':'Completed']);
s.setStages(local); s.setResponse(res);
} catch(e:any){setError(e.message || 'Network error during execution.');}
finally {s.setRunning(false);} };

return <main className='max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-4'>
<div className='lg:col-span-2 card space-y-3'><h1 className='text-2xl'>Employee Workspace</h1>
<select aria-label='Digital employee selector' value={s.employee} onChange={(e)=>s.setEmployee(e.target.value as any)} className='bg-black border border-line rounded-xl p-2'>{employees.map(e=><option key={e}>{e}</option>)}</select>
<textarea value={s.task} onChange={(e)=>s.setTask(e.target.value)} className='w-full min-h-28 bg-black border border-line rounded-xl p-3' placeholder='Generate and send customer refund email' />
<label className='border border-dashed border-line rounded-xl p-4 block text-sm cursor-pointer'>Upload file (PDF, TXT, DOCX, MD, JSON)
<input type='file' className='hidden' accept='.pdf,.txt,.docx,.md,.markdown,.json,application/pdf,text/plain,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown' onChange={(e)=>e.target.files?.[0]&&uploadFile(e.target.files[0])}/></label>
{uploading>0&&<div className='h-2 bg-zinc-800 rounded'><div className='h-2 bg-white rounded' style={{width:`${uploading}%`}}/></div>}
{fileMeta&&<div className='text-xs text-zinc-400 flex justify-between'><span>Attached: {fileMeta.name}</span><button onClick={()=>setFileMeta(null)} className='underline'>Remove</button></div>}
<button disabled={s.isRunning} onClick={run} className='px-4 py-2 rounded-xl bg-white text-black disabled:opacity-40'>{s.isRunning?'Executing…':'Execute Task'}</button>
{(s.isRunning || error) && <div className={`text-xs ${error?'text-red-400':'text-zinc-400'} animate-pulse`}>{error || 'Autonomous execution in progress...'}</div>}
<div className='space-y-2'>{s.stages.map((stage)=><motion.div key={stage.key} layout className={`border rounded-lg p-3 text-sm ${stage.status==='active'?'border-white':'border-line'} ${stage.status==='complete'?'opacity-100':'opacity-70'}`}><p className='font-medium'>{stage.title}</p>{stage.detail&&<p className='text-zinc-400 mt-1'>{stage.detail}</p>}</motion.div>)}</div>
</div>
<div className='space-y-4'>
<QuickActions onPick={(v)=>s.setTask(v)} />
<div className='card'><h3>Streaming Execution Feed</h3><ul className='mt-2 text-sm space-y-1'>{live.map((l,i)=><li key={i}>• {l}</li>)}</ul>{error&&<button onClick={run} className='mt-3 text-xs underline'>Retry</button>}</div>
<div className='card'><h3>Reasoning Visibility</h3><p className='text-sm mt-2 text-zinc-300'>{s.response?.intent ?? 'Run a task to generate reasoning.'}</p><ul className='mt-3 space-y-1 text-sm'>{s.response?.reasoning?.map((r)=> <li key={r}>• {r}</li>)}</ul><p className='mt-3 text-sm'>Confidence: <span className='font-semibold'>{s.response?.confidence ?? '--'}%</span> · Risk: {s.response?.riskLevel ?? '--'}</p></div>
{s.response?.requiresEscalation && <EscalationCard question={s.response.clarifyingQuestion} />}
<div className='card'><h3>Generated Output</h3><p className='text-sm text-zinc-400 mt-2'>{s.response?.outputs?.title}</p><p className='text-sm mt-2 whitespace-pre-wrap'>{s.response?.outputs?.content}</p></div>
<div className='card'><h3>Audit Timeline</h3><ul className='mt-2 space-y-2 text-sm'>{s.response?.auditLogs?.map((l,idx)=><li key={idx} className='flex justify-between border-b border-line pb-1'><span>{l.event}</span><span className='text-zinc-500'>{l.time}</span></li>)}</ul></div>
</div></main>; }
