const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'components', 'views');
const filesToMemoize = [
  'Dashboard.jsx', 'ProjectsView.jsx', 'TeamView.jsx', 
  'CalendarView.jsx', 'GanttView.jsx', 'SettingsView.jsx', 'ReportsView.jsx'
];

for (const file of filesToMemoize) {
  const filePath = path.join(viewsDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ensure React is imported
  if (!content.includes('import React')) {
    content = 'import React from "react";\n' + content;
  }
  
  // Match `export default function ComponentName(`
  const match = content.match(/export default function (\w+)\(/);
  if (match) {
    const compName = match[1];
    
    // Replace export default function X with function X
    content = content.replace(`export default function ${compName}(`, `function ${compName}(`);
    
    // Append export default React.memo(ComponentName)
    content += `\nexport default React.memo(${compName});\n`;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Memoized ${file}`);
  }
}
