const fs = require('fs');
const { execSync } = require('child_process');

const watchDir = '/home/ubuntu/asafeclaw-brain';
let debounce = null;

console.log('Starting AsafeClaw Brain Auto-Sync...');

try { execSync('git pull origin main', { cwd: watchDir }); } catch(e) {}

fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
  if (filename && (filename.startsWith('.git') || filename === 'sync.js')) return;
  
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    try {
      console.log('Changes detected. Syncing to GitHub...');
      execSync('git add . && git commit -m "🧠 AsafeClaw Auto-Sync" && git push origin main', { cwd: watchDir, stdio: 'pipe' });
      console.log('Pushed successfully to GitHub.');
    } catch (e) {
      // Ignore if nothing to commit
    }
  }, 3000);
});

setInterval(() => {
  try {
    execSync('git pull origin main', { cwd: watchDir, stdio: 'pipe' });
  } catch (e) {
    // ignore
  }
}, 60000);
