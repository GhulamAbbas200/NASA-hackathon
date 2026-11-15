/** Run only in a disposable Chrome profile: this check creates local crew profiles.
 * See docs/TESTING.md for the preview and remote-debugging setup.
 */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.ASTRA_TEST_URL ?? 'http://127.0.0.1:5183';
const debug = process.env.ASTRA_CDP_URL ?? 'http://127.0.0.1:9236';
const targets = await (await fetch(debug + '/json/list')).json();
const target = targets.find(item => item.type === 'page' && item.url.startsWith(base));
assert.ok(target, 'Open the preview in an isolated Chrome profile first.');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let serial = 0;
const pending = new Map(), exceptions = [], completed = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Fetch.requestPaused') {
    void send('Fetch.failRequest', { requestId: message.params.requestId, errorReason: 'Failed' });
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id); clearTimeout(request.timer);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('Timed out: ' + method)); }, 20000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
const settle = () => evaluate('new Promise(resolve => setTimeout(resolve, 150))');
async function waitFor(expression) {
  for (let attempt = 0; attempt < 80; attempt++) { if (await evaluate(expression)) return; await settle(); }
  throw new Error('Condition not reached: ' + expression);
}
async function reload() {
  await send('Page.navigate', { url: base + '/#home' });
  await refreshHome();
}
async function refreshHome() {
  await evaluate('window.astraLandingReloadMarker=true');
  await send('Page.reload');
  await waitFor('!window.astraLandingReloadMarker && document.readyState === "complete" && !!document.querySelector(".landing-access-card")');
  await settle();
}
async function click(text) {
  assert.ok(await evaluate(`(() => { const item = [...document.querySelectorAll('button, a')].find(el => el.textContent.trim() === ${JSON.stringify(text)}); if(!item) return false; item.click(); return true; })()`), 'Missing control: ' + text);
  await settle();
}
async function setValue(selector, value) {
  await evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw Error('Missing field'); const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true})); })()`);
  await settle();
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile('tmp/ui-review/' + name + '.png', Buffer.from(result.data, 'base64'));
}
const report = name => { completed.push(name); console.log('PASS ' + name); };
await mkdir('tmp/ui-review', { recursive: true });
try {
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Page.bringToFront'); await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate("localStorage.removeItem('astra.auth.users.v1'); localStorage.removeItem('astra.auth.current_user.v1'); localStorage.setItem('astra.theme','light')");
  await reload();
  await waitFor('document.querySelector("video").readyState >= 2 && !document.querySelector("video").paused');
  const media = await evaluate('(()=>{const v=document.querySelector("video");return {duration:v.duration,muted:v.muted,loop:v.loop,inline:v.playsInline}})()');
  assert.ok(media.duration > 0 && media.muted && media.loop && media.inline);
  const poster = await fetch(base + '/assets/landing-poster.jpg'); assert.ok(poster.ok);
  await screenshot('landing-light-1440');
  report('real video decodes, muted looping inline playback, and served poster fallback');

  await click('Pause video');
  assert.ok(await evaluate('document.querySelector("video").paused'));
  await click('Play video'); await waitFor('!document.querySelector("video").paused');
  report('pause and resume controls');

  assert.match(await evaluate('document.querySelector(".auth-panel").textContent'), /First time on board/);
  await click('Create Profile Now');
  await setValue('#reg-name', 'Landing Test Crew'); await setValue('#reg-callsign', 'ORBIT-01'); await setValue('#reg-pin', '1234');
  await click('Create Astronaut Profile');
  assert.ok(await evaluate('!!document.querySelector(".auth-success-banner")'));
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("astra.auth.users.v1")).length'), 1);
  await setValue('#login-pin', '9999'); await click('Log In to Profile');
  assert.match(await evaluate('document.querySelector(".form-error-summary").textContent'), /Incorrect PIN/);
  await setValue('#login-pin', '1234'); await click('Log In to Profile');
  await waitFor('location.hash === "#dashboard" && !!document.querySelector(".workspace-shell")');
  assert.equal(await evaluate('document.querySelector(".landing-page")'), null);
  report('new profile, signup confirmation, incorrect PIN, and successful dashboard handoff');

  await evaluate('location.hash="home"'); await waitFor('!!document.querySelector(".landing-returning")');
  await click('Start daily check-in');
  await waitFor('location.hash === "#check-in"');
  await evaluate('location.hash="home"'); await waitFor('!!document.querySelector(".landing-returning")');
  await click('Switch crew profile'); await waitFor('!!document.querySelector("#astronaut-select")');
  assert.equal(await evaluate('localStorage.getItem("astra.auth.current_user.v1")'), null);
  await refreshHome(); await waitFor('!!document.querySelector("#astronaut-select")');
  report('returning crew actions, sign-out, and saved-profile persistence across reload');

  await evaluate('document.querySelector(".theme-toggle").click()'); await settle();
  const savedTheme = await evaluate('document.documentElement.dataset.theme');
  assert.equal(await evaluate('localStorage.getItem("astra.theme")'), savedTheme);
  await refreshHome();
  assert.equal(await evaluate('document.documentElement.dataset.theme'), savedTheme);
  report('theme button updates the page and persists across reload');

  const layouts = [];
  for (const theme of ['light', 'dark']) {
    await evaluate(`localStorage.setItem('astra.theme',${JSON.stringify(theme)})`);
    await refreshHome();
    for (const width of [1440, 1024, 768, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 760 });
      await settle();
      const result = await evaluate(`(()=>{const q=s=>document.querySelector(s), size=s=>parseFloat(getComputedStyle(q(s)).fontSize);return {overflow:document.documentElement.scrollWidth>innerWidth,body:size('.landing-description'),heading:size('#auth-title'),control:size('.auth-form button[type=submit]'),input:size('#login-pin'),title:size('#landing-title'),cardWidth:q('.landing-access-card').getBoundingClientRect().width}})()`);
      assert.equal(result.overflow, false, JSON.stringify({theme,width,result}));
      assert.equal(result.body, 18); assert.equal(result.heading, 22); assert.equal(result.control, 17); assert.equal(result.input, 18);
      assert.ok(result.title >= 30 && result.title <= 40);
      layouts.push({ theme, width, ...result });
      if (width === 1440 || width === 390) await screenshot(`landing-${theme}-${width}`);
    }
  }
  await click('Sign Up');
  assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false);
  await screenshot('landing-signup-320');
  report('light/dark layouts at five widths, mobile signup, and exact requested typography');

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await refreshHome();
  assert.ok(await evaluate('document.querySelector("video").paused'));
  assert.equal(await evaluate('document.querySelector("video").getAttribute("src")'), null);
  await click('Play video'); await waitFor('document.querySelector("video").readyState>=2 && !document.querySelector("video").paused');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await settle();
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await waitFor('document.querySelector("video").paused');
  report('reduced motion skips video loading, allows explicit play, and responds to preference changes');

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  // Intercept media only: Vite also serves a JavaScript module for the MP4 import.
  await send('Fetch.enable', { patterns: [{ urlPattern: '*landing-video*', resourceType: 'Media', requestStage: 'Request' }] });
  await refreshHome(); await waitFor('document.querySelector(".landing-motion-control")?.disabled');
  assert.match(await evaluate('document.querySelector(".landing-motion-control").textContent'), /Still view/);
  assert.ok(await evaluate('!!document.querySelector("#astronaut-select")'));
  report('video load failure leaves a still background and usable login');

  await send('Fetch.disable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate('location.hash="about"'); await waitFor('!!document.querySelector(".topbar")');
  await click('Log In'); await waitFor('!!document.querySelector("[role=dialog]")');
  const focusedInside = await evaluate('document.querySelector("[role=dialog]").contains(document.activeElement)');
  assert.ok(focusedInside);
  await evaluate('(()=>{const items=document.querySelector("[role=dialog]").querySelectorAll("button, input, select, a[href]");items[items.length-1].focus()})()');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.ok(await evaluate('document.activeElement === document.querySelector("[role=dialog] button")'));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await settle(); assert.equal(await evaluate('document.querySelector("[role=dialog]")'), null);
  await click('Log In'); await setValue('#login-pin', '1234'); await click('Log In to Profile');
  await waitFor('location.hash === "#dashboard" && !!document.querySelector(".workspace-shell")');
  report('public About navigation and shared modal login/Escape behavior');
  assert.deepEqual(exceptions, []);
  await writeFile('tmp/ui-review/landing-results.json', JSON.stringify({ completed, media, layouts, exceptions }, null, 2));
  console.log('All landing checks passed.');
} finally {
  await send('Fetch.disable').catch(() => {});
  socket.close();
}
