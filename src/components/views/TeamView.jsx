import React, { useState } from "react";
import { Edit3, Trash2, Link2, Check } from "lucide-react";
import { C, SERIF, SANS } from "../../utils/constants";
import Card from "../common/Card";
import AddBtn from "../common/AddBtn";
import Avatar from "../common/Avatar";
import AddTeamModal from "../modals/AddTeamModal";
import EmptyState from "../common/EmptyState";
import Skeleton from "../common/Skeleton";
import { Ghost } from "lucide-react";

function TeamView({ team, projects, onAddTeamMember, onDeleteTeamMember, onEditTeamMember, isMobile, isLoading, userRole = 'admin', registeredUsers = [] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [linkingId, setLinkingId] = useState(null);

  const handleLinkUser = (member, regUser) => {
    onEditTeamMember({ ...member, userId: regUser.uid, email: regUser.email });
    setLinkingId(null);
  };

  const handleUnlink = (member) => {
    onEditTeamMember({ ...member, userId: null, email: null });
    setLinkingId(null);
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:isMobile?14:22 }}>
        <div>
          <h1 style={{ margin:0, fontSize:isMobile?22:28, fontWeight:600, color:C.ink, fontFamily:SERIF, letterSpacing:'-0.5px' }}>Echipa</h1>
          {!isMobile && <p style={{ margin:'6px 0 0', color:C.inkSoft, fontSize:14, fontFamily:SANS }}>Membrii studioului si proiectele alocate</p>}
        </div>
        {userRole === 'admin' && (
          <AddBtn onClick={() => setShowAdd(true)} label="Membru nou" isMobile={isMobile} />
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16 }}>
          {[1,2,3,4].map(i => (
            <Card key={i} style={{ padding: isMobile ? '16px 10px' : 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Skeleton width={isMobile ? 46 : 56} height={isMobile ? 46 : 56} borderRadius="50%" style={{ marginBottom: 12 }} />
              <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={12} style={{ marginBottom: 16 }} />
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16 }}>
          {team.map(m => {
            const activeProj = projects.filter(p => p.team && p.team.includes(m.id) && p.status !== 'completed');
            const isLinked = !!m.userId;
            const linkedUserIds = team.filter(t => t.id !== m.id && t.userId).map(t => t.userId);
            const availableUsers = registeredUsers.filter(u => !linkedUserIds.includes(u.uid));

            return (
              <Card key={m.id} style={{ padding: isMobile ? '16px 10px' : 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {userRole === 'admin' && (
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 2 }}>
                    <button onClick={() => onEditTeamMember(m)} style={{ background: 'transparent', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}>
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => onDeleteTeamMember(m.id)} style={{ background: 'transparent', border: 'none', color: C.inkFaint, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                <Avatar p={m} size={isMobile ? 46 : 56} />
                <h3 style={{ margin: '10px 0 2px', fontSize: isMobile ? 13 : 15, fontWeight: 600, color: C.ink, fontFamily: SANS, lineHeight: 1.2 }}>{m.name}</h3>
                <span style={{ fontSize: isMobile ? 10 : 11, color: C.inkSoft, fontWeight: 500, fontFamily: SANS }}>{m.role}</span>

                {/* Link user section - admin only, desktop only */}
                {userRole === 'admin' && !isMobile && (
                  <div style={{ width: '100%', marginTop: 10 }}>
                    {isLinked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: `${C.primary}12`, border: `1px solid ${C.primary}30`,
                          borderRadius: 20, padding: '4px 10px', fontSize: 11,
                          color: C.primary, fontFamily: SANS, fontWeight: 600
                        }}>
                          <Check size={11} />
                          {m.email ? m.email.split('@')[0] : 'Conectat'}
                        </div>
                        <button
                          onClick={() => handleUnlink(m)}
                          style={{ background: 'transparent', border: 'none', color: C.inkFaint, fontSize: 10, cursor: 'pointer', fontFamily: SANS, textDecoration: 'underline' }}
                        >
                          Deconectează
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setLinkingId(linkingId === m.id ? null : m.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5, margin: '0 auto',
                            background: C.lineSoft, border: `1px dashed ${C.line}`,
                            borderRadius: 20, padding: '5px 12px', fontSize: 11,
                            color: C.inkSoft, fontFamily: SANS, cursor: 'pointer', fontWeight: 600
                          }}
                        >
                          <Link2 size={11} /> Atribuie utilizator
                        </button>

                        {linkingId === m.id && (
                          <div style={{
                            position: 'absolute', top: 34, left: '50%', transform: 'translateX(-50%)',
                            background: C.panel, border: '1px solid ' + C.line,
                            borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
                            zIndex: 100, minWidth: 220, overflow: 'hidden'
                          }}>
                            <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.inkFaint, fontFamily: SANS, textTransform: 'uppercase', borderBottom: '1px solid ' + C.lineSoft }}>
                              Selectează utilizator
                            </div>
                            {availableUsers.length === 0 ? (
                              <div style={{ padding: '12px 14px', fontSize: 12, color: C.inkFaint, fontFamily: SANS }}>
                                Niciun utilizator disponibil
                              </div>
                            ) : (
                              availableUsers.map(u => (
                                <button
                                  key={u.uid}
                                  onClick={() => handleLinkUser(m, u)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    width: '100%', padding: '9px 14px',
                                    background: 'transparent', border: 'none',
                                    borderBottom: '1px solid ' + C.lineSoft,
                                    textAlign: 'left', cursor: 'pointer', fontFamily: SANS
                                  }}
                                >
                                  {u.photoURL
                                    ? <img src={u.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%' }} />
                                    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                                        {(u.displayName || u.email || '?')[0].toUpperCase()}
                                      </div>
                                  }
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName || '—'}</div>
                                    <div style={{ fontSize: 10, color: C.inkFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!isMobile && (
                  <>
                    <div style={{ width: '100%', height: 1, background: C.lineSoft, margin: '14px 0' }} />
                    <div style={{ width: '100%', textAlign: 'left' }}>
                      <div style={{ fontSize: 11, color: C.inkFaint, marginBottom: 6, fontWeight: 500, fontFamily: SANS }}>PROIECTE ACTIVE ({activeProj.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {activeProj.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace:'nowrap', fontFamily: SANS }}>{p.name}</span>
                          </div>
                        ))}
                        {activeProj.length === 0 && (
                          <div style={{ marginTop: 8 }}>
                            <EmptyState icon={Ghost} title="Niciun proiect" description="Nu are activitate curentă." compact={true} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {isMobile && (
                  <div style={{ marginTop: 10, background: C.panelAlt, padding: '4px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, color: C.inkSoft, fontFamily: SANS }}>
                    {activeProj.length} proiecte
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {linkingId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setLinkingId(null)} />
      )}

      {showAdd && (
        <AddTeamModal
          onAdd={m => { onAddTeamMember(m); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
          isMobile={isMobile}
          registeredUsers={registeredUsers}
        />
      )}
    </div>
  );
}

export default React.memo(TeamView);
