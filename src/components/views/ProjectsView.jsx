import React, { useState } from "react";
import { Trash2, LayoutGrid, KanbanSquare, MoreHorizontal, Edit2 } from "lucide-react";
import { C, SERIF, SANS, STATUS_META } from "../../utils/constants";
import { fmtDate, daysLeft } from "../../utils/helpers";
import Card from "../common/Card";
import AddBtn from "../common/AddBtn";
import Badge from "../common/Badge";
import Bar from "../common/Bar";
import Avatar from "../common/Avatar";
import AddProjectModal from "../modals/AddProjectModal";
import EmptyState from "../common/EmptyState";
import Skeleton from "../common/Skeleton";
import { Inbox } from "lucide-react";

export default function ProjectsView({ defaultFilter = 'all', projects, team, onAddProject, onUpdateProject, onDeleteProject, onOpen, isMobile, isLoading }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' sau 'kanban'
  const [filterStatus, setFilterStatus] = useState(defaultFilter);
  const [showAdd, setShowAdd] = useState(false);
  const [activeDragProject, setActiveDragProject] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const filtered = projects.filter(p => filterStatus === 'all' || p.status === filterStatus);
  const columns = ['planning', 'active', 'at-risk', 'completed'];

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('projectId', id);
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('projectId');
    const proj = projects.find(p => p.id === id);
    if (proj && proj.status !== newStatus) {
      onUpdateProject({ ...proj, status: newStatus });
    }
    setDraggedId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderProjectCard = (p, isKanban = false) => {
    const d = daysLeft(p.endDate);
    const members = team.filter(t => p.team && p.team.includes(t.id));
    
    const sortedMilestones = (p.milestones || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    let displayMilestone = sortedMilestones.find(m => !m.completed);
    if (!displayMilestone && sortedMilestones.length > 0) {
      displayMilestone = sortedMilestones[sortedMilestones.length - 1];
    }
    
    const msColor = displayMilestone?.completed ? C.sage : C.coral;
    const msBg = displayMilestone?.completed ? C.sageSoft : C.coralSoft;
    const msAssignee = displayMilestone ? team.find(t => t.id === displayMilestone.assigneeId) : null;

    const cardContent = (
      <Card 
        key={p.id} 
        onClick={() => onOpen(p)} 
        style={{ 
          padding: 16, 
          cursor: 'pointer', 
          position: 'relative',
          marginBottom: isKanban ? 12 : 0,
          opacity: draggedId === p.id ? 0.5 : 1,
          border: isKanban ? '1px solid ' + C.lineSoft : 'none'
        }}
        draggable={isKanban}
        onDragStart={(e) => isKanban && handleDragStart(e, p.id)}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: p.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: SANS }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>{p.client}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === p.id ? null : p.id); }}
              style={{ background: 'transparent', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 4 }}
            >
              <MoreHorizontal size={16} />
            </button>
            
            {menuOpenId === p.id && (
              <div 
                style={{ 
                  position: 'absolute', top: 30, right: 0, background: C.panel, 
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
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.inkSoft, marginBottom: 4, fontFamily: SANS }}>
            <span>Progres</span>
            <span style={{ fontWeight: 600, color: p.color }}>{p.progress}%</span>
          </div>
          <Bar value={p.progress} color={p.color} h={6} />
        </div>

        {displayMilestone && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, background: msBg, padding: '8px 12px', borderRadius: 8, border: '1px solid ' + msColor + '33' }}>
             <div style={{ width: 8, height: 8, transform: 'rotate(45deg)', background: msColor, flexShrink: 0 }} />
             <div style={{ fontSize: 11.5, color: msColor, fontFamily: SANS, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
               Etapă: <strong style={{ color: msColor }}>{displayMilestone.name}</strong>
             </div>
             {msAssignee && (
               <div title={`Responsabil: ${msAssignee.name}`} style={{ display: 'flex', alignItems: 'center', marginRight: 4, flexShrink: 0 }}>
                 <Avatar p={msAssignee} size={18} />
               </div>
             )}
             <div style={{ fontSize: 11.5, fontWeight: 700, color: msColor, fontFamily: SANS }}>{fmtDate(displayMilestone.date)}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            {members.map((m, idx) => (
              <div key={m.id} style={{ marginLeft: idx > 0 ? -8 : 0, border: '2px solid ' + C.panel, borderRadius: '50%' }}>
                <Avatar p={m} size={24} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: C.inkFaint, textTransform: 'uppercase', fontFamily: SANS }}>Deadline</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: d <= 7 && p.status !== 'completed' ? C.coral : C.ink, fontFamily: SANS }}>
                {fmtDate(p.endDate)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );

    return (
      <div key={p.id} className={isKanban ? "" : "hover-lift"} style={{ cursor: 'pointer' }}>
        {cardContent}
      </div>
    );
  };


  return (
    <div className="fade-in-view">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:isMobile?14:22 }}>
        <div>
          <h1 style={{ margin:0, fontSize:isMobile?22:28, fontWeight:600, color:C.ink, fontFamily:SERIF, letterSpacing:'-0.5px' }}>Proiecte</h1>
          {!isMobile && <p style={{ margin:'6px 0 0', color:C.inkSoft, fontSize:14, fontFamily:SANS }}>Gestionarea proiectelor și stadiului de lucru</p>}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* View Toggle */}
          {!isMobile && (
            <div style={{ display: 'flex', background: C.lineSoft, borderRadius: 10, padding: 4 }}>
              <button onClick={() => setViewMode('grid')} style={{ 
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', 
                background: viewMode === 'grid' ? C.panel : 'transparent', color: viewMode === 'grid' ? C.ink : C.inkFaint, 
                boxShadow: viewMode === 'grid' ? C.shadowSoft : 'none', fontWeight: 600, fontSize: 12, fontFamily: SANS 
              }}>
                <LayoutGrid size={15} /> Listă
              </button>
              <button onClick={() => setViewMode('kanban')} style={{ 
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', 
                background: viewMode === 'kanban' ? C.panel : 'transparent', color: viewMode === 'kanban' ? C.ink : C.inkFaint, 
                boxShadow: viewMode === 'kanban' ? C.shadowSoft : 'none', fontWeight: 600, fontSize: 12, fontFamily: SANS 
              }}>
                <KanbanSquare size={15} /> Board
              </button>
            </div>
          )}
          <AddBtn onClick={() => setShowAdd(true)} label="Proiect nou" isMobile={isMobile} />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' || isMobile ? (isMobile ? '1fr' : '1fr 1fr') : 'repeat(4, 1fr)', gap: 16 }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Skeleton width="40%" height={20} />
                <Skeleton width={30} height={20} borderRadius={10} />
              </div>
              <Skeleton width="100%" height={10} style={{ marginBottom: 16 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Skeleton width={24} height={24} borderRadius="50%" />
                <Skeleton width={24} height={24} borderRadius="50%" />
                <Skeleton width={24} height={24} borderRadius="50%" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width="30%" height={12} />
                <Skeleton width="20%" height={12} />
              </div>
            </Card>
          ))}
        </div>
      ) : viewMode === 'grid' || isMobile ? (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            {['all', 'active', 'planning', 'at-risk', 'completed'].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)} style={{
                padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: filterStatus === st ? C.primary : C.panel, color: filterStatus === st ? C.paper : C.inkSoft,
                boxShadow: C.shadowSoft, fontFamily: SANS
              }}>
                {st === 'all' ? 'Toate' : STATUS_META[st].label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ marginTop: 32 }}>
              <EmptyState 
                icon={Inbox} 
                title="Niciun proiect găsit" 
                description="Nu ai niciun proiect care să corespundă acestui filtru." 
                actionLabel="Proiect nou" 
                onAction={() => setShowAdd(true)} 
              />
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:16 }}>
              {filtered.map(p => renderProjectCard(p, false))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start', overflowX: 'auto', paddingBottom: 16 }}>
          {columns.map(status => {
            const colProjects = projects.filter(p => p.status === status);
            return (
              <div 
                key={status} 
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={handleDragOver}
                style={{ 
                  background: C.panelAlt, borderRadius: 16, padding: 14, minHeight: '60vh', 
                  border: '1px solid ' + C.lineSoft,
                  boxShadow: 'inset 0 4px 10px rgba(34,31,25,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_META[status].color }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: SANS }}>{STATUS_META[status].label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.inkFaint, background: C.lineSoft, padding: '2px 8px', borderRadius: 12 }}>
                    {colProjects.length}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {colProjects.map(p => renderProjectCard(p, true))}
                  {colProjects.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <EmptyState 
                        icon={Inbox} 
                        title="Gol" 
                        description="Trage un proiect aici" 
                        compact={true} 
                        actionLabel="Crează"
                        onAction={() => setShowAdd(true)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddProjectModal team={team} onAdd={p => { onAddProject(p); setShowAdd(false); }} onClose={() => setShowAdd(false)} isMobile={isMobile} />}
    </div>
  );
}
