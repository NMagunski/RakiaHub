import {chromium} from '@playwright/test';
await fetch('http://127.0.0.1:54321/__reset',{method:'POST'});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});
await page.goto('http://localhost:3100/login');
await page.locator('input[type=email]').fill('qa@example.test');
await page.locator('input[type=password]').fill('test-password');
await page.locator('button[type=submit]').click();
await page.waitForURL('**/feed',{timeout:30000});
console.log('PASS: local fixture login');
for (const theme of ['amber','atlas']) {
 await page.goto('http://localhost:3100/profile');
 await page.getByRole('button',{name:'Настройки',exact:true}).click();
 await page.getByRole('button',{name:theme==='amber'?/Amber Club/:/Balkan Atlas/}).click();
 await page.waitForTimeout(400);
 await page.screenshot({path:`outputs/verification/${theme}-settings-mobile.png`,fullPage:true});
 for(const route of ['discover','feed','passport','wishlist', 'rakija/10000000-0000-4000-8000-000000000001']) {
  await page.goto('http://localhost:3100/'+route);
  await page.waitForTimeout(1000);
  await page.screenshot({path:`outputs/verification/${theme}-${route.split('/')[0]}-mobile.png`,fullPage:true});
 }
 await page.getByRole('button',{name:'Оцени тази ракия'}).click();
 await page.getByRole('dialog').waitFor();
 await page.screenshot({path:`outputs/verification/${theme}-tasting-mobile.png`,fullPage:true});
 await page.keyboard.press('Tab');
 if(!await page.getByRole('dialog').evaluate(el=>el.contains(document.activeElement)))throw new Error('Dialog focus escaped');
 await page.keyboard.press('Escape');
 if(await page.getByRole('dialog').count())throw new Error('Escape failed');
 await page.setViewportSize({width:1440,height:1000});
 for (const route of ['discover','passport']) {
  await page.goto('http://localhost:3100/'+route);await page.waitForTimeout(700);
  await page.screenshot({path:`outputs/verification/${theme}-${route}-desktop.png`,fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
}
await page.goto('http://localhost:3100/rakija/10000000-0000-4000-8000-000000000001');
await page.getByRole('button',{name:'Оцени тази ракия'}).click();
const [saved]=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/ratings')&&r.request().method()==='POST'),page.getByRole('dialog').getByRole('button',{name:'Запази',exact:true}).click()]);
if(!saved.ok())throw new Error('Tasting save failed');
const sent=saved.request().postDataJSON();if(!sent.request_id)throw new Error('Missing idempotency key');
await page.waitForURL('**/feed');
await page.goto('http://localhost:3100/passport');
await page.getByText('2 дегустации · история',{exact:true}).waitFor();
await page.getByRole('button',{name:'Списък',exact:true}).click();
await page.getByText('2 дегустации · история',{exact:true}).waitFor();
console.log('PASS: product → tasting → passport history and equivalent list');
await context.clearCookies();
for(const theme of ['amber','atlas']) {
 await page.goto('http://localhost:3100/login');
 await page.evaluate(t=>localStorage.setItem('rakiq-theme',t),theme);
 await page.reload();
 await page.screenshot({path:`outputs/verification/${theme}-login-mobile.png`,fullPage:true});
 await page.goto('http://localhost:3100/register');
 await page.screenshot({path:`outputs/verification/${theme}-register-mobile.png`,fullPage:true});
}
await page.goto('http://localhost:3100/u/qa');
if(!page.url().endsWith('/u/qa'))throw new Error('Public profile redirected');
await page.goto('http://localhost:3100/offline');
if(!page.url().endsWith('/offline'))throw new Error('Offline redirected');
const response=await page.request.get('http://localhost:3100/api/passport');
if(response.status()!==401||!response.headers()['content-type'].includes('application/json'))throw new Error('API guest contract');
console.log('PASS: guest profile, offline and API JSON contract');
if(errors.length)throw new Error(errors.join('\n'));
await browser.close();
