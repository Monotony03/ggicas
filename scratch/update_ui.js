const fs = require('fs');

const files = [
  'src/app/admin/page.tsx',
  'src/app/analytics/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/bg-indigo-600/g, 'bg-tactical-primary text-slate-100 border border-tactical-accent/30 hover:border-tactical-accent shadow-[0_0_10px_rgba(0,255,65,0.1)]');
  content = content.replace(/hover:bg-indigo-500/g, 'hover:bg-tactical-primary/80');
  content = content.replace(/focus:border-indigo-500/g, 'focus:border-tactical-accent');
  content = content.replace(/focus:ring-indigo-500\/50/g, 'focus:ring-tactical-accent/50');
  content = content.replace(/text-indigo-400/g, 'text-tactical-accent drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]');
  content = content.replace(/text-indigo-500/g, 'text-tactical-accent');
  content = content.replace(/border-indigo-500/g, 'border-tactical-accent');
  content = content.replace(/bg-indigo-500\/20/g, 'bg-tactical-accent/10');
  content = content.replace(/text-indigo-300/g, 'text-tactical-accent');
  content = content.replace(/bg-slate-900/g, 'bg-tactical-panel');
  content = content.replace(/bg-slate-800/g, 'bg-tactical-panel border-tactical-primary/50');
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
