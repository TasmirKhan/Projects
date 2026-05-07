export type AgentType = 'Sales Employee' | 'Support Employee' | 'Operations Employee';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type WorkflowStageKey = 'TASK'|'INTENT_ANALYSIS'|'TASK_PLANNING'|'ACTION_EXECUTION'|'OUTPUT_GENERATION'|'ESCALATION_OR_COMPLETION';
export interface WorkflowStage { key: WorkflowStageKey; title: string; status: 'pending'|'active'|'complete'; detail?: string; }
export interface AuditLog { time: string; event: string; status: 'info'|'success'|'warning'; }
export interface WorkspaceResponse { intent:string; confidence:number; riskLevel:RiskLevel; workflowPlan:string[]; reasoning:string[]; outputs:{title:string;content:string}; auditLogs:AuditLog[]; requiresEscalation:boolean; clarifyingQuestion?:string; }
