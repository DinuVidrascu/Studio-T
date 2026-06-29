import React, { useState } from "react";
import { C, SERIF, SANS, STATUS_META } from "../../utils/constants";
import Card from "../common/Card";
import { Printer, MessageCircle, Zap, Users, Target, TrendingUp, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ACTIVITY_ICONS = {
  comment: MessageCircle,
  status: Zap,
  member: Users,
  milestone: Target,
  progress: TrendingUp,
  priority: Zap,
  date: Zap,
};

// ─── Excel Export ─────────────────────────────────────────────────────────────
const exportExcel = (projects, team) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Projects Overview
  const projectRows = projects.map(p => {
    const memberNames = (p.team || []).map(tid => team.find(t => t.id === tid)?.name || '').filter(Boolean).join('; ');
    const doneMil = (p.milestones || []).filter(m => m.completed).length;
    const totalMil = (p.milestones || []).length;
    const daysLeftVal = p.endDate ? Math.ceil((new Date(p.endDate) - new Date()) / 86400000) : null;
    return {
      'Proiect': p.name,
      'Client': p.client || '',
      'Status': STATUS_META[p.status]?.label || p.status,
      'Prioritate': p.priority === 'high' ? 'Inalta' : p.priority === 'medium' ? 'Medie' : 'Redusa',
      'Progres (%)': p.progress,
      'Deadline': p.endDate || '',
      'Zile Ramase': daysLeftVal,
      'Membri Echipa': memberNames,
      'Milestones Completate': `${doneMil}/${totalMil}`,
      'Buget': p.budget || '',
    };
  });
  const ws1 = XLSX.utils.json_to_sheet(projectRows);
  ws1['!cols'] = [
    { wch: 30 }, { wch: 22 }, { wch: 14 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 35 },
    { wch: 22 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Proiecte');

  // Sheet 2: Milestones
  const milRows = projects.flatMap(p =>
    (p.milestones || []).map(ms => {
      const assignee = team.find(t => t.id === ms.assigneeId);
      const isPast = ms.date && new Date(ms.date) < new Date() && !ms.completed;
      return {
        'Proiect': p.name,
        'Etapa (Milestone)': ms.name,
        'Data Scadenta': ms.date || '',
        'Responsabil': assignee?.name || '',
        'Status': ms.completed ? 'Finalizat' : isPast ? 'Intarziat' : 'In curs',
      };
    })
  );
  if (milRows.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(milRows);
    ws2['!cols'] = [{ wch: 28 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Milestones');
  }

  // Sheet 3: Team Workload
  const teamRows = team.map(member => {
    const activeP = projects.filter(p => (p.status === 'active' || p.status === 'at-risk') && (p.team || []).includes(member.id));
    const completedP = projects.filter(p => p.status === 'done' && (p.team || []).includes(member.id));
    const milDone = projects.flatMap(p => (p.milestones || []).filter(m => m.completed && m.assigneeId === member.id)).length;
    return {
      'Nume': member.name,
      'Rol': member.role || '',
      'Email': member.email || '',
      'Proiecte Active': activeP.length,
      'Proiecte Finalizate': completedP.length,
      'Milestones Livrate': milDone,
      'Proiecte (detalii)': activeP.map(p => p.name).join('; '),
    };
  });
  const ws3 = XLSX.utils.json_to_sheet(teamRows);
  ws3['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Echipa Workload');

  // Sheet 4: Recent Activity
  const actRows = projects
    .flatMap(p => (p.activities || []).map(a => ({ ...a, projectName: p.name })))
    .sort((a, b) => b.time - a.time)
    .slice(0, 100)
    .map(a => ({
      'Proiect': a.projectName,
      'Tip': a.type || '',
      'Activitate': a.text,
      'Utilizator': a.userName || 'Tu',
      'Data si Ora': new Date(a.time).toLocaleString('ro-RO'),
    }));
  if (actRows.length > 0) {
    const ws4 = XLSX.utils.json_to_sheet(actRows);
    ws4['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 50 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Activitate Recenta');
  }

  XLSX.writeFile(wb, `Studio_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// ─── PDF Export ────────────────────────────────────────────────────────────────
const exportPDF = (projects, team) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  const totalProjects = projects.length;
  const avgProgress = totalProjects ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / totalProjects) : 0;
  const allMilestones = projects.flatMap(p => p.milestones || []);
  const completedMilestones = allMilestones.filter(m => m.completed).length;

  // Header
  doc.setFillColor(42, 54, 71);
  doc.rect(0, 0, 297, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDIO — Raport Proiecte', 14, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generat pe: ${today}`, 14, 20);

  // KPI Boxes
  const kpis = [
    { label: 'Total Proiecte', value: String(totalProjects), color: [42, 54, 71] },
    { label: 'Progres Mediu', value: `${avgProgress}%`, color: [99, 102, 241] },
    { label: 'Milestones', value: `${completedMilestones}/${allMilestones.length}`, color: [34, 197, 94] },
    { label: 'Rată Succes', value: allMilestones.length ? `${Math.round((completedMilestones / allMilestones.length) * 100)}%` : '—', color: [239, 68, 68] },
  ];
  kpis.forEach((kpi, i) => {
    const x = 14 + i * 68;
    doc.setFillColor(...kpi.color);
    doc.roundedRect(x, 32, 62, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, x + 31, 44, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, x + 31, 50, { align: 'center' });
  });

  // Projects Table
  doc.setTextColor(42, 54, 71);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Proiecte', 14, 62);

  const projectRows = projects.map(p => {
    const memberNames = (p.team || []).map(tid => team.find(t => t.id === tid)?.name || '').filter(Boolean).join(', ');
    const doneMil = (p.milestones || []).filter(m => m.completed).length;
    const totalMil = (p.milestones || []).length;
    const daysLeft = p.endDate ? Math.ceil((new Date(p.endDate) - new Date()) / 86400000) : null;
    return [
      p.name,
      p.client || '—',
      STATUS_META[p.status]?.label || p.status,
      p.priority === 'high' ? 'Înaltă' : p.priority === 'medium' ? 'Medie' : 'Redusă',
      `${p.progress}%`,
      p.endDate || '—',
      daysLeft !== null ? `${daysLeft}z` : '—',
      memberNames || '—',
      `${doneMil}/${totalMil}`
    ];
  });

  autoTable(doc, {
    startY: 66,
    head: [['Proiect', 'Client', 'Status', 'Prioritate', 'Progres', 'Deadline', 'Zile', 'Echipă', 'Milestones']],
    body: projectRows,
    theme: 'grid',
    headStyles: { fillColor: [42, 54, 71], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [42, 54, 71] },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: {
      0: { cellWidth: 48 }, 1: { cellWidth: 30 }, 2: { cellWidth: 22 },
      3: { cellWidth: 18 }, 4: { cellWidth: 16 }, 5: { cellWidth: 22 },
      6: { cellWidth: 12 }, 7: { cellWidth: 50 }, 8: { cellWidth: 20 }
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const progress = parseInt(data.cell.raw);
        const x = data.cell.x + 1;
        const y = data.cell.y + data.cell.height - 3.5;
        const w = data.cell.width - 2;
        doc.setFillColor(220, 220, 220);
        doc.roundedRect(x, y, w, 2, 0.5, 0.5, 'F');
        doc.setFillColor(99, 102, 241);
        doc.roundedRect(x, y, (w * progress) / 100, 2, 0.5, 0.5, 'F');
      }
    }
  });

  // Milestones Table (new page if needed)
  const milRows = projects.flatMap(p =>
    (p.milestones || []).map(ms => {
      const assignee = team.find(t => t.id === ms.assigneeId);
      const isPast = ms.date && new Date(ms.date) < new Date() && !ms.completed;
      return [
        p.name,
        ms.name,
        ms.date || '—',
        assignee?.name || '—',
        ms.completed ? 'Finalizat' : isPast ? 'Întârziat' : 'În curs',
      ];
    })
  );

  if (milRows.length > 0) {
    doc.addPage();
    doc.setFillColor(42, 54, 71);
    doc.rect(0, 0, 297, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDIO — Etape de Livrare (Milestones)', 14, 9);

    autoTable(doc, {
      startY: 20,
      head: [['Proiect', 'Etapă (Milestone)', 'Data Scadentă', 'Responsabil', 'Status']],
      body: milRows,
      theme: 'grid',
      headStyles: { fillColor: [42, 54, 71], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [42, 54, 71] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 80 }, 2: { cellWidth: 35 }, 3: { cellWidth: 50 }, 4: { cellWidth: 35 } },
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'Finalizat') doc.setTextColor(34, 197, 94);
          else if (val === 'Întârziat') doc.setTextColor(239, 68, 68);
          else doc.setTextColor(234, 179, 8);
        }
      }
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text(`Manager Proiecte Studio • ${today} • Pagina ${i}/${pageCount}`, 297 / 2, 206, { align: 'center' });
  }

  doc.save(`Studio_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ReportsView({ projects, team, isMobile }) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [exporting, setExporting] = useState(null); // 'pdf' | 'excel' | null

  const workloadData = team.map(member => {
    const activeProjects = projects.filter(p =>
      (p.status === 'active' || p.status === 'at-risk') &&
      p.team && p.team.includes(member.id)
    );
    return { member, count: activeProjects.length, projectNames: activeProjects.map(p => p.name).join(", ") };
  });

  const statusDistribution = Object.keys(STATUS_META).map(statusKey => {
    const count = projects.filter(p => p.status === statusKey).length;
    return { statusKey, meta: STATUS_META[statusKey], count };
  });

  const priorities = ['low', 'medium', 'high'];
  const priorityProgress = priorities.map(pri => {
    const priProjects = projects.filter(p => p.priority === pri);
    const avgProgress = priProjects.length
      ? Math.round(priProjects.reduce((acc, curr) => acc + curr.progress, 0) / priProjects.length) : 0;
    return {
      label: pri === 'low' ? 'Redusă' : pri === 'medium' ? 'Medie' : 'Înaltă',
      color: pri === 'low' ? C.sage : pri === 'medium' ? C.amber : C.coral,
      progress: avgProgress, count: priProjects.length
    };
  });

  const allMilestones = projects.flatMap(p => p.milestones || []);
  const completedMilestones = allMilestones.filter(m => m.completed).length;
  const totalMilestones = allMilestones.length;
  const totalProjects = projects.length;

  const globalActivity = projects
    .flatMap(p => (p.activities || []).map(a => ({ ...a, projectName: p.name, projectColor: p.color })))
    .sort((a, b) => b.time - a.time).slice(0, 12);

  let accumulatedPercent = 0;
  const statusSegments = statusDistribution.map(d => {
    const percent = totalProjects ? d.count / totalProjects : 0;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percent;
    return { ...d, startPercent, percent };
  });

  const getCoords = (p) => [Math.cos(2 * Math.PI * p), Math.sin(2 * Math.PI * p)];

  const handleExportExcel = () => {
    setExporting('excel');
    try { exportExcel(projects, team); }
    finally { setTimeout(() => setExporting(null), 800); }
  };

  const handleExportPDF = () => {
    setExporting('pdf');
    try { exportPDF(projects, team); }
    finally { setTimeout(() => setExporting(null), 800); }
  };

  return (
    <div className="fade-in-view" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: isMobile ? 16 : 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: C.ink, fontFamily: SERIF, letterSpacing: '-0.5px' }}>Rapoarte Studio</h1>
          {!isMobile && <p style={{ margin: '6px 0 0', color: C.inkSoft, fontSize: 14, fontFamily: SANS }}>Distribuția efortului, analiză de progres și productivitate</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Excel */}
          <button
            onClick={handleExportExcel}
            disabled={!!exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
              background: exporting === 'excel' ? '#166534' : '#16a34a',
              border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
              color: C.paper, fontSize: 12.5, fontWeight: 600, fontFamily: SANS,
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)', opacity: exporting && exporting !== 'excel' ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            <FileSpreadsheet size={15} />
            {exporting === 'excel' ? 'Se exportă...' : 'Export Excel'}
          </button>
          {/* PDF */}
          <button
            onClick={handleExportPDF}
            disabled={!!exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
              background: exporting === 'pdf' ? '#991b1b' : '#dc2626',
              border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
              color: C.paper, fontSize: 12.5, fontWeight: 600, fontFamily: SANS,
              boxShadow: '0 2px 8px rgba(220,38,38,0.3)', opacity: exporting && exporting !== 'pdf' ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            <FileText size={15} />
            {exporting === 'pdf' ? 'Se generează...' : 'Export PDF'}
          </button>
          {/* Print */}
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10,
              background: C.panel, border: '1px solid ' + C.line, cursor: 'pointer',
              color: C.ink, fontSize: 12.5, fontWeight: 600, fontFamily: SANS, boxShadow: C.shadowSoft
            }}
          >
            <Printer size={15} /> Tipărește
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Proiecte', value: totalProjects, color: C.ink, font: SERIF },
          { label: 'Progres Mediu', value: `${totalProjects ? Math.round(projects.reduce((a,c)=>a+c.progress,0)/totalProjects):0}%`, color: C.primary, font: SERIF },
          { label: 'Milestones', value: <>{completedMilestones}<span style={{ fontSize: 14, color: C.inkFaint, fontWeight: 500 }}>/{totalMilestones}</span></>, color: C.sage, font: SERIF },
          { label: 'Rată Succes', value: `${totalMilestones ? Math.round((completedMilestones/totalMilestones)*100):0}%`, color: C.coral, font: SERIF },
        ].map((kpi, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: C.inkSoft, textTransform: 'uppercase', fontFamily: SANS, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: kpi.font }}>{kpi.value}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: SANS }}>Workload per Designer</h3>
          <svg viewBox="0 0 520 200" width="100%" height="auto" style={{ display: 'block', overflow: 'visible' }}>
            {[0,1,2,3,4].map(val => {
              const y = 155 - (val/4)*120;
              return (
                <g key={val}>
                  <line x1="55" y1={y} x2="510" y2={y} stroke="rgba(34,31,25,0.06)" strokeDasharray={val>0?"3 4":"none"} />
                  <text x="48" y={y} fontSize="9.5" fill={C.inkFaint} textAnchor="end" dominantBaseline="middle" fontFamily={SANS}>{val}</text>
                </g>
              );
            })}
            {workloadData.map((d, idx) => {
              const spacing = Math.min(100, Math.floor(460/Math.max(workloadData.length,1)));
              const x = 80 + idx*spacing;
              const maxVal = Math.max(...workloadData.map(w=>w.count),1);
              const barH = (d.count/Math.max(maxVal,4))*120;
              const y = 155-barH;
              const isHov = hoveredBar?.id===d.member.id;
              return (
                <g key={idx}
                  onMouseEnter={e=>{const r=e.currentTarget.closest('svg').getBoundingClientRect();setHoveredBar({id:d.member.id,name:d.member.name,count:d.count,projectNames:d.projectNames||"Niciun proiect activ",x:r.left+x,y:r.top+y});}}
                  onMouseLeave={()=>setHoveredBar(null)}
                  style={{cursor:'pointer'}}
                >
                  <rect x={x-18} y={y} width="36" height={Math.max(barH,4)} rx="6" fill={d.member.color} fillOpacity={isHov ? 1 : 0.6} style={{transition:'fill-opacity 0.15s'}} />
                  {d.count>0&&<text x={x} y={y-5} fontSize="11" fontWeight="700" fill={isHov?d.member.color:C.inkSoft} textAnchor="middle" fontFamily={SANS}>{d.count}</text>}
                  <text x={x} y="170" fontSize="11" fontWeight="700" fill={C.ink} textAnchor="middle" fontFamily={SANS}>{d.member.initials}</text>
                  <text x={x} y="184" fontSize="8.5" fill={C.inkSoft} textAnchor="middle" fontFamily={SANS}>{d.member.name.split(" ")[0]}</text>
                </g>
              );
            })}
            <line x1="55" y1="155" x2="510" y2="155" stroke={C.line} strokeWidth="1" />
          </svg>
        </Card>

        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: SANS }}>Stadiul Proiectelor</h3>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, gap:14, flexWrap:'wrap' }}>
            <div style={{ width:110, height:110, position:'relative', flexShrink:0 }}>
              <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ transform:'rotate(-90deg)', width:'100%', height:'100%' }}>
                {statusSegments.map((seg, idx) => {
                  if (seg.count===0) return null;
                  const [sx,sy]=getCoords(seg.startPercent);
                  const [ex,ey]=getCoords(seg.startPercent+seg.percent);
                  const laf=seg.percent>0.5?1:0;
                  const d=[`M ${sx} ${sy}`,`A 1 1 0 ${laf} 1 ${ex} ${ey}`,`L 0 0`].join(' ');
                  return <path key={idx} d={d} fill={seg.meta.color} stroke={C.panel} strokeWidth="0.04" />;
                })}
                <circle r="0.6" fill={C.panel} />
              </svg>
              <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:SANS }}>
                <span style={{ fontSize:18, fontWeight:700, color:C.ink }}>{totalProjects}</span>
                <span style={{ fontSize:8.5, color:C.inkFaint, textTransform:'uppercase' }}>Total</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, flex:1, minWidth:100 }}>
              {statusDistribution.map(d => (
                <div key={d.statusKey} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, fontFamily:SANS }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:d.meta.color }} />
                    <span style={{ color:C.inkSoft }}>{d.meta.label}</span>
                  </div>
                  <span style={{ fontWeight:700, color:C.ink, marginLeft:8 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Priority Progress */}
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: SANS }}>Progres Mediu per Prioritate</h3>
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:16 }}>
          {priorityProgress.map((p, idx) => (
            <div key={idx} style={{ background:C.panelAlt, border:'1px solid '+C.lineSoft, borderRadius:12, padding:'14px 16px', fontFamily:SANS }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:p.color }}>Prioritate {p.label}</span>
                <span style={{ fontSize:11, color:C.inkFaint, background:C.panel, borderRadius:20, padding:'2px 8px' }}>{p.count} proiecte</span>
              </div>
              <div style={{ fontSize:26, fontWeight:700, color:C.ink, marginBottom:8 }}>{p.progress}%</div>
              <div style={{ width:'100%', height:6, background:C.lineSoft, borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${p.progress}%`, height:'100%', background:p.color, borderRadius:3, transition:'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Global Activity Feed */}
      {globalActivity.length > 0 && (
        <Card style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: SANS }}>Activitate Recentă în Studio</h3>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {globalActivity.map((act, idx) => {
              const ActIcon = ACTIVITY_ICONS[act.type] || Zap;
              const isComment = act.type==='comment';
              return (
                <div key={act.id} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 0', borderBottom: idx<globalActivity.length-1?'1px solid '+C.lineSoft:'none' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background: isComment?C.primarySoft:C.panelAlt, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <ActIcon size={13} color={isComment?C.primary:C.inkSoft} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2, flexWrap:'wrap' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:act.projectColor }} />
                      <span style={{ fontSize:11, fontWeight:700, color:act.projectColor, fontFamily:SANS }}>{act.projectName}</span>
                      <span style={{ fontSize:10, color:C.inkFaint, fontFamily:SANS }}>
                        {new Date(act.time).toLocaleString('ro-RO', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <span style={{ fontSize:12.5, color:C.ink, fontFamily:SANS, lineHeight:1.4 }}>{act.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tooltip */}
      {hoveredBar && (
        <div style={{
          position:'fixed', left:hoveredBar.x, top:hoveredBar.y-80,
          background: C.ink, color: C.paper, borderRadius:8,
          padding:'10px 14px', fontFamily:SANS, fontSize:12, zIndex:2000,
          boxShadow:'0 4px 16px rgba(0,0,0,0.2)', pointerEvents:'none', maxWidth:240,
          transform:'translate(-50%,0)'
        }}>
          <div style={{ fontWeight:700, marginBottom:4 }}>{hoveredBar.name}</div>
          <div style={{ color:'#bbb', marginBottom:4 }}>{hoveredBar.count} proiecte active</div>
          {hoveredBar.projectNames && (
            <div style={{ fontSize:10, color:'#999', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:6 }}>{hoveredBar.projectNames}</div>
          )}
        </div>
      )}
    </div>
  );
}
