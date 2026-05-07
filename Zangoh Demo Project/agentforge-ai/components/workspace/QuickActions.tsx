import { AgentType } from '@/types/workspace';
const actions=['Generate Email','Draft Reply','Create Summary','Extract Tasks','Generate Follow-Up','Create Meeting Notes'];
export function QuickActions({onPick}:{onPick:(v:string)=>void}){return <div className='card'><h3 className='mb-3'>Quick Actions</h3><div className='grid sm:grid-cols-2 gap-2'>{actions.map(a=><button key={a} onClick={()=>onPick(a)} className='text-left text-sm border border-line rounded-lg px-3 py-2 hover:border-white/40'>{a}</button>)}</div></div>}
export const employees:AgentType[]=['Sales Employee','Support Employee','Operations Employee'];
