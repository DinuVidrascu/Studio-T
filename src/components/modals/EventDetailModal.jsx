import React from "react";
import { X, Trash2 } from "lucide-react";
import { C, SERIF, SANS, EV_TYPES } from "../../utils/constants";
import { fmtDate, t2m, hm } from "../../utils/helpers";
import ModalWrap from "../layout/ModalWrap";
import Avatar from "../common/Avatar";

export default function EventDetailModal({ event: ev, team, projects, onClose, onDelete, isMobile }) {
  const members = team.filter(t => ev.team && ev.team.includes(t.id));
  const project = projects.find(p => p.id === ev.projectId);
  const c = (EV_TYPES[ev.type] || EV_TYPES.meeting).color;
  const dur = t2m(ev.endTime) - t2m(ev.startTime);
  const [activeTab, setActiveTab] = React.useState('details');

  return (
    <ModalWrap onClose={onClose} isMobile={isMobile}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            <span style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>
              {(EV_TYPES[ev.type] || EV_TYPES.meeting).label}
            </span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 19, color: C.ink, fontFamily: SERIF }}>{ev.title}</div>
        </div>
        <button onClick={onClose} style={{ 
          background: C.lineSoft, border: 'none', color: C.inkSoft, width: 28, height: 28, 
          borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
        }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '1px solid ' + C.line }}>
        {['details', 'participants'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent', border: 'none', padding: '8px 4px', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, fontFamily: SANS,
              color: activeTab === tab ? C.ink : C.inkFaint,
              borderBottom: activeTab === tab ? `2px solid ${C.ink}` : '2px solid transparent',
              transition: 'all 0.2s ease', position: 'relative', top: 1
            }}
          >
            {tab === 'details' ? '📝 Detalii' : '👥 Participanți & Proiect'}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 200, display: activeTab === 'details' ? 'block' : 'none' }}>
        <div style={{ background: C.panelAlt, borderRadius: 12, padding: 15, marginBottom: 14, display: 'flex', gap: 22 }}>
          <div>
            <div style={{ fontSize: 10.5, color: C.inkFaint, marginBottom: 3, fontFamily: SANS }}>data</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: SANS }}>{fmtDate(ev.date)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: C.inkFaint, marginBottom: 3, fontFamily: SANS }}>interval orar</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: SANS }}>
              {ev.startTime} - {ev.endTime} ({hm(dur)})
            </div>
          </div>
        </div>
        {ev.desc && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: C.inkSoft, marginBottom: 4, fontFamily: SANS }}>Descriere</label>
            <div style={{ 
              fontSize: 13, color: C.ink, background: C.panelAlt, padding: '10px 12px', 
              borderRadius: 10, minHeight: 48, fontFamily: SANS 
            }}>
              {ev.desc}
            </div>
          </div>
        )}
      </div>

      <div style={{ minHeight: 200, display: activeTab === 'participants' ? 'block' : 'none' }}>
        {project && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: C.inkSoft, marginBottom: 4, fontFamily: SANS }}>Proiect asociat</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: C.panelAlt, borderRadius: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: C.ink, fontFamily: SANS }}>{project.name}</span>
            </div>
          </div>
        )}
        {members.length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: C.inkSoft, marginBottom: 6, fontFamily: SANS }}>Participanti ({members.length})</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar p={m} size={24} />
                  <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 500, fontFamily: SANS }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: C.inkSoft, fontFamily: SANS }}>• {m.role}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: SANS }}>Niciun participant.</span>
        )}
      </div>
      <div style={{ borderTop: '1px solid ' + C.line, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onDelete} style={{ 
          display: 'flex', alignItems: 'center', gap: 6, background: C.coralSoft, color: C.coral, 
          border: 'none', padding: '8px 14px', borderRadius: 10, fontSize: 12.5, 
          fontWeight: 600, cursor: 'pointer', fontFamily: SANS 
        }}>
          <Trash2 size={14} /> Sterge eveniment
        </button>
      </div>
    </ModalWrap>
  );
}
