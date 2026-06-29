import React, { useState } from "react";
import { X, Check, XCircle, Calendar, Clock, User } from "lucide-react";
import { C, SERIF, SANS } from "../../utils/constants";
import Avatar from "../common/Avatar";

export default function EventRequestModal({ requests, team, onAccept, onRefuse, onProposeNewTime, isMobile }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [proposingTime, setProposingTime] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  if (!requests || requests.length === 0) return null;

  const ev = requests[currentIdx];
  const creator = team.find(t => t.userId === ev.creatorUserId || t.email === ev.creatorEmail);
  const taggedMembers = team.filter(t => (ev.team || []).includes(t.id));
  const hasMore = requests.length > 1;

  const handlePropose = () => {
    if (!newDate || !newStart || !newEnd) return;
    onProposeNewTime(ev, newDate, newStart, newEnd);
    setProposingTime(false);
    setNewDate(''); setNewStart(''); setNewEnd('');
  };

  const EV_TYPE_LABELS = {
    meeting: 'Ședință', call: 'Convorbire', review: 'Revizie',
    workshop: 'Workshop', focus: 'Focus', deadline: 'Deadline', other: 'Altul'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
      animation: 'fadeInBackdrop 0.2s ease'
    }}>
      <div style={{
        background: C.panel, borderRadius: 20, width: isMobile ? '92vw' : 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden',
        animation: 'scaleUpModal 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: SANS
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}22, ${C.primary}08)`,
          borderBottom: `1px solid ${C.primary}30`,
          padding: '20px 22px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, background: C.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>📅</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Cerere de întâlnire nouă
                </div>
                {hasMore && (
                  <div style={{ fontSize: 10.5, color: C.inkSoft }}>
                    {currentIdx + 1} din {requests.length} cereri în așteptare
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => onRefuse(ev, 'dismiss')} style={{
              background: C.lineSoft, border: 'none', color: C.inkSoft,
              width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>
          {/* Event title */}
          <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, fontFamily: SERIF, marginBottom: 16, lineHeight: 1.2 }}>
            {ev.title}
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: C.panelAlt, borderRadius: 10, padding: '10px 13px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Calendar size={14} color={C.primary} />
              <div>
                <div style={{ fontSize: 9.5, color: C.inkFaint, fontWeight: 600, textTransform: 'uppercase' }}>Data</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{ev.date}</div>
              </div>
            </div>
            <div style={{ background: C.panelAlt, borderRadius: 10, padding: '10px 13px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Clock size={14} color={C.primary} />
              <div>
                <div style={{ fontSize: 9.5, color: C.inkFaint, fontWeight: 600, textTransform: 'uppercase' }}>Interval</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{ev.startTime} – {ev.endTime}</div>
              </div>
            </div>
          </div>

          {/* Type badge */}
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
              background: C.primarySoft, color: C.primary
            }}>
              {EV_TYPE_LABELS[ev.type] || ev.type}
            </span>
            {ev.desc && <span style={{ fontSize: 12, color: C.inkSoft }}>{ev.desc}</span>}
          </div>

          {/* Creator */}
          {creator && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: C.panelAlt, borderRadius: 10 }}>
              <User size={13} color={C.inkSoft} />
              <span style={{ fontSize: 11.5, color: C.inkSoft }}>Solicitat de</span>
              <Avatar p={creator} size={22} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{creator.name}</span>
            </div>
          )}

          {/* Tagged members */}
          {taggedMembers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: C.inkSoft }}>Participanți:</span>
              {taggedMembers.map(m => (
                <div key={m.id} title={m.name}>
                  <Avatar p={m} size={24} />
                </div>
              ))}
            </div>
          )}

          {/* Propose new time form */}
          {proposingTime && (
            <div style={{
              background: `${C.amber}10`, border: `1.5px solid ${C.amber}40`,
              borderRadius: 12, padding: 14, marginBottom: 14
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 10 }}>
                📆 Propune altă dată și oră:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontFamily: SANS, fontSize: 12.5, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)}
                    placeholder="Ora început"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontFamily: SANS, fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }} />
                  <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)}
                    placeholder="Ora sfârșit"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontFamily: SANS, fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handlePropose} style={{
                    flex: 1, background: C.amber, color: '#fff', border: 'none', borderRadius: 8,
                    padding: '9px 0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: SANS
                  }}>Trimite contra-propunere</button>
                  <button onClick={() => setProposingTime(false)} style={{
                    padding: '9px 14px', background: C.lineSoft, border: 'none', borderRadius: 8,
                    fontSize: 12, cursor: 'pointer', color: C.inkSoft, fontFamily: SANS
                  }}>Anulează</button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!proposingTime && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onAccept(ev)} style={{
                flex: 1, background: C.primary, color: '#fff', border: 'none', borderRadius: 10,
                padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: `0 4px 12px ${C.primary}40`
              }}>
                <Check size={15} /> Acceptă
              </button>
              <button onClick={() => setProposingTime(true)} style={{
                flex: 1, background: `${C.amber}18`, color: C.amber, border: `1.5px solid ${C.amber}50`,
                borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: 12.5,
                cursor: 'pointer', fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
              }}>
                📆 Altă dată
              </button>
              <button onClick={() => onRefuse(ev, 'refuse')} style={{
                flex: 1, background: C.coralSoft, color: C.coral, border: `1.5px solid ${C.coral}40`,
                borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
              }}>
                <XCircle size={14} /> Refuză
              </button>
            </div>
          )}

          {/* Navigation between multiple requests */}
          {hasMore && !proposingTime && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              {requests.map((_, i) => (
                <div key={i} onClick={() => setCurrentIdx(i)} style={{
                  width: i === currentIdx ? 18 : 6, height: 6, borderRadius: 3,
                  background: i === currentIdx ? C.primary : C.lineSoft,
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
