import { WorkspaceResponse, AgentType } from '@/types/workspace';
export async function executeWorkspaceTask(payload:{task:string;employee:AgentType;attachments?:string[]}):Promise<WorkspaceResponse>{
  const res=await fetch('/api/workspace/execute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!res.ok) throw new Error('Execution failed');
  return res.json();
}
