/** End-to-end checks against a disposable Chrome profile and a local preview.
 * This script clears ASTRA check-ins in that test profile. See docs/TESTING.md.
 */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.ASTRA_TEST_URL ?? 'http://127.0.0.1:5180';
const debug = process.env.ASTRA_CDP_URL ?? 'http://127.0.0.1:9233';
let targets;
for (let attempt = 0; attempt < 40 && !targets; attempt++) {
  try { targets = await (await fetch(debug + '/json/list')).json(); }
  catch { await new Promise(resolve => setTimeout(resolve, 100)); }
}
assert.ok(targets, 'Chrome debugging endpoint did not become ready.');
const target = targets.find(item => item.type === 'page' && item.url.startsWith(base));
assert.ok(target, 'Start the isolated browser on the local ASTRA preview first.');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let serial = 0;
const pending = new Map(), listeners = new Map();
const exceptions = [], warnings = [], completed = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) warnings.push(message.params.args.map(arg => arg.value ?? arg.description).join(' '));
  if (message.method && listeners.has(message.method)) { const resolve = listeners.get(message.method); listeners.delete(message.method); resolve(message.params); }
  if (!pending.has(message.id)) return;
  const { resolve, reject, timer } = pending.get(message.id); clearTimeout(timer); pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('Timed out: ' + method)); }, 20000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const value = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (value.exceptionDetails) throw new Error(value.exceptionDetails.exception?.description ?? value.exceptionDetails.text);
  return value.result.value;
}
const settle = () => evaluate('new Promise(resolve => setTimeout(resolve, 120))');
async function ready() {
  await evaluate(`new Promise(resolve => { const ready = () => document.querySelector('h1') && document.querySelector('.theme-toggle') ? resolve(true) : setTimeout(ready, 50); ready(); })`);
  await evaluate('document.fonts.ready.then(() => true)'); await settle();
}
async function navigate(route) {
  await evaluate(`document.querySelector('nav a[href="#${route}"]').click()`); await settle();
  assert.equal(await evaluate('location.hash'), '#' + route);
}
async function clickText(text, selector = 'button') {
  const clicked = await evaluate(`(() => { const button = [...document.querySelectorAll(${JSON.stringify(selector)})].find(item => item.textContent.trim() === ${JSON.stringify(text)}); if (!button) return false; button.click(); return true; })()`);
  assert.ok(clicked, 'Control not found: ' + text); await settle();
}
async function setValue(selector, value) {
  await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing input'); const prototype = element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); })()`);
  await settle();
}
const records = () => evaluate("JSON.parse(localStorage.getItem('astra.check-ins.v1') || 'null')");
async function reload() {
  const loaded = new Promise(resolve => listeners.set('Page.loadEventFired', resolve));
  await send('Page.reload'); await loaded; await ready();
}
const report = name => { completed.push(name); console.log('PASS ' + name); };
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Page.bringToFront'); await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
await ready();
await navigate('dashboard');
await evaluate("localStorage.removeItem('astra.check-ins.v1'); localStorage.setItem('astra.theme', 'light')");
await reload();
assert.match(await evaluate("document.querySelector('[role=status]').textContent"), /Simulated.*14 check-ins/);
assert.ok(await evaluate("document.querySelector('.recharts-wrapper') !== null"));
assert.equal(await evaluate("document.querySelectorAll('.status-counts > div').length"), 4);
report('simulated seed, real chart and baseline status summary');

await evaluate("document.querySelector('.body-hotspot[aria-label=\"Select Chest region\"]').click()"); await settle();
assert.match(await evaluate("document.querySelector('#region-title').textContent"), /Chest/);
await clickText('Front model');
assert.ok(await evaluate("document.querySelector('.body-svg svg') !== null"));
await evaluate("document.querySelector('.body-svg [id=\"chest-left\"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))"); await settle();
await clickText('Back model');
await evaluate("document.querySelector('.body-svg [id=\"lower-back-left\"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))"); await settle();
assert.match(await evaluate("document.querySelector('#region-title').textContent"), /Lower back/);
await evaluate("document.querySelector('.region-button[aria-label^=\"Select Arms region\"]').focus()");
assert.match(await evaluate('document.activeElement.getAttribute("aria-label")'), /^Select Arms region/);
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }); await settle();
assert.match(await evaluate("document.querySelector('#region-title').textContent"), /Arms/);
await evaluate("document.querySelector('.whole-body-button').click()"); await settle();
assert.match(await evaluate("document.querySelector('.radiation-panel').textContent"), /Needs dosimeter, cannot be self-assessed/);
await evaluate("document.querySelector('.region-metric > summary').click()"); await settle();
assert.ok(await evaluate("document.querySelector('.region-metric-content .recharts-wrapper') !== null"));
report('anatomy hotspot, actual front/back SVG clicks, keyboard regions, region chart and radiation limits');

