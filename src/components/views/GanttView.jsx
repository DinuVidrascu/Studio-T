import React, { useState } from "react";
import { C, SERIF, SANS, TOTAL_DAYS, TODAY_DAY, MONTHS_DEF, TL_START, TL_END, STATUS_META } from "../../utils/constants";
import { daysLeft, fmtDate } from "../../utils/helpers";
import Card from "../common/Card";
import AddBtn from "../common/AddBtn";

export default function GanttView({ projects, team, onOpen, onUpdateProject, onAdd, isMobile }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, proj: null });
  
  // Interactivity state
  const [draggingState, setDraggingState] = useState(null);
  const [tempDates, setTempDates] = useState({});

  const LW = isMobile ? 122 : 220;
  const CW = isMobile ? 480 : 700;
  const RH = isMobile ? 50 : 60;
  const HH = isMobile ? 48 : 56;
  const svgH = HH + projects.length * RH + 8;
  const svgW = LW + CW;

  const dayX = d => LW + (d / TOTAL_DAYS) * CW;
  const dateX = s => { 
    const d = (new Date(s) - TL_START) / 86400000; 
    return LW + (Math.max(0, d) / TOTAL_DAYS) * CW; 
  };
  const barW = (s, e) => { 
    const st = Math.max(new Date(s), TL_START);
    const en = Math.min(new Date(e), TL_END); 
    if (en <= st) return 0; 
    return ((en - st) / 86400000 / TOTAL_DAYS) * CW; 
  };
  const todayX = dayX(TODAY_DAY);

  const ticks = [];
  for (let i = 0; i < TOTAL_DAYS; i += 7) {
    const tickDate = new Date(TL_START);
    tickDate.setDate(tickDate.getDate() + i);
    ticks.push({ offset: i, label: tickDate.getDate() });
  }

  const handleMouseMove = (e, proj) => {
    if (draggingState) return;
    setTooltip({ show: true, x: e.clientX, y: e.clientY, proj });
  };

  const handleMouseLeave = () => {
    if (draggingState) return;
    setTooltip({ show: false, x: 0, y: 0, proj: null });
    setHoveredId(null);
  };

  // Drag handles
  const handleDragStart = (e, proj, type) => {
    e.stopPropagation();
    setTooltip({ show: false, x: 0, y: 0, proj: null });
    
    const curDates = tempDates[proj.id] || { startDate: proj.startDate, endDate: proj.endDate };
    setDraggingState({
      projId: proj.id,
      type,
      startX: e.clientX,
      initialDateStr: type === 'start' ? curDates.startDate : curDates.endDate
    });
  };

  const handleGlobalMouseMove = (e) => {
    if (!draggingState) return;
    
    const dx = e.clientX - draggingState.startX;
    const daysOffset = Math.round(dx * (TOTAL_DAYS / CW));
    
    const initDate = new Date(draggingState.initialDateStr);
    initDate.setDate(initDate.getDate() + daysOffset);
    const newDateStr = initDate.toISOString().split('T')[0];

    const proj = projects.find(p => p.id === draggingState.projId);
    if (!proj) return;

    setTempDates(prev => {
      const cur = prev[proj.id] || { startDate: proj.startDate, endDate: proj.endDate };
      return {
        ...prev,
        [proj.id]: {
          startDate: draggingState.type === 'start' ? newDateStr : cur.startDate,
          endDate: draggingState.type === 'end' ? newDateStr : cur.endDate,
        }
      };
    });
  };

  const handleGlobalMouseUp = () => {
    if (draggingState) {
      const proj = projects.find(p => p.id === draggingState.projId);
      const newDates = tempDates[proj.id];
      if (proj && newDates) {
        onUpdateProject({ ...proj, startDate: newDates.startDate, endDate: newDates.endDate });
      }
      setDraggingState(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: isMobile ? 16 : 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: C.ink, fontFamily: SERIF, letterSpacing: '-0.5px' }}>Timeline</h1>
          {!isMobile && <p style={{ margin: '6px 0 0', color: C.inkSoft, fontSize: 14, fontFamily: SANS }}>Planul vizual al proiectelor. Treci cu mouse-ul peste bare pentru detalii rapide.</p>}
        </div>
        <AddBtn onClick={onAdd} label={isMobile ? 'Nou' : 'Proiect nou'} isMobile={isMobile} />
      </div>
      
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <svg 
            width={svgW} height={svgH} 
            style={{ display: 'block', minWidth: svgW, userSelect: 'none', cursor: draggingState ? 'ew-resize' : 'default' }}
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleGlobalMouseUp}
            onMouseLeave={handleGlobalMouseUp}
          >
            {MONTHS_DEF.map((m, i) => {
              const off = (m.start - TL_START) / 86400000;
              const x = dayX(off);
              const w = (m.days / TOTAL_DAYS) * CW;
              return (
                <g key={i}>
                  <rect x={x} y={0} width={w} height={HH} fill={i % 2 === 0 ? C.panelAlt : C.panel} />
                  <text x={x + w / 2} y={HH / 2 - 6} fill={C.ink} fontSize={isMobile ? 12 : 14} fontWeight={600} textAnchor="middle" dominantBaseline="central" fontFamily={SERIF}>{m.label}</text>
                </g>
              );
            })}

            {ticks.map((t, idx) => {
              const tx = dayX(t.offset);
              return (
                <g key={idx}>
                  <line x1={tx} y1={HH} x2={tx} y2={svgH} stroke="rgba(34, 31, 25, 0.05)" strokeDasharray="3 3" />
                  <text x={tx} y={HH - 10} fill={C.inkFaint} fontSize={9} fontWeight={600} textAnchor="middle" dominantBaseline="central" fontFamily={SANS}>{t.label}</text>
                </g>
              );
            })}

            <line x1={LW} y1={0} x2={LW} y2={svgH} stroke={C.line} strokeWidth={1} />
            <line x1={0} y1={HH} x2={svgW} y2={HH} stroke={C.line} strokeWidth={1} />

            {projects.map((proj, i) => {
              const y = HH + i * RH;
              const sDate = tempDates[proj.id]?.startDate || proj.startDate;
              const eDate = tempDates[proj.id]?.endDate || proj.endDate;
              
              const bx = dateX(sDate);
              const bw = barW(sDate, eDate);
              const pw = bw * (proj.progress / 100);
              const dl = daysLeft(eDate);
              const urg = dl <= 7 && dl >= 0 && proj.status !== 'completed';
              const isHovered = hoveredId === proj.id;
              
              const isActiveDrag = draggingState?.projId === proj.id;

              return (
                <g 
                  key={proj.id} 
                  style={{ cursor: isActiveDrag ? 'ew-resize' : 'pointer' }} 
                  onClick={() => !draggingState && onOpen(proj)}
                  onMouseEnter={() => setHoveredId(proj.id)}
                  onMouseMove={(e) => handleMouseMove(e, proj)}
                  onMouseLeave={handleMouseLeave}
                >
                  <rect 
                    x={0} y={y} width={svgW} height={RH} 
                    fill={isHovered ? 'rgba(30, 111, 100, 0.05)' : (i % 2 === 0 ? 'transparent' : C.panelAlt)} 
                    style={{ transition: 'fill 0.15s ease' }}
                  />
                  
                  <circle cx={18} cy={y + RH / 2} r={5} fill={proj.color} />
                  
                  <text x={32} y={y + RH / 2 - (isMobile ? 0 : 8)} fill={C.ink} fontSize={isMobile ? 11.5 : 13.5} fontWeight={600} fontFamily={SANS} dominantBaseline="central">
                    {proj.name.length > (isMobile ? 12 : 24) ? proj.name.slice(0, isMobile ? 12 : 24) + '...' : proj.name}
                  </text>
                  
                  {!isMobile && (
                    <text x={32} y={y + RH / 2 + 10} fill={C.inkSoft} fontSize={10.5} fontFamily={SANS} dominantBaseline="central">
                      {proj.client} • <tspan fill={isActiveDrag ? C.primary : C.inkFaint}>{fmtDate(sDate)} - {fmtDate(eDate)}</tspan>
                    </text>
                  )}
                  {isMobile && (
                    <text x={32} y={y + RH / 2 + 10} fill={C.inkFaint} fontSize={9.5} fontFamily={SANS} dominantBaseline="central">
                      {fmtDate(sDate)} - {fmtDate(eDate)}
                    </text>
                  )}

                  {bw > 0 && (
                    <g>
                      <rect x={bx} y={y + (RH - 24) / 2} width={bw} height={24} rx={12} fill={proj.color + '1A'} />
                      <rect x={bx} y={y + (RH - 24) / 2} width={Math.max(pw, 16)} height={24} rx={12} fill={proj.color} />
                      
                      {bw > 48 && (
                        <text x={bx + Math.max(pw, 30) / 2} y={y + RH / 2} fill="#fff" fontSize={10} fontWeight={700} textAnchor="middle" dominantBaseline="central" fontFamily={SANS}>
                          {proj.progress}%
                        </text>
                      )}

                      {!isMobile && (
                        <text x={bx - 14} y={y + RH / 2} fill={isHovered ? C.primary : C.inkSoft} fontSize={9.5} fontWeight={isHovered ? 700 : 500} textAnchor="end" dominantBaseline="central" fontFamily={SANS}>
                          {fmtDate(sDate)}
                        </text>
                      )}

                      {!isMobile && (
                        <text x={bx + bw + 14} y={y + RH / 2} fill={isHovered ? C.primary : C.inkSoft} fontSize={9.5} fontWeight={isHovered ? 700 : 500} textAnchor="start" dominantBaseline="central" fontFamily={SANS}>
                          {fmtDate(eDate)}
                        </text>
                      )}

                      {urg && (
                        <g>
                          <circle cx={bx + bw + 10} cy={y + RH / 2} r={6} fill={C.coral} />
                          <text x={bx + bw + 10} y={y + RH / 2} fill="#fff" fontSize={8} fontWeight={800} textAnchor="middle" dominantBaseline="central" fontFamily={SANS}>!</text>
                        </g>
                      )}

                      {/* Drag handles (shown on hover or when dragging) */}
                      {(isHovered || isActiveDrag) && !isMobile && (
                        <>
                          <circle 
                            cx={bx} cy={y + RH / 2} r={7} 
                            fill="#fff" stroke={proj.color} strokeWidth={2.5}
                            style={{ cursor: 'ew-resize' }}
                            onMouseDown={(e) => handleDragStart(e, proj, 'start')}
                          />
                          <circle 
                            cx={bx + bw} cy={y + RH / 2} r={7} 
                            fill="#fff" stroke={proj.color} strokeWidth={2.5}
                            style={{ cursor: 'ew-resize' }}
                            onMouseDown={(e) => handleDragStart(e, proj, 'end')}
                          />
                        </>
                      )}
                    </g>
                  )}

                  {/* Render Milestones on Timeline */}
                  {(proj.milestones || []).map((ms, msIdx) => {
                    const mx = dateX(ms.date);
                    if (mx < LW || mx > svgW) return null; // out of bounds
                    return (
                      <g key={msIdx}>
                        {/* Milestone Diamond Marker */}
                        <rect 
                          x={mx - 5} y={y + RH / 2 - 5} 
                          width={10} height={10} 
                          fill={ms.completed ? C.sage : '#fff'} 
                          stroke={ms.completed ? C.sage : proj.color} 
                          strokeWidth={2}
                          transform={`rotate(45 ${mx} ${y + RH / 2})`}
                        />
                        {/* Milestone Name Tooltip/Label on hover */}
                        {isHovered && !isMobile && (() => {
                          const msAssignee = (team || []).find(t => t.id === ms.assigneeId);
                          const labelText = msAssignee ? `${ms.name} (${msAssignee.initials})` : ms.name;
                          return (
                            <text x={mx} y={y + RH / 2 + 18} fill={C.inkSoft} fontSize={9} fontWeight={600} textAnchor="middle" fontFamily={SANS}>
                              {labelText}
                            </text>
                          );
                        })()}
                      </g>
                    );
                  })}
                  
                  <line x1={0} y1={y + RH} x2={svgW} y2={y + RH} stroke={C.lineSoft} strokeWidth={1} />
                </g>
              );
            })}

            <line x1={todayX} y1={HH} x2={todayX} y2={svgH} stroke={C.coral} strokeWidth={2} strokeDasharray="3 3" />
            <rect x={todayX - 16} y={HH - 9} width={32} height={18} rx={9} fill={C.coral} />
            <text x={todayX} y={HH} fill="#fff" fontSize={9} fontWeight={800} textAnchor="middle" dominantBaseline="central" fontFamily={SANS}>AZI</text>
          </svg>
        </div>
        
        <div style={{ padding: '14px 20px', borderTop: '1px solid ' + C.line, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>
              <div style={{ width: 16, height: 2, background: C.coral }} /> linia de azi
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 7, fontWeight: 900 }}>!</div> 
              deadline sub 7 zile
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>
              <svg width={12} height={12} style={{ display: 'inline-block', flexShrink: 0 }}>
                <rect x={2} y={2} width={8} height={8} fill="none" stroke={C.primary} strokeWidth={2} transform="rotate(45 6 6)" />
              </svg>
              etapă (milestone)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>
              <circle cx={4} cy={4} r={3} stroke={C.primary} strokeWidth={1.5} fill="#fff" />
              trage marginile
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, fontFamily: SANS }}>
            💡 Glisează orizontal • Trage de margini
          </div>
        </div>
      </Card>

      {!draggingState && tooltip.show && tooltip.proj && (
        <div style={{
          position: 'fixed', left: tooltip.x + 15, top: tooltip.y + 15,
          background: 'rgba(255, 255, 255, 0.98)', border: '1px solid ' + C.line,
          borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 20px rgba(34,31,25,0.08)',
          pointerEvents: 'none', zIndex: 1000, fontFamily: SANS, backdropFilter: 'blur(4px)'
        }}>
          <div style={{ fontSize: 10, color: C.inkFaint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tooltip.proj.client}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: '2px 0 6px' }}>{tooltip.proj.name}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
            <div><strong>Start:</strong> {fmtDate(tempDates[tooltip.proj.id]?.startDate || tooltip.proj.startDate)}</div>
            <div><strong>Sfârșit:</strong> {fmtDate(tempDates[tooltip.proj.id]?.endDate || tooltip.proj.endDate)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ fontWeight: 600, color: tooltip.proj.color }}>{tooltip.proj.progress}% finalizat</span>
            <span style={{ 
              padding: '2px 6px', borderRadius: 10, fontSize: 9, fontWeight: 700, 
              background: STATUS_META[tooltip.proj.status].soft, color: STATUS_META[tooltip.proj.status].color 
            }}>
              {STATUS_META[tooltip.proj.status].label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
