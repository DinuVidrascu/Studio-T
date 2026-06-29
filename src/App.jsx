import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, isConfigured, auth } from "./utils/firebase";
import LoginView from "./components/views/LoginView";

// Utilities
import { C, SERIF, SANS, DEF_PROJECTS, DEF_TEAM, DEF_EVENTS, STATUS_META, PALETTE } from "./utils/constants";
import { fmtDate, priorityLabel, priorityColor, useWindowWidth, daysLeft } from "./utils/helpers";

// Layout components
import Sidebar from "./components/layout/Sidebar";
import MobileHeader from "./components/layout/MobileHeader";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import ModalWrap from "./components/layout/ModalWrap";

// Common UI atoms
import Avatar from "./components/common/Avatar";
import FField from "./components/common/FField";
import NotificationsBell from "./components/common/NotificationsBell";
import Toast from "./components/common/Toast";

// Modals
import AddProjectModal from "./components/modals/AddProjectModal";
import EventRequestModal from "./components/modals/EventRequestModal";
import AddTeamModal from "./components/modals/AddTeamModal";

// Views
import Dashboard from "./components/views/Dashboard";
import GanttView from "./components/views/GanttView";
import CalendarView from "./components/views/CalendarView";
import ProjectsView from "./components/views/ProjectsView";
import TeamView from "./components/views/TeamView";
import ReportsView from "./components/views/ReportsView";
import SettingsView from "./components/views/SettingsView";

