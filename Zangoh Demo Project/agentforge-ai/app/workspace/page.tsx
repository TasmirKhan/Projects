'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '@/store/useAgentStore';
import { executeWorkspaceTask } from '@/services/ai/workspace-service';
import { activateTo, getInitialStages } from '@/services/workflows/workflow-engine';
import { EscalationCard } from '@/components/workspace/EscalationCard';
import { QuickActions, employees } from '@/components/workspace/QuickActions';

export default function Workspace(){
const s=useAgentStore();
useEffect(()=>{if(!s.stages.length) s.setStages(getInitialStages());},[s]);
const run = async()=>{if(!s.task.trim()) return; s.setRunning(true); let local=getInitialStages(); s.setStages(local);
for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,260)); local=activateTo(local,i); s.setStages(local);} 
const res=await executeWorkspaceTask({task:s.task,employee:s.employee});
local=activateTo(local,5,[s.task,res.intent,res.workflowPlan.join(' • '),'Actions executed via AI route',res.outputs.title,res.requiresEscalation?'Escalated to human':'Completed']);
s.setStages(local); s.setResponse(res); s.setRunning(false); };

return <main className='max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-4'>
<div className='lg:col-span-2 card space-y-3'><h1 className='text-2xl'>Employee Workspace</h1>
<select aria-label='Digital employee selector' value={s.employee} onChange={(e)=>s.setEmployee(e.target.value as any)} className='bg-black border border-line rounded-xl p-2'>{employees.map(e=><option key={e}>{e}</option>)}</select>
<textarea value={s.task} onChange={(e)=>s.setTask(e.target.value)} className='w-full min-h-28 bg-black border border-line rounded-xl p-3' placeholder='Handle customer refund request' />
<div className='flex gap-2'><button disabled={s.isRunning} onClick={run} className='px-4 py-2 rounded-xl bg-white text-black disabled:opacity-40'>{s.isRunning?'Executing…':'Execute Task'}</button></div>
<div className='space-y-2'>{s.stages.map((stage)=><motion.div key={stage.key} layout className={`border rounded-lg p-3 text-sm ${stage.status==='active'?'border-white':'border-line'} ${stage.status==='complete'?'opacity-100':'opacity-70'}`}><p className='font-medium'>{stage.title}</p>{stage.detail&&<p className='text-zinc-400 mt-1'>{stage.detail}</p>}</motion.div>)}</div>
</div>
<div className='space-y-4'>
<QuickActions onPick={(v)=>s.setTask(v)} />
<div className='card'><h3>Reasoning Visibility</h3><p className='text-sm mt-2 text-zinc-300'>{s.response?.intent ?? 'Run a task to generate reasoning.'}</p><ul className='mt-3 space-y-1 text-sm'>{s.response?.reasoning?.map((r)=> <li key={r}>• {r}</li>)}</ul><p className='mt-3 text-sm'>Confidence: <span className='font-semibold'>{s.response?.confidence ?? '--'}%</span> · Risk: {s.response?.riskLevel ?? '--'}</p></div>
{s.response?.requiresEscalation && <EscalationCard question={s.response.clarifyingQuestion} />}
<div className='card'><h3>Generated Output</h3><p className='text-sm text-zinc-400 mt-2'>{s.response?.outputs?.title}</p><p className='text-sm mt-2 whitespace-pre-wrap'>{s.response?.outputs?.content}</p></div>
<div className='card'><h3>Audit Timeline</h3><ul className='mt-2 space-y-2 text-sm'>{s.response?.auditLogs?.map((l,idx)=><li key={idx} className='flex justify-between border-b border-line pb-1'><span>{l.event}</span><span className='text-zinc-500'>{l.time}</span></li>)}</ul></div>
</div></main>; }
