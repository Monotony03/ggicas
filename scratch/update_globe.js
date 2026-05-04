const fs = require('fs');

const file = 'src/components/GlobeMap.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change map colors to tactical colors
content = content.replace(/fill="#020617"/g, 'fill="#0f1115"');
content = content.replace(/stroke="#1e293b"/g, 'stroke="#4b5320"');
content = content.replace(/stroke="#0f172a"/g, 'stroke="#4b5320"');
content = content.replace(/fill={isSelected \? "#312e81" : "#0f172a"}/g, 'fill={isSelected ? "#4b5320" : "#1a1f22"}');
content = content.replace(/stroke="#334155"/g, 'stroke="#4b5320"');
content = content.replace(/hover:\s*{\s*fill: isSelected \? "#3730a3" : "#1e293b"/g, 'hover:   { fill: isSelected ? "#5f6b28" : "#2a3136"');

// Change SVG marker definitions
content = content.replace(/fill="#10b981"/g, 'fill="#00ff41"');
content = content.replace(/fill="#ef4444"/g, 'fill="#ffb000"');

// Change Line colors
content = content.replace(/stroke="#10b981"/g, 'stroke="#00ff41"');
content = content.replace(/rgba\(16,185,129,0\.9\)/g, 'rgba(0,255,65,0.9)');
content = content.replace(/stroke="#ef4444"/g, 'stroke="#ffb000"');
content = content.replace(/rgba\(239,68,68,1\)/g, 'rgba(255,176,0,1)');

// Change country dot colors
content = content.replace(/"#818cf8"/g, '"#00ff41"');
content = content.replace(/"#34d399"/g, '"#4b5320"');
content = content.replace(/"#f87171"/g, '"#ffb000"');
content = content.replace(/"#4f46e5"/g, '"#1a1f22"');

// Change country text styles
content = content.replace(/"#c7d2fe"/g, '"#00ff41"');
content = content.replace(/"#6ee7b7"/g, '"#a3b83b"');
content = content.replace(/"#fca5a5"/g, '"#ffb000"');

// Tailwind container classes for Globe
content = content.replace(/bg-gradient-to-b from-slate-900 to-black/g, 'bg-tactical-bg border-tactical-primary');
content = content.replace(/shadow-\[0_0_120px_rgba\(79,70,229,0\.2\)\]/g, 'shadow-[0_0_120px_rgba(0,255,65,0.15)]');

fs.writeFileSync(file, content);
console.log('GlobeMap updated');
