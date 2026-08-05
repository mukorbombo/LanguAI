import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signUpBtn = btns.find(b => b.textContent.includes('Sign up'));
      if (signUpBtn) signUpBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    await page.type('input[type="email"]', 'admin_test3@test.com');
    await page.type('input[type="password"]', 'password123');
    
    const select = await page.$('select');
    if (select) {
      await select.select('admin');
    }
    
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => b.textContent.includes('Sign Up') || b.textContent.includes('Create Account') || b.textContent.includes('Sign up'));
      if (submitBtn) submitBtn.click();
    });
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(e => console.log("Navigation timeout"));
    await new Promise(r => setTimeout(r, 2000));
    
    const html = await page.evaluate(() => document.body.innerHTML);
    if (html.includes("React Rendering Error")) {
      const errorText = await page.evaluate(() => document.querySelector('pre').innerText);
      console.log("REACT ERROR IS:", errorText);
    } else {
      console.log("No error found! HTML length:", html.length);
    }
    
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
