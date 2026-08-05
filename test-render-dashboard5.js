import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  try {
    fs.copyFileSync('src/pages/AdminDashboard.tsx', 'src/pages/AdminDashboard.tsx.bak');
    
    let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');
    content = content.replace(/navigate/g, 'console.log');
    content = content.replace('const [user, setUser] = useState<User | null>(null);', 'const [user, setUser] = useState({ id: "1", role: "admin", email: "admin@test.com" });');
    content = content.replace('if (!user) return null;', '');
    
    fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
    
    await new Promise(r => setTimeout(r, 2000));

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    
    console.log("FINAL URL:", page.url());
    
    await browser.close();
    
    fs.copyFileSync('src/pages/AdminDashboard.tsx.bak', 'src/pages/AdminDashboard.tsx');
  } catch(e) {
    console.error(e);
  }
})();
