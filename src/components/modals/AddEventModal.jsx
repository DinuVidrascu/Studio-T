import React, { useState } from "react";
import { X } from "lucide-react";
import { C, SERIF, SANS, EV_TYPES, TODAY_STR } from "../../utils/constants";
import ModalWrap from "../layout/ModalWrap";
import FField from "../common/FField";
import Avatar from "../common/Avatar";

const inputStyle = { 
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid ' + C.line, 
  background: C.panelAlt, color: C.ink, fontSize: 13.5, outline: 'none', 
  boxSizing: 'border-box', fontFamily: SANS 
};

export default function AddEventModal({ team, projects, defaultDate, onAdd, onClose, isMobile }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('meeting');
  const [date, setDate] = useState(defaultDate || TODAY_STR);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [projectId, setProjectId] = useState('');
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [desc, setDesc] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const handleSubmit = e => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ 
      id: 'ev_' + Date.now(), title, type, date, startTime, endTime, projectId, 
      team: selectedTeam, desc 
    });
  };

  const toggleTeam = tid => {
    setSelectedTeam(prev => prev.includes(tid) ? prev.filter(id => id !== tid) : [...prev, tid]);
  };

  return (
    <ModalWrap onClose={onClose} isMobile={isMobile}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontFamily: SERIF, color: C.ink }}>Eveniment nou</h2>
        <button onClick={onClose} style={{ 
          background: C.lineSoft, border: 'none', color: C.inkSoft, width: 28, height: 28, 
          borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '1px solid ' + C.line }}>
        {['details', 'extra'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent', border: 'none', padding: '8px 4px', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, fontFamily: SANS,
              color: activeTab === tab ? C.ink : C.inkFaint,
              borderBottom: activeTab === tab ? `2px solid ${C.ink}` : '2px solid transparent',
              transition: 'all 0.2s ease', position: 'relative', top: 1
            }}
          >
            {tab === 'details' ? '📝 Detalii' : '🔗 Alocare & Info'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        <div style={{ minHeight: 280, display: activeTab === 'details' ? 'flex' : 'none', flexDirection: 'column', gap: 14 }}>
          <FField label="Titlu">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex. Sedinta de aliniere" style={inputStyle} />
          </FField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FField label="Tip">
              <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
                {Object.entries(EV_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </FField>
            <FField label="Data">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
            </FField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FField label="Ora inceput">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
            </FField>
            <FField label="Ora sfarsit">
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
            </FField>
          </div>
        </div>

        <div style={{ minHeight: 280, display: activeTab === 'extra' ? 'flex' : 'none', flexDirection: 'column', gap: 14 }}>
          <FField label="Proiect">
            <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
              <option value="">Fara proiect asociat</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FField>
          <FField label="Membri echipa">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' }}>
              {team.map(t => {
                const sel = selectedTeam.includes(t.id);
                return (
                  <button type="button" key={t.id} onClick={() => toggleTeam(t.id)} style={{ 
                    display: 'flex', alignItems: 'center', gap: 6, background: sel ? C.primarySoft : C.panelAlt, 
                    border: '1px solid ' + (sel ? C.primary : C.line), padding: '6px 10px', borderRadius: 20, 
                    cursor: 'pointer', color: sel ? C.primary : C.ink, fontSize: 12, fontWeight: 500, fontFamily: SANS 
                  }}>
                    <Avatar p={t} size={18} /> {t.name}
                  </button>
                );
              })}
            </div>
          </FField>
          <FField label="Descriere">
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} placeholder="Detalii suplimentare..." />
          </FField>
        </div>

        <button type="submit" style={{ 
          background: C.ink, color: C.paper, border: 'none', padding: '12px', borderRadius: 10,
          fontSize: 13.5, fontWeight: 600, cursor: 'pointer', marginTop: 8, fontFamily: SANS 
        }}>
          Adauga eveniment
        </button>
      </form>
    </ModalWrap>
  );
}
