import { create } from 'zustand';
type S={task:string;setTask:(v:string)=>void;output:string;setOutput:(v:string)=>void};
export const useAgentStore=create<S>((set)=>({task:'',output:'',setTask:(task)=>set({task}),setOutput:(output)=>set({output})}));
