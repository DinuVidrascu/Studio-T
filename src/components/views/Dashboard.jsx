import React, { useState } from "react";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { C, SERIF, SANS, TODAY_STR, EV_TYPES } from "../../utils/constants";
import { fmtDate, daysLeft } from "../../utils/helpers";
import Card from "../common/Card";
import SectionTitle from "../common/SectionTitle";
import AddBtn from "../common/AddBtn";
import Bar from "../common/Bar";
import Badge from "../common/Badge";
import Avatar from "../common/Avatar";
import Skeleton from "../common/Skeleton";

function ProjRow({ p, onClick, menuOpenId, setMenuOpenId, onOpen, onDelete, userRole = 'admin' }) {
  const d = daysLeft(p.endDate);
  return (
    <div onClick={onClick} style={{ 
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 13,
      borderBottom: '1px solid ' + C.lineSoft, cursor: 'pointer', position: 'relative'
    }}>
      <div style={{ 
        width: 38, height: 38, borderRadius: 11, background: p.color + '1A', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
      }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap', color: C.ink, marginBottom: 6, fontFamily: SANS 
        }}>{p.name}</div>
        <Bar value={p.progress} color={p.color} h={5} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge status={p.status} />
        {userRole === 'admin' && (
          <button 
            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === p.id ? null : p.id); }}
            style={{ background: 'transparent', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 2 }}
          >
            <MoreHorizontal size={16} />
          </button>
        )}
        </div>
        <span style={{ fontSize: 11, color: d <= 7 && p.status !== 'completed' ? C.coral : C.inkFaint, fontWeight: 500, fontFamily: SANS }}>
          {d < 0 ? 'depasit' : d === 0 ? 'azi!' : d + ' zile'}
        </span>
        
        {menuOpenId === p.id && (
          <div 
            style={{ 
              position: 'absolute', top: 35, right: 18, background: C.panel, 
              borderRadius: 10, boxShadow: C.shadow, 
              border: '1px solid ' + C.line, zIndex: 100, minWidth: 120, overflow: 'hidden'
            }}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); onOpen(p); setMenuOpenId(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid ' + C.lineSoft, textAlign: 'left', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: SANS }}
            ><Edit2 size={14} /> Editează</button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(p.id); setMenuOpenId(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.coral, fontFamily: SANS }}
            ><Trash2 size={14} /> Șterge</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ projects, team, events, onOpen, onAdd, onDeleteProject, onNavigate, isMobile, isLoading, userRole = 'admin' }) {
  const [menuOpenId, setMenuOpenId] = useState(null);

  if (isLoading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map(i => (
            <Card key={i} style={{ padding: 20 }}>
              <Skeleton width={40} height={40} borderRadius={10} style={{ marginBottom: 16 }} />
              <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={14} />
            </Card>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 24 }}>
          <Card style={{ padding: 24 }}>
            <Skeleton width={120} height={20} style={{ marginBottom: 24 }} />
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Skeleton width={38} height={38} borderRadius={11} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
                  <Skeleton width="100%" height={5} />
                </div>
              </div>
            ))}
          </Card>
          <Card style={{ padding: 24 }}>
            <Skeleton width={120} height={20} style={{ marginBottom: 24 }} />
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Skeleton width={38} height={38} borderRadius={11} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height={14} style={{ marginBottom: 4 }} />
                  <Skeleton width="40%" height={10} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  const active   = projects.filter(p=>p.status==='active'||p.status==='at-risk');
  const urgent   = projects.filter(p=>{ const d=daysLeft(p.endDate); return d>=0&&d<=7&&p.status!=='completed'; });
  const done     = projects.filter(p=>p.status==='completed');
  const avgProg  = active.length?Math.round(active.reduce((s,p)=>s+p.progress,0)/active.length):0;
  const todayEvs = events.filter(e=>e.date===TODAY_STR).sort((a,b)=>a.startTime.localeCompare(b.startTime));

  const stats=[
    { label:'proiecte active',  value:active.length, color:C.primary, filter:'active' },
    { label:'deadline urgente', value:urgent.length, color:C.coral,   filter:'at-risk' },
    { label:'finalizate',       value:done.length,   color:C.sage,    filter:'completed' },
    { label:'progres mediu',    value:avgProg+'%',  color:C.amber,   filter:'all' },
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:isMobile?18:26 }}>
        <div>
          {!isMobile && <h1 style={{ margin:0, fontSize:30, fontWeight:600, color:C.ink, fontFamily:SERIF, letterSpacing:'-0.5px' }}>Buna ziua</h1>}
          <p style={{ margin:isMobile?'4px 0 0':'6px 0 0', color:C.inkSoft, fontSize:isMobile?13:14, fontFamily:SANS }}>Luni, 29 iunie 2026</p>
        </div>
        {userRole === 'admin' && (
          <AddBtn onClick={onAdd} label={isMobile?'Proiect':'Proiect nou'} isMobile={isMobile} />
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:isMobile?12:16, marginBottom:isMobile?18:26 }}>
        {stats.map((s,i)=>(
          <Card key={i} onClick={() => onNavigate && onNavigate('projects', s.filter)} style={{ padding:isMobile?'18px 18px':'22px 24px', cursor: 'pointer' }}>
            <div style={{ fontSize:isMobile?34:42, fontWeight:600, color:s.color, fontFamily:SERIF, lineHeight:1, marginBottom:8, letterSpacing:'-1px' }}>{s.value}</div>
            <div style={{ fontSize:isMobile?11:12, color:C.inkSoft, fontFamily:SANS }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {isMobile && todayEvs.length>0 && (
        <div style={{ marginBottom:18 }}>
          <SectionTitle>Azi - {fmtDate(TODAY_STR)}</SectionTitle>
          {todayEvs.map(ev=>{
            const c=(EV_TYPES[ev.type]||EV_TYPES.meeting).color;
            return (
              <Card key={ev.id} style={{ display:'flex', gap:13, padding:'13px 15px', marginBottom:9 }}>
                <div style={{ width:3, borderRadius:2, background:c, flexShrink:0 }} />
                <div style={{ fontSize:11, color:C.inkSoft, flexShrink:0, width:42, fontFamily:SANS }}>
                  <div style={{ fontWeight:600 }}>{ev.startTime}</div><div style={{ marginTop:2 }}>{ev.endTime}</div>
                </div>
                <div><div style={{ fontSize:13.5, fontWeight:600, color:C.ink, fontFamily:SANS }}>{ev.title}</div>
                  <div style={{ fontSize:11, color:C.inkSoft, marginTop:2, fontFamily:SANS }}>{(EV_TYPES[ev.type]||EV_TYPES.meeting).label}</div></div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:isMobile?16:20, marginBottom:20 }}>
        <div>
          <SectionTitle count={active.length}>Proiecte active</SectionTitle>
          <Card style={{ overflow:'hidden' }}>
            {active.map(p=><ProjRow key={p.id} p={p} onClick={()=>onOpen(p)} menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId} onOpen={onOpen} onDelete={onDeleteProject} userRole={userRole} />)}
            {!active.length && <div style={{ padding:26, textAlign:'center', color:C.inkFaint, fontSize:13, fontFamily:SANS }}>Niciun proiect activ</div>}
          </Card>
        </div>
        <div>
          <SectionTitle>Urmatoarele deadline-uri</SectionTitle>
          <Card style={{ overflow:'hidden' }}>
            {projects.filter(p=>p.status!=='completed').sort((a,b)=>new Date(a.endDate)-new Date(b.endDate)).slice(0,5).map(p=>{
              const d=daysLeft(p.endDate), urg=d<=7;
              return (
                <div key={p.id} onClick={()=>onOpen(p)} style={{ padding:'13px 18px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid '+C.lineSoft, cursor:'pointer', position: 'relative' }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:p.color+'1A', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:p.color }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:C.ink, fontFamily:SANS }}>{p.name}</div>
                    <div style={{ fontSize:11, color:C.inkSoft, marginTop:1, fontFamily:SANS }}>{fmtDate(p.endDate)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink:0 }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, fontFamily:SANS,
                      background:urg?C.coralSoft:C.lineSoft, color:urg?C.coral:C.inkSoft }}>
                      {d<0?'depasit':d===0?'azi!':d<=7?d+' zile':d+' zile'}
                    </span>
                    {userRole === 'admin' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === p.id ? null : p.id); }}
                        style={{ background: 'transparent', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 2 }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    )}
                  </div>
                  
                  {menuOpenId === p.id && (
                    <div 
                      style={{ 
                        position: 'absolute', top: 35, right: 18, background: C.panel, 
                        borderRadius: 10, boxShadow: C.shadow, 
                        border: '1px solid ' + C.line, zIndex: 100, minWidth: 120, overflow: 'hidden'
                      }}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpen(p); setMenuOpenId(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid ' + C.lineSoft, textAlign: 'left', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.ink, fontFamily: SANS }}
                      ><Edit2 size={14} /> Editează</button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); setMenuOpenId(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.coral, fontFamily: SANS }}
                      ><Trash2 size={14} /> Șterge</button>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      {!isMobile && (
        <div>
          <SectionTitle count={todayEvs.length+' evenimente'}>Programul de azi</SectionTitle>
          <Card style={{ overflow:'hidden' }}>
            {todayEvs.length>0 ? (
              <div style={{ display:'flex', flexWrap:'wrap' }}>
                {todayEvs.map(ev=>{
                  const c=(EV_TYPES[ev.type]||EV_TYPES.meeting).color;
                  const members=team.filter(t=>ev.team&&ev.team.includes(t.id));
                  return (
                    <div key={ev.id} style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:13, borderBottom:'1px solid '+C.lineSoft, width:'50%', boxSizing:'border-box' }}>
                      <div style={{ width:3, height:38, borderRadius:2, background:c, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13.5, fontWeight:600, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:SANS }}>{ev.title}</div>
                        <div style={{ fontSize:11, color:C.inkSoft, marginTop:2, fontFamily:SANS }}>{ev.startTime} - {ev.endTime}</div>
                      </div>
                      <div style={{ display:'flex' }}>
                        {members.slice(0,3).map((m,i)=><div key={m.id} style={{ marginLeft:i>0?-7:0, border:'2px solid '+C.panel, borderRadius:'50%' }}><Avatar p={m} size={24} /></div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div style={{ padding:26, textAlign:'center', color:C.inkFaint, fontSize:13, fontFamily:SANS }}>Niciun eveniment azi</div>}
          </Card>
        </div>
      )}
    </div>
  );
}
