const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// Chunk 1: State
content = content.replace(
  "const [notifications, setNotifications] = useState([]);",
  `const [localNotifications, setLocalNotifications] = useState([]);
  const [dbNotifications, setDbNotifications] = useState([]);
  const notifications = useMemo(() => {
    return [...localNotifications, ...dbNotifications].sort((a, b) => b.time - a.time);
  }, [localNotifications, dbNotifications]);`
);

// Chunk 2: Listener
content = content.replace(
  `      }
    });

    return () => {
      unsubProjects();
      unsubTeam();
      unsubEvents();
      unsubUsers();
    };`,
  `      }
    });

    const unsubNotifs = onSnapshot(collection(db, "notifications"), (snapshot) => {
      if (snapshot.empty) {
        setDbNotifications([]);
      } else {
        const notifs = [];
        snapshot.forEach((doc) => notifs.push(doc.data()));
        setDbNotifications(notifs);
      }
    });

    return () => {
      unsubProjects();
      unsubTeam();
      unsubEvents();
      unsubUsers();
      unsubNotifs();
    };`
);

// Chunk 3: Local notifications (automated)
content = content.replace(
  `    if (newNotifs.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const toAdd = newNotifs.filter(n => !existingIds.has(n.id));
        return [...prev, ...toAdd];
      });
    }`,
  `    if (newNotifs.length > 0) {
      setLocalNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const toAdd = newNotifs.filter(n => !existingIds.has(n.id));
        return [...prev, ...toAdd];
      });
    }`
);

// Chunk 4: Handlers
// First, insert addNotification right after the useEffect
const addNotifCode = `
  const addNotification = useCallback(async (notif) => {
    if (isConfigured) {
      await setDoc(doc(db, "notifications", notif.id), notif);
    } else {
      setDbNotifications(prev => [notif, ...prev]);
    }
  }, [isConfigured]);

  const handleAddEvent`;

content = content.replace("  const handleAddEvent", addNotifCode);

// Replace all setNotifications(prev => [{...}, ...prev]); with addNotification({...}); in handlers.
// Since the structure is quite specific: 
// setNotifications(prev => [{ id: ..., message: ... }, ...prev]);
// we will replace them using a regex
content = content.replace(/setNotifications\(prev => \[([\s\S]*?),\s*\.\.\.prev\]\);/g, (match, p1) => {
  return `addNotification(${p1});`;
});

// Update useCallback dependencies to include addNotification
content = content.replace(/}, \[currentUser, isConfigured\]\);/g, "}, [currentUser, isConfigured, addNotification]);");
content = content.replace(/}, \[isConfigured\]\);/g, "}, [isConfigured, addNotification]);");
content = content.replace(/}, \[currentUser, userRole, handleUpdateProject\]\);/g, "}, [currentUser, userRole, handleUpdateProject, addNotification]);");

fs.writeFileSync(appJsxPath, content, 'utf8');
console.log('App.jsx updated with Firebase notifications!');
