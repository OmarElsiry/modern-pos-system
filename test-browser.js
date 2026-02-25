const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright browser test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📝';
    console.log(`${icon} [${type}] ${text}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
    console.log('Stack:', error.stack);
  });
  
  // Listen to failed requests
  page.on('requestfailed', request => {
    console.log('❌ Request Failed:', request.url());
    console.log('   Failure:', request.failure().errorText);
  });
  
  console.log('📍 Navigating to http://localhost:5173...\n');
  
  try {
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('\n✅ Page loaded successfully!\n');
    
    // Check if root element exists
    const rootExists = await page.locator('#root').count();
    console.log('📦 Root element exists:', rootExists > 0);
    
    // Check root content
    const rootContent = await page.locator('#root').innerHTML();
    console.log('📦 Root content length:', rootContent.length, 'characters');
    if (rootContent.length > 0) {
      console.log('📦 Root content preview:', rootContent.substring(0, 200));
    } else {
      console.log('⚠️  Root element is EMPTY!');
    }
    
    // Check if React rendered
    const bodyText = await page.locator('body').textContent();
    console.log('\n📄 Body text content:', bodyText.substring(0, 200));
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to screenshot.png');
    
    // Wait a bit to see what happens
    console.log('\n⏳ Waiting 5 seconds to observe any delayed rendering...');
    await page.waitForTimeout(5000);
    
    // Check again
    const rootContentAfter = await page.locator('#root').innerHTML();
    console.log('📦 Root content after 5s:', rootContentAfter.length, 'characters');
    
    if (rootContentAfter.length === 0) {
      console.log('\n❌ PROBLEM: React is NOT rendering!');
      console.log('   The root element remains empty after 5 seconds.');
      console.log('   This suggests JavaScript is not executing or failing silently.');
    } else {
      console.log('\n✅ React rendered successfully!');
    }
    
  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
  }
  
  console.log('\n🔍 Test complete. Browser will stay open for 10 seconds for inspection...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('\n✅ Browser closed.');
})();
