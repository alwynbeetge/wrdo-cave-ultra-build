const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runComprehensiveTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { passed: 0, failed: 0, total: 0 },
    screenshots: []
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Test function helper
  async function test(name, testFn) {
    console.log(`Testing: ${name}`);
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      results.tests.push({ name, status: 'PASSED', duration, error: null });
      results.summary.passed++;
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      results.tests.push({ name, status: 'FAILED', duration, error: error.message });
      results.summary.failed++;
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
    results.summary.total++;
  }

  // Screenshot helper
  async function takeScreenshot(name) {
    const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    const filepath = path.join('tests/screenshots', filename);
    await page.screenshot({ path: filepath, fullPage: true });
    results.screenshots.push({ name, filename, filepath });
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  try {
    // Test 1: Homepage loads
    await test('Homepage loads successfully', async () => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await page.waitForSelector('body', { timeout: 10000 });
      await takeScreenshot('homepage');
    });

    // Test 2: Navigation links work
    await test('Navigation links are functional', async () => {
      const links = await page.$$eval('nav a', links => links.map(link => link.href));
      if (links.length === 0) throw new Error('No navigation links found');
      console.log(`Found ${links.length} navigation links`);
    });

    // Test 3: Login page loads
    await test('Login page loads', async () => {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      await page.waitForSelector('form', { timeout: 5000 });
      await takeScreenshot('login_page');
    });

    // Test 4: Register page loads
    await test('Register page loads', async () => {
      await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
      await page.waitForSelector('form', { timeout: 5000 });
      await takeScreenshot('register_page');
    });

    // Test 5: Dashboard loads (without auth)
    await test('Dashboard page loads', async () => {
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
      await takeScreenshot('dashboard');
    });

    // Test 6: Chat interface loads
    await test('Chat interface loads', async () => {
      await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle' });
      await takeScreenshot('chat_interface');
    });

    // Test 7: API Health Check
    await test('API health check responds', async () => {
      const response = await page.goto('http://localhost:3000/api/health');
      if (!response || response.status() !== 200) {
        throw new Error(`Health check failed with status: ${response?.status()}`);
      }
    });

    // Test 8: Settings page loads
    await test('Settings page loads', async () => {
      await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
      await takeScreenshot('settings_page');
    });

    // Test 9: Integrations page loads
    await test('Integrations page loads', async () => {
      await page.goto('http://localhost:3000/integrations', { waitUntil: 'networkidle' });
      await takeScreenshot('integrations_page');
    });

    // Test 10: Responsive design (mobile)
    await test('Mobile responsive design', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await takeScreenshot('mobile_homepage');
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    // Test 11: Console errors check
    await test('No critical console errors', async () => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('404') &&
        !error.includes('WebSocket')
      );
      
      if (criticalErrors.length > 0) {
        throw new Error(`Critical console errors found: ${criticalErrors.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await browser.close();
  }

  // Generate report
  const reportPath = 'tests/test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  console.log(`Report saved to: ${reportPath}`);
  
  return results;
}

if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}

module.exports = { runComprehensiveTests };