export default function App() {
  const [view, setView] = useState('dashboard');
  const [projectsFilter, setProjectsFilter] = useState('all');
  const [projects, setProjects] = useState(DEF_PROJECTS);
  const [team, setTeam] = useState(DEF_TEAM);
  const [events, setEvents] = useState(DEF_EVENTS);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneAssigneeId, setNewMilestoneAssigneeId] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [activeModalTab, setActiveModalTab] = useState('details');

  const openOnActivity = (proj) => {
    setActiveModalTab('activity');
    setSelectedProject(proj);
  };
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [userApproved, setUserApproved] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const w = useWindowWidth();
  const isMobile = w < 768;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isConfigured) {
      setAuthLoading(false);
      setUserApproved(true); // bypass approval in local dev
      return;
    }
    let userDocUnsubscribe = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Cleanup previous user doc listener
      if (userDocUnsubscribe) { userDocUnsubscribe(); userDocUnsubscribe = null; }

      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // Brand new user — create doc with approved: false
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              role: 'user',
              approved: false,
              createdAt: Date.now()
            });
            setUserRole('user');
            setUserApproved(false);
          } else {
            const data = userSnap.data();
            setUserRole(data.role || 'user');
            setUserApproved(data.approved === true);
            // Update display info
            await setDoc(userRef, {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL
            }, { merge: true });
          }

          // Real-time listener — detects when admin approves the user
          userDocUnsubscribe = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              const d = snap.data();
              setUserRole(d.role || 'user');
              setUserApproved(d.approved === true);
            }
          });
        } catch (err) {
          console.error("Error setting user profile:", err);
          setUserRole('user');
          setUserApproved(false);
        }
      } else {
        setUserRole('user');
        setUserApproved(false);
      }
      setAuthLoading(false);
    });
    return () => {
      unsubscribeAuth();
      if (userDocUnsubscribe) userDocUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userRole !== 'admin' && ['settings', 'reports'].includes(view)) {
      setView('dashboard');
    }
  }, [userRole, view]);

  useEffect(() => {
    if (!isConfigured || !currentUser) return;

    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      if (snapshot.empty) {
        setProjects([]);
      } else {
        const projs = [];
        snapshot.forEach((doc) => projs.push(doc.data()));
        setProjects(projs);
      }
    });

    const unsubTeam = onSnapshot(collection(db, "team"), (snapshot) => {
      if (snapshot.empty) {
        setTeam([]);
      } else {
        const tm = [];
        snapshot.forEach((doc) => tm.push(doc.data()));
        setTeam(tm);
      }
    });

    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      if (snapshot.empty) {
        setEvents([]);
      } else {
        const evs = [];
        snapshot.forEach((doc) => evs.push(doc.data()));
        setEvents(evs);
      }
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      if (snapshot.empty) {
        setRegisteredUsers([]);
      } else {
        const usrs = [];
        snapshot.forEach((doc) => usrs.push(doc.data()));
        setRegisteredUsers(usrs);
      }
    });

    return () => {
      unsubProjects();
      unsubTeam();
      unsubEvents();
      unsubUsers();
    };
  }, [currentUser]);

  useEffect(() => {
    // Generate initial automated notifications
    const newNotifs = [];
    
    const now = new Date();
    // Check deadlines (< 3 days)
    projects.forEach(p => {
      if (p.status !== 'completed') {
        const d = daysLeft(p.endDate);
        if (d !== null && d >= 0 && d <= 3) {
          newNotifs.push({
            id: `deadline-${p.id}`,
            type: 'deadline',
            severity: d === 0 ? 'critical' : 'warning',
            message: d === 0
              ? `⛔ Proiectul "${p.name}" are deadline AZI!`
              : `⏰ Proiectul "${p.name}" are deadline în ${d} zile.`,
            time: Date.now(),
            read: false
          });
        }
        // Deadline depășit
        if (d !== null && d < 0 && p.status !== 'completed') {
          newNotifs.push({
            id: `overdue-${p.id}`,
            type: 'overdue',
            severity: 'critical',
            message: `🔴 Proiectul "${p.name}" are deadline depășit cu ${Math.abs(d)} zile!`,
            time: Date.now(),
            read: false
          });
        }
      }
    });

    // Check overdue milestones
    projects.forEach(p => {
      (p.milestones || []).forEach(ms => {
        if (!ms.completed && ms.date && new Date(ms.date) < now) {
          newNotifs.push({
            id: `ms-overdue-${p.id}-${ms.name}`,
            type: 'milestone',
            severity: 'warning',
            message: `📌 Etapa "${ms.name}" din "${p.name}" este depășită.`,
            time: Date.now(),
            read: false
          });
        }
      });
    });

    // Check over-allocation (>= 3 active projects per member)
    team.forEach(m => {
      const activeProjCount = projects.filter(p => p.status !== 'completed' && p.team && p.team.includes(m.id)).length;
      if (activeProjCount >= 3) {
        newNotifs.push({
          id: `alloc-${m.id}`,
          type: 'allocation',
          severity: 'warning',
          message: `⚠️ ${m.name} este supra-solicitat (${activeProjCount} proiecte active).`,
          time: Date.now(),
          read: false
        });
      }
    });

    if (newNotifs.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const toAdd = newNotifs.filter(n => !existingIds.has(n.id));
        return [...prev, ...toAdd];
      });
    }
  }, [projects, team]);

  const handleAddEvent = async (newEv) => {
    // Non-admin events with tagged members go into 'pending' state
    const isPending = userRole !== 'admin' && newEv.team && newEv.team.length > 0;
    const evData = {
      ...newEv,
      creatorId: currentUser ? currentUser.uid : null,
      creatorEmail: currentUser ? currentUser.email : null,
      creatorUserId: currentUser ? currentUser.uid : null,
      status: isPending ? 'pending' : 'confirmed'
    };
    if (isConfigured) {
      await setDoc(doc(db, "events", newEv.id), evData);
    } else {
      setEvents(prev => [...prev, evData]);
    }
    // Notify admin when a user creates an event with tagged members
    if (isPending) {
      const creatorName = currentUser?.displayName || currentUser?.email || 'Un utilizator';
      setNotifications(prev => [{
        id: `ev-req-${newEv.id}-${Date.now()}`,
        type: 'calendar',
        message: `📅 ${creatorName} a solicitat o întâlnire: "${newEv.title}" pe ${newEv.date} la ${newEv.startTime}.`,
        time: Date.now(),
        read: false
      }, ...prev]);
    }
  };

  const handleAcceptEvent = async (ev) => {
    const updated = { ...ev, status: 'confirmed' };
    if (isConfigured) {
      await updateDoc(doc(db, "events", ev.id), { status: 'confirmed' });
    } else {
      setEvents(prev => prev.map(e => e.id === ev.id ? updated : e));
    }
    // Notify the creator
    setNotifications(prev => [{
      id: `ev-acc-${ev.id}-${Date.now()}`,
      projectId: null,
      type: 'calendar',
      message: `✅ Înâlnirea "${ev.title}" pe ${ev.date} la ${ev.startTime} a fost acceptată!`,
      time: Date.now(),
      read: false
    }, ...prev]);
  };

  const handleRefuseEvent = async (ev, mode) => {
    if (mode === 'refuse') {
      if (isConfigured) {
        await updateDoc(doc(db, "events", ev.id), { status: 'refused' });
      } else {
        setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, status: 'refused' } : e));
      }
      setNotifications(prev => [{
        id: `ev-ref-${ev.id}-${Date.now()}`,
        projectId: null,
        type: 'calendar',
        message: `❌ Înâlnirea "${ev.title}" pe ${ev.date} a fost refuzată de Lead.`,
        time: Date.now(),
        read: false
      }, ...prev]);
    }
    // 'dismiss' just closes the modal without changing status
  };

  const handleProposeNewTime = async (ev, newDate, newStart, newEnd) => {
    const updated = { ...ev, date: newDate, startTime: newStart, endTime: newEnd, status: 'counter-proposed' };
    if (isConfigured) {
      await updateDoc(doc(db, "events", ev.id), { date: newDate, startTime: newStart, endTime: newEnd, status: 'counter-proposed' });
    } else {
      setEvents(prev => prev.map(e => e.id === ev.id ? updated : e));
    }
    setNotifications(prev => [{
      id: `ev-prop-${ev.id}-${Date.now()}`,
      projectId: null,
      type: 'calendar',
      message: `📆 Lead propune altă dată pentru "${ev.title}": ${newDate} la ${newStart}–${newEnd}.`,
      time: Date.now(),
      read: false
    }, ...prev]);
  };

  const handleDeleteEvent = async (evId) => {
    if (isConfigured) {
      await deleteDoc(doc(db, "events", evId));
    } else {
      setEvents(prev => prev.filter(e => e.id !== evId));
    }
  };

  const handleAddProject = async (newProj) => {
    if (isConfigured) {
      await setDoc(doc(db, "projects", newProj.id), newProj);
    } else {
      setProjects(prev => [...prev, newProj]);
    }
    setToast({ message: `Proiectul "${newProj.name}" a fost adaugat cu succes!`, type: 'success' });
  };

  const handleDeleteProject = async (projId) => {
    if (isConfigured) {
      await deleteDoc(doc(db, "projects", projId));
      const evsToUpdate = events.filter(e => e.projectId === projId);
      for (const ev of evsToUpdate) {
        await updateDoc(doc(db, "events", ev.id), { projectId: "" });
      }
    } else {
      setProjects(prev => prev.filter(p => p.id !== projId));
      setEvents(prev => prev.map(e => e.projectId === projId ? { ...e, projectId: '' } : e));
    }
    setToast({ message: 'Proiectul a fost sters din Studio.', type: 'info' });
  };

  const handleUpdateProject = async (updatedProj) => {
    if (isConfigured) {
      await setDoc(doc(db, "projects", updatedProj.id), updatedProj);
    } else {
      setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    }
    setNotifications(prev => [{
      id: `update-${updatedProj.id}-${Date.now()}`,
      projectId: updatedProj.id,
      type: 'update',
      message: `Proiectul "${updatedProj.name}" a fost actualizat.`,
      time: Date.now(),
      read: false
    }, ...prev]);
  };

  const logActivity = (proj, text, type, extraUpdates = {}) => {
    const act = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      time: Date.now(),
      type,
      userName: currentUser?.displayName || currentUser?.email || 'User'
    };
    if (type === 'comment' && userRole !== 'admin') {
      setNotifications(prev => [{
        id: `msg-${proj.id}-${Date.now()}`,
        projectId: proj.id,
        type: 'update',
        message: `${act.userName} a lăsat un comentariu la proiectul "${proj.name}"`,
        time: Date.now(),
        read: false
      }, ...prev]);
    }
    const updated = {
      ...proj,
      ...extraUpdates,
      activities: [act, ...(proj.activities || [])]
    };
    setSelectedProject(updated);
    handleUpdateProject(updated);
  };

  const handleAddTeamMember = async (newMem) => {
    if (isConfigured) {
      await setDoc(doc(db, "team", newMem.id), newMem);
    } else {
      setTeam(prev => [...prev, newMem]);
    }
  };

  const handleNavigate = (newView, filter = 'all') => {
    setView(newView);
    if (newView === 'projects')    setProjectsFilter(filter);
    handleNavChange(newView);
  };

  const handleNavChange = (newView) => {
    if (newView === view) return;
    setIsLoading(true);
    setView(newView);
    setTimeout(() => setIsLoading(false), 400);
  };

  const handleEditTeamMember = async (updatedMem) => {
    if (isConfigured) {
      await setDoc(doc(db, "team", updatedMem.id), updatedMem);
    } else {
      setTeam(prev => prev.map(t => t.id === updatedMem.id ? updatedMem : t));
    }
  };

  const handleDeleteTeamMember = async (memId) => {
    if (isConfigured) {
      await deleteDoc(doc(db, "team", memId));
      const projsToUpdate = projects.filter(p => p.team && p.team.includes(memId));
      for (const p of projsToUpdate) {
        await updateDoc(doc(db, "projects", p.id), {
          team: p.team.filter(tid => tid !== memId)
        });
      }
      const evsToUpdate = events.filter(e => e.team && e.team.includes(memId));
      for (const e of evsToUpdate) {
        await updateDoc(doc(db, "events", e.id), {
          team: e.team.filter(tid => tid !== memId)
        });
      }
    } else {
      setTeam(prev => prev.filter(t => t.id !== memId));
      setProjects(prev => prev.map(p => ({ ...p, team: p.team.filter(tid => tid !== memId) })));
      setEvents(prev => prev.map(e => ({ ...e, team: e.team.filter(tid => tid !== memId) })));
    }
  };

  const myMember = team.find(t => t.userId === currentUser?.uid || t.email === currentUser?.email);
  const myMemberId = myMember ? myMember.id : null;

  const visibleProjects = userRole === 'admin'
    ? projects
    : projects.filter(p => p.team && p.team.includes(myMemberId));

  const visibleEvents = userRole === 'admin'
    ? events.filter(e => e.status !== 'pending' && e.status !== 'refused')
    : events.filter(e => {
        const isCreator = e.creatorId === currentUser?.uid;
        const userInEventTeam = e.team && e.team.includes(myMemberId);
        const isVisible = e.status !== 'refused';
        return isVisible && (isCreator || (userInEventTeam && e.status === 'confirmed'));
      });

  // Pending event requests for admin to approve
  const pendingRequests = userRole === 'admin'
    ? events.filter(e => e.status === 'pending')
    : [];

  const visibleNotifications = userRole === 'admin'
    ? notifications
    : notifications.filter(n => !n.projectId || projects.some(p => p.id === n.projectId && p.team && p.team.includes(myMemberId)));

  const renderView = () => {
    console.log("DEBUG FRONTEND: userRole =", userRole, "currentUser =", currentUser?.email);
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            projects={visibleProjects}
            team={team}
            events={visibleEvents}
            onOpen={setSelectedProject}
            onAdd={() => setShowAddProject(true)}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onNavigate={handleNavigate}
            isMobile={isMobile}
            isLoading={isLoading}
            userRole={userRole}
          />
        );
      case 'gantt':
        return (
          <GanttView
            projects={visibleProjects}
            team={team}
            onOpen={setSelectedProject}
            onUpdateProject={handleUpdateProject}
            onAdd={() => setShowAddProject(true)}
            isMobile={isMobile}
            userRole={userRole}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            projects={visibleProjects}
            team={team}
            events={visibleEvents}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            isMobile={isMobile}
            userRole={userRole}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            defaultFilter={projectsFilter}
            projects={visibleProjects}
            team={team}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onOpen={setSelectedProject}
            onOpenActivity={openOnActivity}
            isMobile={isMobile}
            isLoading={isLoading}
            userRole={userRole}
          />
        );
      case 'team':
        return (
          <TeamView
            team={team}
            projects={visibleProjects}
            onAddTeamMember={handleAddTeamMember}
            onDeleteTeamMember={handleDeleteTeamMember}
            onEditTeamMember={setEditingTeamMember}
            isMobile={isMobile}
            isLoading={isLoading}
            userRole={userRole}
            registeredUsers={registeredUsers}
          />
        );
      case 'reports':
        if (userRole !== 'admin') return null;
        return (
          <ReportsView
            projects={visibleProjects}
            team={team}
            isMobile={isMobile}
            userRole={userRole}
          />
        );
      case 'settings':
        if (userRole !== 'admin') return null;
        return (
          <SettingsView
            theme={theme}
            setTheme={setTheme}
            isMobile={isMobile}
          />
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', width: '100vw', background: '#0d1117', color: '#fff', fontFamily: SANS
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: C.primary, borderRadius: '50%',
          animation: 'spin 1s linear infinite', marginBottom: 16
        }} />
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Se încarcă...</span>
      </div>
    );
  }

  if (isConfigured && !currentUser) {
    return <LoginView />;
  }

  // User logged in but not yet approved by admin
  if (isConfigured && currentUser && !userApproved) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', width: '100vw', background: '#0d1117', fontFamily: SANS,
        padding: 24, boxSizing: 'border-box'
      }}>
        {/* Animated background blobs */}
        <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: C.primarySoft, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', background: C.coralSoft, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }} />

        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
          padding: isMobile ? '32px 24px' : '48px 56px',
          maxWidth: 460, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1
        }}>
          {/* Spinning clock icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}40, ${C.primary}15)`,
            border: `2px solid ${C.primary}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: 36,
            animation: 'pulse 2s ease-in-out infinite'
          }}>⏳</div>

          <h1 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 700, color: '#fff', fontFamily: SERIF, letterSpacing: '-0.5px' }}>
            Cont în așteptare
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            Contul tău a fost creat cu succes! Acum trebuie să aștepți ca <strong style={{ color: C.primary }}>Lead-ul</strong> să îți aprobe accesul.
          </p>

          {/* User info card */}
          <div style={{
            background: 'rgba(255,255,255,0.07)', borderRadius: 14,
            padding: '14px 18px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left'
          }}>
            {currentUser?.photoURL && (
              <img src={currentUser.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${C.primary}` }} />
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{currentUser?.displayName || 'Utilizator'}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{currentUser?.email}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: C.amber, background: `${C.amber}20`, padding: '4px 10px', borderRadius: 20, border: `1px solid ${C.amber}40` }}>
              ÎN AȘTEPTARE
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: `${C.primary}10`, border: `1px solid ${C.primary}30`, borderRadius: 10, padding: '12px 14px', marginBottom: 24, textAlign: 'left' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              Odată ce Lead-ul îți aprobă accesul, vei intra automat în aplicație — <strong style={{ color: 'rgba(255,255,255,0.9)' }}>fără să dai refresh</strong>.
            </span>
          </div>

          <button
            onClick={() => { auth.signOut(); }}
            style={{
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
              padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: SANS
            }}
          >
            Deconectează-te
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', width: '100%', background: C.paper, position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs for glassmorphism effect */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: C.primarySoft, borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, opacity: 0.7, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', background: C.coralSoft, borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }} />
      {!isMobile ? (
        <Sidebar view={view} setView={handleNavChange} unreadCount={visibleNotifications.filter(n => !n.read).length} theme={theme} setTheme={setTheme} user={currentUser} userRole={userRole} />
      ) : (
        <MobileHeader view={view} setView={handleNavChange} unreadCount={visibleNotifications.filter(n => !n.read).length} user={currentUser} userRole={userRole} />
      )}

      <NotificationsBell 
        notifications={visibleNotifications} 
        setNotifications={setNotifications} 
        isMobile={isMobile} 
      />

      <main key={view} className="fade-in-view" style={{
        flex: 1,
        padding: isMobile ? '12px 18px 84px' : '28px 40px',
        maxWidth: isMobile ? '100%' : '1100px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 1,
        position: 'relative'
      }}>
        {renderView()}
      </main>

      {isMobile && (
        <MobileBottomNav view={view} setView={handleNavChange} userRole={userRole} />
      )}

      {/* Event Request Approval Modal - shown to admin when users request meetings */}
      {userRole === 'admin' && pendingRequests.length > 0 && (
        <EventRequestModal
          requests={pendingRequests}
          team={team}
          isMobile={isMobile}
          onAccept={(ev) => { handleAcceptEvent(ev); }}
          onRefuse={(ev, mode) => { handleRefuseEvent(ev, mode); }}
          onProposeNewTime={(ev, d, s, e2) => { handleProposeNewTime(ev, d, s, e2); }}
        />
      )}

      {/* Project detail modal */}
      {selectedProject && (
        <ModalWrap onClose={() => setSelectedProject(null)} isMobile={isMobile}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18 }}>
            <div style={{ flex: 1, marginRight: 16 }}>
              {userRole === 'admin' ? (
                <>
                  <input 
                    type="text" 
                    value={selectedProject.client}
                    onChange={(e) => {
                      const newProj = { ...selectedProject, client: e.target.value };
                      setSelectedProject(newProj);
                      handleUpdateProject(newProj);
                    }}
                    placeholder="Client..."
                    style={{ fontSize: 11, color: C.inkSoft, fontWeight: 500, fontFamily: SANS, background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: '0 0 2px 0', width: '100%' }}
                  />
                  <input 
                    type="text" 
                    value={selectedProject.name}
                    onChange={(e) => {
                      const newProj = { ...selectedProject, name: e.target.value };
                      setSelectedProject(newProj);
                      handleUpdateProject(newProj);
                    }}
                    placeholder="Nume proiect..."
                    style={{ fontSize: 18, fontFamily: SERIF, color: C.ink, background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, width: '100%', fontWeight: 600 }}
                  />
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 500, fontFamily: SANS, margin: '0 0 2px 0' }}>
                    {selectedProject.client || 'Client Nespecificat'}
                  </div>
                  <div style={{ fontSize: 18, fontFamily: SERIF, color: C.ink, fontWeight: 600, margin: 0 }}>
                    {selectedProject.name}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setSelectedProject(null)} style={{ background:C.lineSoft,border:'none',color:C.inkSoft,width:28,height:28,borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={14}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid ' + C.line }}>
              {['details', 'milestones', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveModalTab(tab)}
                  style={{
                    background: 'transparent', border: 'none', padding: '8px 4px', cursor: 'pointer',
                    fontSize: 13, fontWeight: activeModalTab === tab ? 700 : 500, fontFamily: SANS,
                    color: activeModalTab === tab ? C.ink : C.inkFaint,
                    borderBottom: activeModalTab === tab ? `2px solid ${C.ink}` : '2px solid transparent',
                    transition: 'all 0.2s ease', position: 'relative', top: 1
                  }}
                >
                  {tab === 'details' ? '🎯 Detalii' : tab === 'milestones' ? '📦 Echipă & Livrabile' : '💬 Activitate'}
                </button>
              ))}
            </div>

            <div style={{ minHeight: 300 }}>
              {activeModalTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                    <FField label="Status">
                      {userRole === 'admin' ? (
                        <select 
                          value={selectedProject.status}
                          onChange={(e) => {
                            logActivity(selectedProject, `A schimbat statusul în "${STATUS_META[e.target.value].label}"`, 'status', { status: e.target.value });
                          }}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.line,
                            background: C.panelAlt, color: C.ink, fontFamily: SANS, fontSize: 13, fontWeight: 600,
                            outline: 'none', cursor: 'pointer', width: '100%'
                          }}
                        >
                          {Object.entries(STATUS_META).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.lineSoft, background: C.panelAlt, color: C.ink, fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
                          {STATUS_META[selectedProject.status]?.label}
                        </div>
                      )}
                    </FField>
                    <FField label="Prioritate">
                      {userRole === 'admin' ? (
                        <select 
                          value={selectedProject.priority}
                          onChange={(e) => {
                            logActivity(selectedProject, `A schimbat prioritatea în "${priorityLabel(e.target.value)}"`, 'priority', { priority: e.target.value });
                          }}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.line,
                            background: C.panelAlt, color: priorityColor(selectedProject.priority), fontFamily: SANS, fontSize: 13, fontWeight: 600,
                            outline: 'none', cursor: 'pointer', width: '100%'
                          }}
                        >
                          <option value="low" style={{ color: priorityColor('low') }}>{priorityLabel('low')}</option>
                          <option value="medium" style={{ color: priorityColor('medium') }}>{priorityLabel('medium')}</option>
                          <option value="high" style={{ color: priorityColor('high') }}>{priorityLabel('high')}</option>
                        </select>
                      ) : (
                        <div style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.lineSoft, background: C.panelAlt, color: priorityColor(selectedProject.priority), fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
                          {priorityLabel(selectedProject.priority)}
                        </div>
                      )}
                    </FField>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                    <FField label="Data inceput">
                      {userRole === 'admin' ? (
                        <input 
                          type="date"
                          value={selectedProject.startDate}
                          onChange={(e) => {
                            logActivity(selectedProject, `A actualizat data de început: ${fmtDate(e.target.value)}`, 'date', { startDate: e.target.value });
                          }}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.line,
                            background: C.panelAlt, color: C.ink, fontFamily: SANS, fontSize: 13, fontWeight: 600,
                            outline: 'none', width: '100%', boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.lineSoft, background: C.panelAlt, color: C.ink, fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
                          {fmtDate(selectedProject.startDate) || 'Necompletat'}
                        </div>
                      )}
                    </FField>
                    <FField label="Data sfarsit (Deadline)">
                      {userRole === 'admin' ? (
                        <input 
                          type="date"
                          value={selectedProject.endDate}
                          onChange={(e) => {
                            logActivity(selectedProject, `A actualizat data de sfârșit: ${fmtDate(e.target.value)}`, 'date', { endDate: e.target.value });
                          }}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.line,
                            background: C.panelAlt, color: C.ink, fontFamily: SANS, fontSize: 13, fontWeight: 600,
                            outline: 'none', width: '100%', boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.lineSoft, background: C.panelAlt, color: C.ink, fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
                          {fmtDate(selectedProject.endDate) || 'Necompletat'}
                        </div>
                      )}
                    </FField>
                  </div>
                  <div>
                    <FField label="Progres">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.inkSoft, marginBottom: 8, fontFamily: SANS }}>
                        <span>{userRole === 'admin' ? 'Trage pentru a actualiza' : 'Nivel de progres'}</span>
                        <span style={{ fontWeight: 600, color: selectedProject.color }}>{selectedProject.progress}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={selectedProject.progress}
                        disabled={userRole !== 'admin'}
                        onChange={(e) => {
                          const newProj = { ...selectedProject, progress: parseInt(e.target.value) };
                          setSelectedProject(newProj);
                        }}
                        onMouseUp={() => {
                          logActivity(selectedProject, `A setat progresul la ${selectedProject.progress}%`, 'progress', { progress: selectedProject.progress });
                        }}
                        onTouchEnd={() => {
                          logActivity(selectedProject, `A setat progresul la ${selectedProject.progress}%`, 'progress', { progress: selectedProject.progress });
                        }}
                        style={{ width: '100%', accentColor: selectedProject.color, cursor: userRole === 'admin' ? 'pointer' : 'default', opacity: userRole === 'admin' ? 1 : 0.7 }}
                      />
                    </FField>
                  </div>
                  <FField label="Culoare branding">
                    <div style={{ display: 'flex', gap: 6, paddingTop: 6 }}>
                      {PALETTE.map(c => (
                        <button type="button" key={c} onClick={() => {
                          if (userRole === 'admin') {
                            logActivity(selectedProject, `A schimbat culoarea proiectului`, 'color', { color: c });
                          }
                        }} style={{
                          width: 22, height: 22, borderRadius: '50%', background: c, 
                          border: selectedProject.color === c ? '2px solid ' + C.ink : 'none', cursor: userRole === 'admin' ? 'pointer' : 'default'
                        }} />
                      ))}
                    </div>
                  </FField>
                  {userRole === 'admin' && myMemberId && !(selectedProject.team || []).includes(myMemberId) && (
                    <button 
                      type="button"
                      onClick={() => {
                        const newTeam = [...(selectedProject.team || []), myMemberId];
                        logActivity(selectedProject, `S-a alocat pe sine ca responsabil pe proiect`, 'member', { team: newTeam });
                      }}
                      style={{ background: C.primary, color: C.paper, border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginTop: 10, fontFamily: SANS }}
                    >
                      Alocă-mă pe mine ca responsabil
                    </button>
                  )}
                </div>
              )}

              {activeModalTab === 'milestones' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <label style={{ fontSize: 13, color: C.ink, fontWeight: 600, fontFamily: SANS }}>Echipa pe proiect</label>
                      {userRole === 'admin' && (
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              const member = team.find(t => t.id === e.target.value);
                              if (member) {
                                const newTeam = [...(selectedProject.team || []), member.id];
                                logActivity(selectedProject, `L-a adăugat pe ${member.name} în echipă`, 'member', { team: newTeam });
                              }
                              e.target.value = '';
                            }
                          }}
                          style={{ 
                            padding: '4px 8px', borderRadius: 8, border: '1px solid ' + C.line, 
                            background: C.panelAlt, color: C.ink, fontFamily: SANS, fontSize: 11, outline: 'none', cursor: 'pointer' 
                          }}
                        >
                          <option value="">+ Adaugă membru</option>
                          {team.filter(t => !(selectedProject.team || []).includes(t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {team.filter(t => selectedProject.team && selectedProject.team.includes(t.id)).map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.panelAlt, padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.line }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar p={m} size={24} />
                            <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 500, fontFamily: SANS }}>{m.name}</span>
                            <span style={{ fontSize: 11, color: C.inkSoft, fontFamily: SANS }}>• {m.role}</span>
                          </div>
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => {
                                const member = team.find(t => t.id === m.id);
                                if (member) {
                                  const newTeam = (selectedProject.team || []).filter(tid => tid !== m.id);
                                  logActivity(selectedProject, `L-a eliminat pe ${member.name} din echipă`, 'member', { team: newTeam });
                                }
                              }}
                              style={{ background: 'transparent', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                            ><X size={14}/></button>
                          )}
                        </div>
                      ))}
                      {(selectedProject.team || []).length === 0 && <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: SANS }}>Niciun membru alocat.</span>}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: C.ink, marginBottom: 12, fontWeight: 600, fontFamily: SANS }}>Etape de livrare (Milestones)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                      {(selectedProject.milestones || []).map((ms, idx) => {
                        const msAssignee = team.find(t => t.id === ms.assigneeId);
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.panelAlt, padding: '6px 10px', borderRadius: 8, border: '1px solid ' + C.line }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input 
                                type="checkbox" 
                                checked={ms.completed}
                                disabled={userRole !== 'admin'}
                                onChange={(e) => {
                                  const newM = [...(selectedProject.milestones || [])];
                                  newM[idx] = { ...newM[idx], completed: e.target.checked };
                                  const statusStr = e.target.checked ? 'finalizat' : 'redeschis';
                                  logActivity(selectedProject, `A ${statusStr} etapa "${newM[idx].name}"`, 'milestone', { milestones: newM });
                                }} 
                                style={{ cursor: userRole === 'admin' ? 'pointer' : 'default', accentColor: C.primary }}
                              />
                              <span style={{ fontSize: 13, color: ms.completed ? C.inkFaint : C.ink, textDecoration: ms.completed ? 'line-through' : 'none', fontFamily: SANS, fontWeight: 500 }}>{ms.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {msAssignee && (
                                <div title={msAssignee.name} style={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar p={msAssignee} size={18} />
                                </div>
                              )}
                              <span style={{ fontSize: 11, color: ms.completed ? C.inkFaint : C.inkSoft, fontFamily: SANS }}>{fmtDate(ms.date)}</span>
                              {userRole === 'admin' && (
                                <button 
                                  onClick={() => {
                                    const deletedName = (selectedProject.milestones || [])[idx]?.name;
                                    const newM = (selectedProject.milestones || []).filter((_, i) => i !== idx);
                                    logActivity(selectedProject, `A șters etapa "${deletedName}"`, 'milestone', { milestones: newM });
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: C.inkSoft, cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                                ><X size={14}/></button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(selectedProject.milestones || []).length === 0 && <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: SANS }}>Nicio etapă definită.</span>}
                    </div>
                    {userRole === 'admin' && (
                      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8 }}>
                        <input 
                          type="text" 
                          placeholder="Nume etapă..." 
                          value={newMilestoneName}
                          onChange={e => setNewMilestoneName(e.target.value)}
                          style={{ flex: 1, width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid ' + C.line, fontFamily: SANS, fontSize: 13, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} 
                        />
                        <input 
                          type="date" 
                          value={newMilestoneDate}
                          onChange={e => setNewMilestoneDate(e.target.value)}
                          style={{ width: isMobile ? '100%' : 110, padding: '8px 10px', borderRadius: 8, border: '1px solid ' + C.line, fontFamily: SANS, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} 
                        />
                        <select
                          value={newMilestoneAssigneeId}
                          onChange={e => setNewMilestoneAssigneeId(e.target.value)}
                          style={{ width: isMobile ? '100%' : 120, padding: '8px 10px', borderRadius: 8, border: '1px solid ' + C.line, fontFamily: SANS, fontSize: 12, outline: 'none', background: C.panel, cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value="">Responsabil...</option>
                          {team.filter(t => (selectedProject.team || []).includes(t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            if (newMilestoneName && newMilestoneDate) {
                              const msAssignee = team.find(t => t.id === newMilestoneAssigneeId);
                              const assigneeText = msAssignee ? ` (responsabil: ${msAssignee.name})` : '';
                              const newM = [...(selectedProject.milestones || []), { 
                                name: newMilestoneName, 
                                date: newMilestoneDate, 
                                completed: false,
                                assigneeId: newMilestoneAssigneeId || null
                              }];
                              logActivity(selectedProject, `A adăugat etapa "${newMilestoneName}" scadentă pe ${fmtDate(newMilestoneDate)}${assigneeText}`, 'milestone', { milestones: newM });
                              setNewMilestoneName('');
                              setNewMilestoneDate('');
                              setNewMilestoneAssigneeId('');
                            }
                          }}
                          style={{ background: C.primary, color: C.paper, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13, flexShrink: 0, width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' }}
                        >Adaugă</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeModalTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* CTA banner for non-admin users */}
                  {userRole !== 'admin' && (
                    <div style={{
                      background: `linear-gradient(135deg, ${C.primary}15, ${C.primary}28)`,
                      border: `1.5px solid ${C.primary}50`,
                      borderRadius: 12,
                      padding: '12px 16px',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      animation: 'ctaPulse 3s ease-in-out infinite'
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: C.primary, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0, fontSize: 18
                      }}>💬</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: SANS, marginBottom: 2 }}>
                          Poți lăsa un comentariu!
                        </div>
                        <div style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: SANS, lineHeight: 1.4 }}>
                          Scrie mai jos — comentariul tău va ajunge direct la Lead.
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingRight: 4 }}>
                    {(selectedProject.activities || []).map((act) => {
                      const isComment = act.type === 'comment';
                      return (
                        <div key={act.id} style={{ display: 'flex', flexDirection: 'column', background: isComment ? C.panel : C.panelAlt, border: '1px solid ' + (isComment ? C.line : C.lineSoft), borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: isComment ? C.primary : C.inkSoft, fontFamily: SANS }}>
                              {isComment ? `💬 ${act.userName}` : act.userName}
                            </span>
                            <span style={{ fontSize: 9.5, color: C.inkFaint, fontFamily: SANS }}>
                              {new Date(act.time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} • {fmtDate(act.time)}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: C.ink, fontFamily: SANS, lineHeight: 1.4 }}>
                            {act.text}
                          </span>
                        </div>
                      );
                    })}
                    {(selectedProject.activities || []).length === 0 && (
                      <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: SANS, fontStyle: 'italic' }}>Nicio activitate înregistrată încă.</span>
                    )}
                  </div>

                  {/* Comment input - highlighted for non-admins */}
                  <div style={{
                    background: userRole !== 'admin' ? `${C.primary}08` : 'transparent',
                    border: userRole !== 'admin' ? `2px solid ${C.primary}40` : 'none',
                    borderRadius: userRole !== 'admin' ? 12 : 0,
                    padding: userRole !== 'admin' ? 12 : 0,
                  }}>
                    {userRole !== 'admin' && (
                      <div style={{ fontSize: 11, color: C.primary, fontWeight: 600, fontFamily: SANS, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        ✏️ Scrie comentariul tău:
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input 
                        type="text" 
                        placeholder={userRole !== 'admin' ? 'Scrie un mesaj pentru Lead...' : 'Scrie un comentariu...'}
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newCommentText.trim()) {
                            logActivity(selectedProject, newCommentText.trim(), 'comment');
                            setNewCommentText('');
                          }
                        }}
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: 8,
                          border: '1.5px solid ' + (userRole !== 'admin' ? C.primary : C.line),
                          fontFamily: SANS, fontSize: 12.5, outline: 'none',
                          background: C.panel,
                          boxShadow: userRole !== 'admin' ? `0 0 0 3px ${C.primary}15` : 'none',
                          transition: 'box-shadow 0.2s ease'
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (newCommentText.trim()) {
                            logActivity(selectedProject, newCommentText.trim(), 'comment');
                            setNewCommentText('');
                          }
                        }}
                        style={{
                          background: C.primary, color: C.paper, border: 'none', borderRadius: 8,
                          padding: '10px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                          fontFamily: SANS, display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: userRole !== 'admin' ? `0 4px 12px ${C.primary}40` : 'none'
                        }}
                      >➤ Trimite</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid ' + C.line, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              {userRole === 'admin' ? (
                <button onClick={() => { handleDeleteProject(selectedProject.id); setSelectedProject(null); }} style={{
                  display: 'flex', alignItems: 'center', gap: 6, background: C.coralSoft, color: C.coral, border: 'none',
                  padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: SANS
                }}>
                  <Trash2 size={14} /> Sterge proiect
                </button>
              ) : (
                <div />
              )}
              <button onClick={() => setSelectedProject(null)} style={{
                background: C.ink, color: C.paper, border: 'none', padding: '8px 18px', borderRadius: 10,
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: SANS
              }}>
                Închide
              </button>
            </div>
          </div>
        </ModalWrap>
      )}

      {showAddProject && (
        <AddProjectModal
          team={team}
          onAdd={proj => { handleAddProject(proj); setShowAddProject(false); }}
          onClose={() => setShowAddProject(false)}
          isMobile={isMobile}
          defaultSelectedTeam={myMemberId ? [myMemberId] : []}
        />
      )}

      {editingTeamMember && (
        <AddTeamModal
          member={editingTeamMember}
          onEdit={m => { handleEditTeamMember(m); setEditingTeamMember(null); setToast({ message: 'Membru actualizat', type: 'success' }); }}
          onClose={() => setEditingTeamMember(null)}
          isMobile={isMobile}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
