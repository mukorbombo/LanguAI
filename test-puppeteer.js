import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    
    // Check if body is empty or has content
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("HTML LENGTH:", html.length);
    
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
