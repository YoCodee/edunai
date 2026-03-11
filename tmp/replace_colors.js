const fs = require('fs');

const files = [
  'd:/coding/Project_2026/edunai/app/dashboard/schedule/page.tsx',
  'd:/coding/Project_2026/edunai/app/dashboard/settings/page.tsx',
  'd:/coding/Project_2026/edunai/app/dashboard/study-group/page.tsx',
  'd:/coding/Project_2026/edunai/app/dashboard/boards/[id]/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace literal HEX with CSS variable wrapper
  // But wait, in tailwind classes like `ring-[#fca03e]`, replacing with `var(--dash-primary)` might result in `ring-[var(--dash-primary)]`
  // Actually, replacing `#fca03e` to `var(--dash-primary)` inside a style tag works. Inside tailwind `bg-[#fca03e]` -> `bg-dash-primary`.
  
  // 1. Tailwind arbitrary values: bg-[#fca03e] -> bg-dash-primary, text-[#fca03e] -> text-dash-primary, etc.
  content = content.replace(/([a-z-]+)-\[#fca03e\](\/[0-9]+)?/g, (match, prefix, opacity) => {
    return `${prefix}-dash-primary${opacity || ''}`;
  });

  // 2. Gradient arbitrary values: from-[#fca03e] -> from-dash-primary
  content = content.replace(/from-\[#fca03e\](\/[0-9]+)?/g, (match, opacity) => {
    return `from-dash-primary${opacity || ''}`;
  });
  content = content.replace(/to-\[#fca03e\](\/[0-9]+)?/g, (match, opacity) => {
    return `to-dash-primary${opacity || ''}`;
  });

  // 3. Raw hex code #fca03e mostly in style={{color: '#fca03e'}} -> style={{color: 'var(--dash-primary)'}}
  content = content.replace(/#fca03e/g, 'var(--dash-primary)');

  // 4. Tailwind orange utilities: text-orange-400 -> text-brand-400, bg-orange-50 -> bg-brand-50
  content = content.replace(/([a-z]+)-orange-([0-9]+)/g, (match, prefix, weight) => {
    return `${prefix}-brand-${weight}`;
  });

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Colors replaced successfully!');
