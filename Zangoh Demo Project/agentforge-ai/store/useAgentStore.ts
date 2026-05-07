import { create } from 'zustand';
import { AgentType, WorkspaceResponse, WorkflowStage } from '@/types/workspace';

type S={task:string;employee:AgentType;stages:WorkflowStage[];response?:WorkspaceResponse;isRunning:boolean;setTask:(v:string)=>void;setEmployee:(v:AgentType)=>void;setStages:(v:WorkflowStage[])=>void;setResponse:(v:WorkspaceResponse)=>void;setRunning:(v:boolean)=>void};
export const useAgentStore=create<S>((set)=>({task:'',employee:'Support Employee',stages:[],isRunning:false,setTask:(task)=>set({task}),setEmployee:(employee)=>set({employee}),setStages:(stages)=>set({stages}),setResponse:(response)=>set({response}),setRunning:(isRunning)=>set({isRunning})}));
