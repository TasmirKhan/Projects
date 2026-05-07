import Link from 'next/link';
const links=[['Dashboard','/dashboard'],['Workspace','/workspace'],['Audit','/audit'],['Analytics','/analytics']];
export function Nav(){return <nav className='flex items-center justify-between py-6'><div className='font-semibold'>AgentForge AI</div><div className='flex gap-5 text-sm'>{links.map(([l,h])=><Link key={h} href={h} className='muted hover:text-white'>{l}</Link>)}</div></nav>}