await setValue('#dashboard-indicator', 'glucoseMgDl');
await evaluate("document.querySelector('.overview-analysis .trend-card details > summary').click()"); await settle();
assert.match(await evaluate("document.querySelector('.overview-analysis .trend-card table').textContent"), /Not recorded/);
assert.match(await evaluate("document.querySelector('.overview-analysis .trend-card').textContent"), /Not assessed/);
report('missing optional readings stay gaps with an accessible dated table');

await navigate('check-in');
await setValue('input[name=date]', '2026-11-01');
await evaluate("document.querySelector('form button[type=submit]').click()"); await settle();
assert.ok(await evaluate("document.querySelectorAll('.field-error').length >= 8"));
assert.equal(await records(), null);
const daily = { sleepHours: '7.8', sleepQuality: '4', fatigue: '2', mood: '4', stress: '2', teamCohesion: '4', dizziness: '0', visionSymptoms: '0' };
for (const [name, value] of Object.entries(daily)) await setValue(`${name === 'sleepHours' ? 'input' : 'select'}[name=${name}]`, value);
await evaluate("document.querySelector('.metric-help > summary').click()"); await settle();
assert.ok(await evaluate("document.querySelector('.metric-help[open] .help-content ol li') !== null"));
await evaluate("document.querySelector('form button[type=submit]').click()"); await settle();
let stored = await records();
assert.equal(stored.entries.length, 15);
let entry = stored.entries.find(item => item.date === '2026-11-01');
assert.equal(entry.sleepHours, 7.8); assert.equal(entry.simulated, false); assert.equal(entry.vitals, undefined);
await setValue('input[name=sleepHours]', '6.1');
await evaluate("document.querySelector('form button[type=submit]').click()"); await settle();
stored = await records(); assert.equal(stored.entries.length, 15); assert.equal(stored.entries.find(item => item.date === '2026-11-01').sleepHours, 6.1);
report('required validation, measurement help, optional blanks, observed provenance and same-date upsert');

await setValue('input[name=date]', '2026-11-15');
assert.equal(await evaluate("document.querySelector('select[name=provenance]').value"), 'simulated');
await setValue('input[name=sleepHours]', '3.9');
await evaluate("[...document.querySelectorAll('.form-disclosure > summary')].find(item => item.textContent.includes('Optional device')).click()"); await settle();
await setValue('input[name=temperatureC]', '36.8'); await setValue('input[name=glucoseMgDl]', '97');
await setValue('input[name=spo2]', '101');
await evaluate("document.querySelector('form button[type=submit]').click()"); await settle();
assert.ok(await evaluate("document.querySelector('input[name=spo2]').getAttribute('aria-invalid') === 'true'"));
await setValue('input[name=spo2]', '98');
await evaluate("document.querySelector('form button[type=submit]').click()"); await settle();
stored = await records(); entry = stored.entries.find(item => item.date === '2026-11-15');
assert.equal(entry.simulated, true); assert.equal(entry.vitals.temperatureC, 36.8); assert.equal(entry.vitals.glucoseMgDl, 97);
await navigate('dashboard'); await setValue('#dashboard-indicator', 'sleepHours');
assert.equal(await evaluate("document.querySelector('.overview-analysis .trend-current strong').textContent"), '3.9');
report('optional temperature/glucose, invalid percentage feedback, simulated provenance and live dashboard update');

await navigate('check-in'); await setValue('input[name=sleepHours]', '4.2');
await evaluate("window.astraTestSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function() { throw new DOMException('Test quota', 'QuotaExceededError'); }; document.querySelector('form button[type=submit]').click()"); await settle();
assert.match(await evaluate("document.querySelector('.form-error-summary').textContent"), /Could not save/);
assert.equal((await records()).entries.find(item => item.date === '2026-11-15').sleepHours, 3.9);
await evaluate('Storage.prototype.setItem = window.astraTestSetItem; delete window.astraTestSetItem');
report('quota errors are visible and do not overwrite existing records');

await setValue('select[aria-label=Environment]', 'moonBase');
assert.match(await evaluate("document.querySelector('main').textContent"), /Check-in is configured for ISS/);
assert.match(await evaluate("document.querySelector('.reminder-card').textContent"), /No measurement schedule configured/);
assert.equal((await records()).entries.length, 15);
await navigate('emergency');
assert.match(await evaluate("document.querySelector('.escalation-notice').textContent"), /base procedure/);
await setValue('select[aria-label=Environment]', 'iss');
report('conceptual environment blocks unconfigured entry, preserves history and adapts escalation');

