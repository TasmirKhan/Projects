'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { CounterCard } from '@/components/landing/CounterCard';
import { features, metrics, workflow } from '@/lib/landing-data';
export default function Home(){
const scrollDemo=()=>document.getElementById('workflow-demo')?.scrollIntoView({behavior:'smooth'});
return <main className='max-w-6xl mx-auto px-6 pb-16'>
<LandingNavbar/>
<motion.section initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className='py-16 space-y-6'>
<p className='text-xs tracking-[0.22em] muted'>OUTCOME-FIRST AUTONOMY</p>
<h1 className='text-4xl md:text-5xl font-semibold max-w-4xl'>Outcome-First Autonomous Digital Employees</h1>
<p className='text-zinc-300 max-w-2xl'>AI employees that execute workflows, automate operations, and keep humans focused on creativity.</p>
<div className='flex flex-col sm:flex-row gap-3'>
<Link href='/dashboard' className='px-4 py-2 bg-white text-black rounded-xl hover:scale-[1.02] transition active:scale-95'>Launch Platform</Link>
<button onClick={scrollDemo} className='px-4 py-2 border border-line rounded-xl hover:border-white/50 transition'>Watch Demo</button>
</div></motion.section>
<section className='grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-10'>{metrics.map(m=><CounterCard key={m.label} {...m}/>)}</section>
<motion.section initial='hidden' whileInView='show' viewport={{once:true}} variants={{hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.08}}}} className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-14'>
{features.map(f=><motion.div key={f.title} variants={{hidden:{opacity:0,y:10},show:{opacity:1,y:0}}}><FeatureCard title={f.title} detail={f.detail}/></motion.div>)}</motion.section>
<section id='workflow-demo' className='card'><h2 className='text-xl mb-4'>Workflow Preview</h2><div className='grid md:grid-cols-3 gap-3'>{workflow.map(step=><div key={step} className='border border-line rounded-xl p-3 text-sm'>{step}</div>)}</div></section>
</main>;}
