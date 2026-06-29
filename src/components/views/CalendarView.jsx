import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { C, SERIF, SANS, TODAY_STR, MONTHS_RO, DAY_S, EV_TYPES, HR_H, HR_START, HR_END, GRID_H, TIME_W } from "../../utils/constants";
import { fmtDate, t2m, m2t, hm, getWeekStart, getWeekDays, fmtWeekRange } from "../../utils/helpers";
import Card from "../common/Card";
import SectionTitle from "../common/SectionTitle";
import AddBtn from "../common/AddBtn";
import Avatar from "../common/Avatar";
import EventDetailModal from "../modals/EventDetailModal";
import AddEventModal from "../modals/AddEventModal";

function MiniCalendar({ year, month, events, selectedDays, todayStr, onPrev, onNext, onDay }) {
  const firstDow = new Date(year, month, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInM = new Date(year, month + 1, 0).getDate();
  const iso = d => year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInM }, (_, i) => i + 1)];
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onPrev} style={{ background: 'none', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 4, display: 'flex' }}><ChevronLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: SERIF }}>{MONTHS_RO[month]} {year}</span>
        <button onClick={onNext} style={{ background: 'none', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 4, display: 'flex' }}><ChevronRight size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 5 }}>
        {DAY_S.map(d => <div key={d} style={{ fontSize: 9.5, color: C.inkFaint, padding: '2px 0', fontWeight: 600, fontFamily: SANS }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={'n' + i} />;
          const dateStr = iso(day);
          const isToday = dateStr === todayStr;
          const inWeek = selectedDays.includes(dateStr);
          const hasEv = events.some(e => e.date === dateStr);
          return (
            <div key={i} onClick={() => onDay(dateStr)} style={{ 
              width: 26, height: 26, margin: '0 auto', borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
              fontSize: 11, fontWeight: isToday ? 700 : 500, fontFamily: SANS,
              background: isToday ? C.primary : inWeek ? C.primarySoft : 'transparent',
              color: isToday ? '#fff' : inWeek ? C.primary : C.ink 
            }}>
              {day}
              {hasEv && !isToday && <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: C.coral }} />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function FreeTimePanel({ events, team, date, isMobile }) {
  const WS = 9 * 60, WE = 18 * 60, WD = WE - WS;
  const segsFor = memberId => {
    const evs = events.filter(e => e.date === date && e.team && e.team.includes(memberId)).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const out = []; 
    let cur = WS;
    evs.forEach(ev => { 
      const es = Math.max(t2m(ev.startTime), WS);
      const ee = Math.min(t2m(ev.endTime), WE);
      if (ee <= cur) return; 
      if (es > cur) out.push({ type: 'free', s: cur, e: es });
      out.push({ type: 'busy', s: Math.max(es, cur), e: ee, color: (EV_TYPES[ev.type] || EV_TYPES.meeting).color, label: ev.title }); 
      cur = Math.max(cur, ee); 
    });
    if (cur < WE) out.push({ type: 'free', s: cur, e: WE }); 
    return out;
  };
  const totalFree = segs => segs.filter(s => s.type === 'free').reduce((t, s) => t + (s.e - s.s), 0);
  return (
    <Card style={{ padding: isMobile ? 16 : 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: C.ink, fontFamily: SANS }}>Cine e liber azi</div>
        <div style={{ fontSize: 11.5, color: C.inkFaint, fontFamily: SANS }}>09:00 - 18:00</div>
      </div>
      {team.map(m => {
        const segs = segsFor(m.id);
        const freeMin = totalFree(segs);
        const freeSlots = segs.filter(s => s.type === 'free');
        return (
          <div key={m.id} style={{ marginBottom: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
              <Avatar p={m} size={24} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: SANS }}>
                {isMobile ? m.name.split(' ')[0] : m.name}
              </span>
              <div style={{ flex: 1, height: 16, borderRadius: 8, background: C.lineSoft, overflow: 'hidden', position: 'relative' }}>
                {segs.map((seg, i) => (
                  <div key={i} style={{ 
                    position: 'absolute', top: 0, height: '100%',
                    left: ((seg.s - WS) / WD * 100) + '%', width: ((seg.e - seg.s) / WD * 100) + '%',
                    background: seg.type === 'free' ? C.sage + '66' : (seg.color || C.primary) 
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: freeMin > 0 ? C.sage : C.coral, flexShrink: 0, minWidth: 50, textAlign: 'right', fontFamily: SANS }}>
                {freeMin > 0 ? hm(freeMin) : 'plin'}
              </span>
            </div>
            {freeSlots.length > 0 && (
              <div style={{ marginLeft: isMobile ? 33 : 36, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {freeSlots.map((sl, i) => (
                  <span key={i} style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 5, background: C.sageSoft, color: C.sage, fontWeight: 500, fontFamily: SANS }}>
                    {m2t(sl.s)}-{m2t(sl.e)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

export default function CalendarView({ projects, team, events, onAddEvent, onDeleteEvent, isMobile }) {
  const [weekStart, setWeekStart] = useState(getWeekStart(TODAY_STR));
  const [selectedDay, setSelectedDay] = useState(TODAY_STR);
  const [selectedEv, setSelectedEv] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState(TODAY_STR);
  const [monthView, setMonthView] = useState({ year: 2026, month: 5 });
  const gridRef = useRef(null);
  const weekDays = getWeekDays(weekStart);

  useEffect(() => { 
    if (gridRef.current) gridRef.current.scrollTop = HR_H; 
  }, [weekStart]);

  const prevWeek = () => { 
    const d = new Date(weekStart); 
    d.setDate(d.getDate() - 7); 
    setWeekStart(d.toISOString().split('T')[0]); 
  };
  const nextWeek = () => { 
    const d = new Date(weekStart); 
    d.setDate(d.getDate() + 7); 
    setWeekStart(d.toISOString().split('T')[0]); 
  };
  const jumpTo = date => setWeekStart(getWeekStart(date));

  const weekEvs = events.filter(e => weekDays.includes(e.date));
  const totMins = weekEvs.reduce((s, e) => s + t2m(e.endTime) - t2m(e.startTime), 0);
  const metMins = weekEvs.filter(e => ['meeting', 'review', 'workshop'].includes(e.type)).reduce((s, e) => s + t2m(e.endTime) - t2m(e.startTime), 0);
  const focMins = weekEvs.filter(e => e.type === 'focus').reduce((s, e) => s + t2m(e.endTime) - t2m(e.startTime), 0);
  const dayEvs = events.filter(e => e.date === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: isMobile ? 14 : 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: C.ink, fontFamily: SERIF, letterSpacing: '-0.5px' }}>Calendar</h1>
          {!isMobile && <p style={{ margin: '6px 0 0', color: C.inkSoft, fontSize: 14, fontFamily: SANS }}>Programari, sedinte si timp liber</p>}
        </div>
        <AddBtn onClick={() => { setAddDate(selectedDay); setShowAdd(true); }} label={isMobile ? 'Adauga' : 'Eveniment nou'} isMobile={isMobile} />
      </div>

      {isMobile ? (
        <div>
          <Card style={{ marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid ' + C.lineSoft, padding: '10px 14px' }}>
              <button onClick={prevWeek} style={{ background: 'none', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 4, display: 'flex' }}><ChevronLeft size={17} /></button>
              <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: SERIF }}>{fmtWeekRange(weekStart)}</span>
              <button onClick={nextWeek} style={{ background: 'none', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 4, display: 'flex' }}><ChevronRight size={17} /></button>
            </div>
            <div style={{ display: 'flex', padding: '12px 8px', gap: 2 }}>
              {weekDays.map((date, i) => {
                const d = new Date(date);
                const isToday = date === TODAY_STR;
                const isSel = date === selectedDay;
                const evCnt = events.filter(e => e.date === date).length;
                return (
                  <div key={date} onClick={() => setSelectedDay(date)} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 9.5, color: C.inkFaint, marginBottom: 4, fontFamily: SANS }}>{DAY_S[i]}</div>
                    <div style={{ 
                      width: 34, height: 34, borderRadius: 11, margin: '0 auto',
                      background: isSel ? C.primary : isToday ? C.primarySoft : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: isSel ? '#fff' : isToday ? C.primary : C.ink, fontFamily: SANS 
                    }}>{d.getDate()}</div>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', margin: '5px auto 0', background: evCnt ? (isSel ? C.primary : C.coral) : 'transparent' }} />
                  </div>
                );
              })}
            </div>
          </Card>
          <div style={{ marginBottom: 14 }}>
            <SectionTitle count={dayEvs.length + ' evenimente'}>{fmtDate(selectedDay)}</SectionTitle>
            {dayEvs.length === 0 ? (
              <Card style={{ padding: '24px 0', textAlign: 'center', color: C.inkFaint, fontSize: 13, fontFamily: SANS }}>Apasa "+" pentru a adauga</Card>
            ) : dayEvs.map(ev => {
              const c = (EV_TYPES[ev.type] || EV_TYPES.meeting).color;
              const members = team.filter(t => ev.team && ev.team.includes(t.id));
              const dur = t2m(ev.endTime) - t2m(ev.startTime);
              return (
                <Card key={ev.id} onClick={() => setSelectedEv(ev)} style={{ display: 'flex', gap: 13, padding: '13px 15px', marginBottom: 9 }}>
                  <div style={{ width: 3, borderRadius: 2, background: c, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: C.inkSoft, flexShrink: 0, width: 48, textAlign: 'right', fontFamily: SANS }}>
                    <div style={{ fontWeight: 700, color: c }}>{ev.startTime}</div><div style={{ marginTop: 1 }}>{ev.endTime}</div>
                    <div style={{ fontSize: 9.5, marginTop: 3 }}>{hm(dur)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, fontFamily: SANS }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2, fontFamily: SANS }}>{(EV_TYPES[ev.type] || EV_TYPES.meeting).label}</div>
                    {members.length > 0 && <div style={{ display: 'flex', marginTop: 7 }}>
                      {members.slice(0, 4).map((m, idx) => <div key={m.id} style={{ marginLeft: idx > 0 ? -6 : 0, border: '2px solid ' + C.panel, borderRadius: '50%' }}><Avatar p={m} size={22} /></div>)}
                    </div>}
                  </div>
                </Card>
              );
            })}
          </div>
          <FreeTimePanel events={events} team={team} date={TODAY_STR} isMobile={true} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ width: 236, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <MiniCalendar year={monthView.year} month={monthView.month} events={events} selectedDays={weekDays} todayStr={TODAY_STR}
              onPrev={() => setMonthView(v => { const d = new Date(v.year, v.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              onNext={() => setMonthView(v => { const d = new Date(v.year, v.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              onDay={date => { jumpTo(date); setMonthView({ year: parseInt(date.slice(0, 4)), month: parseInt(date.slice(5, 7)) - 1 }); }} />
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12, fontFamily: SANS }}>Saptamana asta</div>
              {[{ label: 'total ore', value: hm(totMins), color: C.primary }, { label: 'sedinte & review', value: hm(metMins), color: C.rose }, { label: 'timp focus', value: hm(focMins), color: C.sage }].map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: idx < 2 ? '1px solid ' + C.lineSoft : 'none' }}>
                  <span style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>{s.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: s.color, fontFamily: SERIF }}>{s.value}</span>
                </div>
              ))}
            </Card>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12, fontFamily: SANS }}>Tipuri</div>
              {Object.entries(EV_TYPES).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                  <div style={{ width: 11, height: 11, borderRadius: 3, background: v.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.inkSoft, fontFamily: SANS }}>{v.label}</span>
                </div>
              ))}
            </Card>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={prevWeek} style={{ display: 'flex', alignItems: 'center', padding: '7px 11px', borderRadius: 10, border: 'none', background: C.panel, boxShadow: C.shadowSoft, color: C.ink, cursor: 'pointer' }}><ChevronLeft size={15} /></button>
                <button onClick={() => { setWeekStart(getWeekStart(TODAY_STR)); setMonthView({ year: 2026, month: 5 }); }} style={{ padding: '7px 15px', borderRadius: 10, border: 'none', background: C.panel, boxShadow: C.shadowSoft, color: C.ink, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: SANS }}>Azi</button>
                <button onClick={nextWeek} style={{ display: 'flex', alignItems: 'center', padding: '7px 11px', borderRadius: 10, border: 'none', background: C.panel, boxShadow: C.shadowSoft, color: C.ink, cursor: 'pointer' }}><ChevronRight size={15} /></button>
              </div>
              <span style={{ fontWeight: 600, fontSize: 15, color: C.ink, fontFamily: SERIF }}>{fmtWeekRange(weekStart)}</span>
            </div>
            <Card style={{ overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ display: 'flex', background: C.panelAlt, borderBottom: '1px solid ' + C.line }}>
                <div style={{ width: TIME_W, flexShrink: 0, borderRight: '1px solid ' + C.lineSoft }} />
                {weekDays.map((date, idx) => {
                  const d = new Date(date);
                  const isToday = date === TODAY_STR;
                  const evCnt = events.filter(e => e.date === date).length;
                  return (
                    <div key={date} onClick={() => { setAddDate(date); setShowAdd(true); }} style={{ 
                      flex: 1, padding: '11px 4px', textAlign: 'center', cursor: 'pointer',
                      borderRight: idx < 6 ? '1px solid ' + C.lineSoft : 'none', background: isToday ? C.primarySoft : 'transparent' 
                    }}>
                      <div style={{ fontSize: 10, color: C.inkFaint, marginBottom: 4, fontFamily: SANS }}>{DAY_S[idx]}</div>
                      <div style={{ 
                        width: 28, height: 28, borderRadius: 9, margin: '0 auto', background: isToday ? C.primary : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: isToday ? '#fff' : C.ink, fontFamily: SANS 
                      }}>{d.getDate()}</div>
                      <div style={{ fontSize: 9, color: evCnt ? C.primary : C.inkFaint, marginTop: 3, fontFamily: SANS }}>{evCnt ? evCnt + ' ev' : '-'}</div>
                    </div>
                  );
                })}
              </div>
              <div ref={gridRef} style={{ overflowY: 'auto', maxHeight: 460 }}>
                <div style={{ display: 'flex', height: GRID_H }}>
                  <div style={{ width: TIME_W, flexShrink: 0, position: 'relative', borderRight: '1px solid ' + C.lineSoft }}>
                    {Array.from({ length: HR_END - HR_START + 1 }, (_, i) => i + HR_START).map(h => (
                      <div key={h} style={{ position: 'absolute', top: (h - HR_START) * HR_H - 7, right: 6, fontSize: 9.5, color: C.inkFaint, fontFamily: SANS }}>{h}:00</div>
                    ))}
                  </div>
                  {weekDays.map((date, idx) => {
                    const dayEvsList = events.filter(e => e.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
                    const isToday = date === TODAY_STR;
                    return (
                      <div key={date} style={{ flex: 1, position: 'relative', minWidth: 0, borderRight: idx < 6 ? '1px solid ' + C.lineSoft : 'none', background: isToday ? C.primary + '08' : 'transparent' }}>
                        {Array.from({ length: HR_END - HR_START + 1 }, (_, j) => j).map(j => (<div key={j} style={{ position: 'absolute', top: j * HR_H, left: 0, right: 0, borderTop: '1px solid ' + C.lineSoft }} />))}
                        {dayEvsList.map(ev => {
                          const topPx = (t2m(ev.startTime) / 60 - HR_START) * HR_H;
                          const heightPx = ((t2m(ev.endTime) - t2m(ev.startTime)) / 60) * HR_H;
                          const c = (EV_TYPES[ev.type] || EV_TYPES.meeting).color;
                          return (
                            <div key={ev.id} onClick={() => setSelectedEv(ev)} style={{ 
                              position: 'absolute', top: Math.max(0, topPx) + 1, left: 3, right: 3,
                              height: Math.max(heightPx - 2, 16), overflow: 'hidden', background: c + '1F', borderLeft: '3px solid ' + c,
                              borderRadius: '0 7px 7px 0', padding: '3px 6px', cursor: 'pointer', zIndex: 10 
                            }}>
                              <div style={{ fontSize: 10.5, fontWeight: 600, color: c, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: SANS }}>{ev.title}</div>
                              {heightPx > 30 && <div style={{ fontSize: 9, color: C.inkSoft, fontFamily: SANS }}>{ev.startTime}-{ev.endTime}</div>}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
            <FreeTimePanel events={events} team={team} date={TODAY_STR} isMobile={false} />
          </div>
        </div>
      )}

      {selectedEv && (
        <EventDetailModal 
          event={selectedEv} 
          team={team} 
          projects={projects} 
          onClose={() => setSelectedEv(null)} 
          onDelete={() => { onDeleteEvent(selectedEv.id); setSelectedEv(null); }} 
          isMobile={isMobile}
        />
      )}
      {showAdd && (
        <AddEventModal 
          team={team} 
          projects={projects} 
          defaultDate={addDate} 
          onAdd={e => { onAddEvent(e); setShowAdd(false); }} 
          onClose={() => setShowAdd(false)} 
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
