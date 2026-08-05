import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  try {
    // Backup AdminDashboard
    fs.copyFileSync('src/pages/AdminDashboard.tsx', 'src/pages/AdminDashboard.tsx.bak');
    
    // Modify AdminDashboard to bypass auth and render immediately
    let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');
    content = content.replace('if (!user) return null;', 'if (false) return null;');
    content = content.replace('const [user, setUser] = useState<User | null>(null);', 'const [user, setUser] = useState({ id: "1", role: "admin", email: "admin@test.com" });');
    
    fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
    
    // Wait for vite to recompile
    await new Promise(r => setTimeout(r, 2000));

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("HTML LENGTH:", html.length);
    
    await browser.close();
    
    // Restore AdminDashboard
    fs.copyFileSync('src/pages/AdminDashboard.tsx.bak', 'src/pages/AdminDashboard.tsx');
  } catch(e) {
    console.error(e);
  }
})();
