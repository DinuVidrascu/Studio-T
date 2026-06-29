import { useState, useEffect } from "react";
import { TODAY, MONTHS_RO } from "./constants";

export const fmtDate  = d => new Date(d).toLocaleDateString('ro-RO', { day:'numeric', month:'short' });
export const daysLeft = d => Math.ceil((new Date(d) - TODAY) / 86400000);
export const daysBetw = (a,b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);
export const t2m      = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
export const m2t      = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
export const hm       = m => { if(!m) return '0h'; const h=Math.floor(m/60),mn=m%60; return h+'h'+(mn?' '+mn+'m':''); };
export const priorityLabel = p => p==='high'?'Prioritate inalta':p==='medium'?'Prioritate medie':'Prioritate joasa';
export const priorityColor = p => p==='high'?'#E2664A':p==='medium'?'#CC9526':'#5E8A55';

export const getWeekStart = date => {
  const d=new Date(typeof date==='string'?date:date.toISOString().split('T')[0]);
  const dow=d.getDay(); d.setDate(d.getDate()-(dow===0?6:dow-1));
  return d.toISOString().split('T')[0];
};

export const getWeekDays = ws => Array.from({length:7},(_,i)=>{ const d=new Date(ws); d.setDate(d.getDate()+i); return d.toISOString().split('T')[0]; });

export const fmtWeekRange = ws => { 
  const days=getWeekDays(ws), a=new Date(days[0]), b=new Date(days[6]);
  return a.getDate()+' '+MONTHS_RO[a.getMonth()].slice(0,3)+' - '+b.getDate()+' '+MONTHS_RO[b.getMonth()].slice(0,3); 
};

export function useWindowWidth() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200);
  useEffect(()=>{ 
    const h=()=>setW(window.innerWidth); 
    window.addEventListener('resize',h); 
    return ()=>window.removeEventListener('resize',h); 
  },[]);
  return w;
}
