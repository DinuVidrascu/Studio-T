import React, { useState } from "react";
import { X } from "lucide-react";
import { C, SERIF, SANS, PALETTE, STATUS_META, TODAY_STR } from "../../utils/constants";
import ModalWrap from "../layout/ModalWrap";
import FField from "../common/FField";
import Avatar from "../common/Avatar";

const inputStyle = { 
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid ' + C.line, 
  background: C.panelAlt, color: C.ink, fontSize: 13.5, outline: 'none', 
  boxSizing: 'border-box', fontFamily: SANS 
};

export default function AddProjectModal({ team, onAdd, onClose, isMobile, defaultSelectedTeam = [] }) {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState(TODAY_STR);
  const [endDate, setEndDate] = useState(TODAY_STR);
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState('medium');
  const [selectedTeam, setSelectedTeam] = useState(defaultSelectedTeam);
  const [color, setColor] = useState(PALETTE[0]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!name.trim() || !client.trim()) return;
    onAdd({
      id: 'p_' + Date.now(),
      name, client, status, startDate, endDate, progress: parseInt(progress), priority,
      team: selectedTeam, color
    });
  };

  const toggleTeam = tid => {
    setSelectedTeam(prev => prev.includes(tid) ? prev.filter(id => id !== tid) : [...prev, tid]);
  };

  return (
    <ModalWrap onClose={onClose} isMobile={isMobile}>
      <div style={{ display:'flex',justifyContent: 'space-between',alignItems:'center',marginBottom:18 }}>
        <h2 style={{ margin:0,fontSize:18,fontFamily:SERIF,color:C.ink }}>Proiect nou</h2>
        <button onClick={onClose} style={{ 
          background:C.lineSoft,border:'none',color:C.inkSoft,width:28,height:28,
          borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' 
        }}>
          <X size={14}/>
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
        <FField label="Nume Proiect">
          <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Ex. Redesign Aplicatie" style={inputStyle} />
        </FField>
        <FField label="Client">
          <input type="text" value={client} onChange={e=>setClient(e.target.value)} required placeholder="Ex. Orange Moldova" style={inputStyle} />
        </FField>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <FField label="Status">
            <select value={status} onChange={e=>setStatus(e.target.value)} style={inputStyle}>
              {Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </FField>
          <FField label="Prioritate">
            <select value={priority} onChange={e=>setPriority(e.target.value)} style={inputStyle}>
              <option value="high">Inalta</option>
              <option value="medium">Medie</option>
              <option value="low">Joasa</option>
            </select>
          </FField>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <FField label="Data inceput">
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputStyle} />
          </FField>
          <FField label="Data sfarsit">
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle} />
          </FField>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <FField label="Progres (%)">
            <input type="number" min="0" max="100" value={progress} onChange={e=>setProgress(e.target.value)} style={inputStyle} />
          </FField>
          <FField label="Culoare branding">
            <div style={{ display: 'flex', gap: 6, paddingTop: 6 }}>
              {PALETTE.map(c => (
                <button type="button" key={c} onClick={() => setColor(c)} style={{
                  width: 22, height: 22, borderRadius: '50%', background: c, 
                  border: color === c ? '2px solid ' + C.ink : 'none', cursor: 'pointer'
                }} />
              ))}
            </div>
          </FField>
        </div>
        <FField label="Echipa Alocata">
          <div style={{ display:'flex',flexWrap:'wrap',gap:8,padding:'4px 0' }}>
            {team.map(t=>{
              const sel=selectedTeam.includes(t.id);
              return (
                <button type="button" key={t.id} onClick={()=>toggleTeam(t.id)} style={{ 
                  display:'flex',alignItems:'center',gap:6,background:sel?C.primarySoft:C.panelAlt,
                  border:'1px solid '+(sel?C.primary:C.line),padding:'6px 10px',borderRadius:20,
                  cursor:'pointer',color:sel?C.primary:C.ink,fontSize:12,fontWeight:500, fontFamily:SANS 
                }}>
                  <Avatar p={t} size={18}/> {t.name}
                </button>
              );
            })}
          </div>
        </FField>
        <button type="submit" style={{ 
          background:C.ink,color:C.paper,border:'none',padding:'12px',borderRadius:10,
          fontSize:13.5,fontWeight:600,cursor:'pointer',marginTop:8, fontFamily:SANS 
        }}>
          Adauga proiect
        </button>
      </form>
    </ModalWrap>
  );
}
