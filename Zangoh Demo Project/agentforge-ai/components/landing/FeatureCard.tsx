'use client';
import { motion } from 'framer-motion';import { useState } from 'react';
export function FeatureCard({title,detail}:{title:string;detail:string}){const [open,setOpen]=useState(false);
return <motion.button whileHover={{y:-4,scale:1.01}} onClick={()=>setOpen(!open)} className='card text-left w-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 hover:border-white/40'>
<h3 className='font-medium'>{title}</h3><p className='muted text-sm mt-2'>{open?detail:'Click to expand capabilities'}</p></motion.button>}
