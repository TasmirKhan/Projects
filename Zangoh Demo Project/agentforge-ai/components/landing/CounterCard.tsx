'use client';
import { useEffect, useState } from 'react';
export function CounterCard({label,value}:{label:string;value:number}){const [n,setN]=useState(0);useEffect(()=>{let i=0;const step=Math.ceil(value/40);const t=setInterval(()=>{i+=step;if(i>=value){setN(value);clearInterval(t);} else setN(i);},22);return ()=>clearInterval(t);},[value]);
return <div className='card'><p className='muted text-xs'>{label}</p><p className='text-2xl mt-1'>{n}{label.includes('Rate')?'%':''}</p></div>}
