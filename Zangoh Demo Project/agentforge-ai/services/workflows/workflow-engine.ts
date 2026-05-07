import { WorkflowStage } from '@/types/workspace';
const base: WorkflowStage[] = [
  { key:'TASK', title:'TASK', status:'pending' },
  { key:'INTENT_ANALYSIS', title:'INTENT ANALYSIS', status:'pending' },
  { key:'TASK_PLANNING', title:'TASK PLANNING', status:'pending' },
  { key:'ACTION_EXECUTION', title:'ACTION EXECUTION', status:'pending' },
  { key:'OUTPUT_GENERATION', title:'OUTPUT GENERATION', status:'pending' },
  { key:'ESCALATION_OR_COMPLETION', title:'ESCALATION OR COMPLETION', status:'pending' }
];
export const getInitialStages = () => structuredClone(base);
export const activateTo = (stages: WorkflowStage[], idx:number, details?:string[]) => stages.map((s,i)=>({ ...s, status:i<idx?'complete':i===idx?'active':'pending', detail: details?.[i] ?? s.detail }));