const verifyStep = async title => {
  assert.equal(await evaluate("document.querySelector('.emergency-step h3').textContent"), title);
  assert.ok(await evaluate("document.querySelector('.emergency-step a').href.startsWith('https://')"));
};
await verifyStep('Chest pain or collapse: call for help');
await clickText('Open the assessment checklist'); await verifyStep('Responsiveness assessment');
await clickText('Unresponsive or unsure'); await verifyStep('Breathing and cardiac-arrest assessment');
await clickText('Checklist directs CPR'); await verifyStep('Follow trained microgravity CPR procedure');
await clickText('Continue mission CPR procedure and AED guidance'); await verifyStep('Use the mission AED procedure');
await clickText('Continue checklist care'); await verifyStep('Continue mission medical care');
assert.match(await evaluate("document.querySelector('.care-handoff').textContent"), /not an all-clear/);
await clickText('← Back'); await verifyStep('Use the mission AED procedure');
await clickText('Restart flow'); await clickText('Open the assessment checklist'); await clickText('Responsive'); await verifyStep('Continue mission medical care');
await clickText('Restart flow'); await clickText('Open the assessment checklist'); await clickText('Unresponsive or unsure'); await clickText('Unsure — use crew medical officer/checklist'); await verifyStep('Continue mission medical care');
await clickText('Restart flow'); await clickText('Open the assessment checklist'); await clickText('Unresponsive or unsure'); await clickText('Checklist directs other care'); await verifyStep('Continue mission medical care');
await clickText('Exit to overview'); assert.equal(await evaluate('location.hash'), '#dashboard');
report('every emergency branch, source, back/restart/exit and continuing-care handoff');

await navigate('about');
assert.equal(await evaluate("document.querySelectorAll('.source-item').length"), 14);
assert.equal(await evaluate("document.querySelectorAll('.indicator-reference > article').length"), 21);
assert.match(await evaluate("document.querySelector('.licence-notice').textContent"), /Copyright \(c\) 2022 ELABBASSI Hicham/);
assert.match(await evaluate("document.querySelector('main').textContent"), /No OSDR data was imported/);
report('all source/indicator entries, OSDR limits and original MIT notice');

await navigate('check-in');
await evaluate("document.querySelector('.data-controls > summary').click()"); await clickText('Clear all ASTRA records…'); await clickText('Confirm clear all records');
assert.deepEqual((await records()).entries, []);
await reload(); assert.deepEqual((await records()).entries, []);
await navigate('dashboard');
assert.match(await evaluate("document.querySelector('.snapshot-card').textContent"), /Start with a check-in/);
assert.match(await evaluate("document.querySelector('.reminder-card').textContent"), /Your first check-in is ready/);
report('explicit reset stays empty after reload; empty dashboard and reminders are honest');

await evaluate("localStorage.setItem('astra.check-ins.v1', '{broken')"); await reload();
assert.match(await evaluate("document.querySelector('.error-notice').textContent"), /Storage unavailable/);
assert.equal(await evaluate("localStorage.getItem('astra.check-ins.v1')"), '{broken');
await navigate('emergency'); await clickText('Open the assessment checklist');
await navigate('check-in'); await evaluate("document.querySelector('.data-controls > summary').click()"); await clickText('Clear all ASTRA records…'); await clickText('Confirm clear all records');
assert.deepEqual((await records()).entries, []);
report('corrupt records are preserved, Emergency still opens, explicit reset recovers');

await evaluate("localStorage.removeItem('astra.check-ins.v1')"); await navigate('dashboard'); await reload();
await mkdir('tmp/ui-review', { recursive: true });
const layouts = [];
for (const theme of ['light', 'dark']) {
  if (await evaluate('document.documentElement.dataset.theme') !== theme) { await evaluate("document.querySelector('.theme-toggle').click()"); await settle(); }
  for (const width of [1440, 1024, 768, 390, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width < 700 }); await settle();
    const metrics = await evaluate(`(() => {
      const nav = document.querySelector('nav');
      const reachable = [...nav.querySelectorAll('a')].every(link => { link.focus(); const a = link.getBoundingClientRect(), b = nav.getBoundingClientRect(); return a.left >= b.left && a.right <= b.right + 1; });
      document.activeElement?.blur(); nav.scrollLeft = 0; scrollTo(0, 0);
      const visible = selector => { const b = document.querySelector(selector).getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && b.width >= 44 && b.height >= 44; };
      return { theme: document.documentElement.dataset.theme, width: innerWidth, documentWidth: document.documentElement.scrollWidth, reachable, themeVisible: visible('.theme-toggle'), emergencyVisible: visible('.emergency-button'), chartCount: document.querySelectorAll('.recharts-wrapper').length };
    })()`);
    assert.ok(metrics.documentWidth <= width && metrics.reachable && metrics.themeVisible && metrics.emergencyVisible, JSON.stringify(metrics));
    layouts.push(metrics);
    if ([1440, 390].includes(width)) { const shot = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(`tmp/ui-review/complete-${theme}-${width}.png`, Buffer.from(shot.data, 'base64')); }
    await navigate('check-in');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Check-in overflow');
    await navigate('about');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'About overflow');
    await navigate('emergency');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Emergency overflow');
    await navigate('dashboard');
  }
}
await reload(); assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
report('both themes, saved preference and all-page responsive layout at five widths');

await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
await navigate('emergency'); await clickText('Open the assessment checklist'); await verifyStep('Responsiveness assessment');
await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
report('already-loaded app reaches the emergency flow without a network connection');
assert.deepEqual(exceptions, [], 'Browser runtime exceptions');
const result = { completed, layouts, exceptions, warnings };
await writeFile('tmp/ui-review/browser-results.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
socket.close();
