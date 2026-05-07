'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
const items=[{name:'Dashboard',href:'/dashboard'},{name:'Workspace',href:'/workspace'},{name:'Audit',href:'/audit'},{name:'Analytics',href:'/analytics'}];
export function LandingNavbar(){const pathname=usePathname();const [open,setOpen]=useState(false);const [scrolled,setScrolled]=useState(false);
useEffect(()=>{const h=()=>setScrolled(window.scrollY>6);h();window.addEventListener('scroll',h);return ()=>window.removeEventListener('scroll',h);},[]);
return <header className={`sticky top-0 z-50 transition ${scrolled?'backdrop-blur bg-black/60 border-b border-white/10':'bg-transparent'}`}><nav className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'><Link href='/' className='font-semibold'>AgentForge AI</Link><button aria-label='Toggle menu' className='md:hidden border border-line rounded-lg p-2' onClick={()=>setOpen(!open)}>{open?<X size={16}/>:<Menu size={16}/>}</button><div className='hidden md:flex gap-5 text-sm'>{items.map(i=><Link key={i.href} href={i.href} className={`hover:text-white transition ${pathname===i.href?'text-white':'text-zinc-400'}`}>{i.name}</Link>)}</div></nav>{open&&<div className='md:hidden px-6 pb-4 flex flex-col gap-2'>{items.map(i=><Link onClick={()=>setOpen(false)} key={i.href} href={i.href} className='py-2 text-zinc-300'>{i.name}</Link>)}</div>}</header>}
