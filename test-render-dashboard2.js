import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  try {
    let content = fs.readFileSync('src/pages/AdminDashboard.tsx.bak', 'utf-8');
    // Remove the auth useEffect completely
    content = content.replace(/useEffect\(\(\) => \{\n\s*const unsubscribe = auth\.onAuthStateChanged[\s\S]*?\}, \[navigate\]\);/, '');
    
    // Set user to admin
    content = content.replace('const [user, setUser] = useState<User | null>(null);', 'const [user, setUser] = useState({ id: "1", role: "admin", email: "admin@test.com" });');
    content = content.replace('if (!user) return null;', '');
    
    fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
    
    await new Promise(r => setTimeout(r, 2000));

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("HTML LENGTH:", html.length);
    
    await browser.close();
    
    fs.copyFileSync('src/pages/AdminDashboard.tsx.bak', 'src/pages/AdminDashboard.tsx');
  } catch(e) {
    console.error(e);
  }
})();
