# Local verification

## Automated contracts

At repository root:

```powershell
npm.cmd test
npm.cmd run build
```

The suite has 29 tests: indicator/rule/reminder coverage, emergency graph/source integrity, installed package slugs/rendering/callback, prior-seven baseline comparison and persistence, missing data, check-in parsing/scales/provenance/optional values, same-date save, reminders, storage corruption/quota/reset behavior, required signup PIN rejection without profile writes, and PIN login for newly registered profiles.

No medical rule values were changed. Form bounds represent input scales and formats, not clinical normal ranges.

## Browser end-to-end checks

`scripts/browser-check.mjs` uses Chrome's local DevTools endpoint, without an extra test package. **Use a disposable Chrome profile**: the checks create/edit/clear ASTRA records in that profile. They do not use the user's normal browser profile.

Terminal 1:

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5180 --strictPort
```

Terminal 2 (Chrome installed at the usual Windows path):

```powershell
$astraTestProfile = Join-Path $env:TEMP 'astra-local-browser-tests'
$astraTestArgs = @('--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9233', ('--user-data-dir="' + $astraTestProfile + '"'), 'http://127.0.0.1:5180/#dashboard')
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList $astraTestArgs -WindowStyle Hidden
node scripts/browser-check.mjs
```

Override `ASTRA_TEST_URL` and `ASTRA_CDP_URL` if using different local ports. The script waits briefly for Chrome startup. It writes screenshots and `browser-results.json` under ignored `tmp/ui-review/`.

The browser pass covers 13 groups:

1. Simulated seed, actual chart and baseline summary.
2. Anatomy hotspot, actual front/back SVG clicks, native keyboard region selection, region chart and radiation limits.
3. Optional missing-reading gaps with accessible dated tables.
4. Required validation, measurement help, optional blanks, observed provenance and same-date upsert.
5. Temperature/glucose entry, invalid percentage feedback, simulated provenance and immediate dashboard update.
6. Quota errors without overwriting saved records.
7. Conceptual environment restrictions, preserved history and adapted escalation.
8. Every emergency branch, source, back/restart/exit and continuing-care handoff.
9. All source/indicator entries, OSDR limits and the original MIT notice.
10. Explicit reset remains empty after reload; empty-state reminders/dashboard.
11. Corrupt records preserved; Emergency usable; explicit reset recovery.
12. Light/dark mode, preference persistence, keyboard navigation, visible theme/Emergency controls and no page overflow at 1440, 1024, 768, 390 and 320px across the views.
13. Already-loaded emergency flow works with browser networking disabled.

Also checked: no browser runtime exceptions or console errors/warnings in the completed pass. Desktop/mobile screenshots were visually inspected. Browser checks are not a complete manual accessibility audit, clinical validation, proof of current hardware availability, or proof of a fresh offline installation. There is no service worker.

Stop the preview with Ctrl+C when finished and close the isolated headless Chrome instance. Browser testing/deployment do not alter the normal user's stored records.

## Video landing checks after teammate authentication changes

`scripts/landing-check.mjs` exercises the current public landing and shared crew-profile flow. It **creates/removes profiles only in the disposable test browser**. The earlier 13-group harness above records the original complete-app validation and predates the teammate's authenticated routes/sidebar; it needs adaptation before it can run unchanged against those routes.

Start `npm.cmd run preview -- --host 127.0.0.1 --port 5183 --strictPort` after building (or use the same flags with `run dev` while developing). Launch an isolated Chrome instance, then run:

```powershell
$astraLandingProfile = Join-Path $env:TEMP 'astra-landing-browser-tests'
$astraLandingArgs = @('--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9236', ('--user-data-dir="' + $astraLandingProfile + '"'), 'http://127.0.0.1:5183/')
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList $astraLandingArgs -WindowStyle Hidden
node scripts/landing-check.mjs
```

The script checks actual video decoding/muted looping, pause/resume, the poster asset, first-profile registration, incorrect/correct PIN login, dashboard handoff, returning-crew actions, logout/persistence, theme persistence, five widths in both themes, exact requested fonts, mobile signup, reduced-motion loading/explicit-play/preference updates, blocked-video fallback and shared modal login/Escape/focus containment. It writes screenshots and `landing-results.json` under ignored `tmp/ui-review/`. URL/debug endpoint overrides use the same `ASTRA_TEST_URL` / `ASTRA_CDP_URL` variables.

Keep `landing-video.mp4` at the repository root: it is imported through Vite and emitted as a hashed media file in `dist/assets`. Keep the extracted still at `public/assets/landing-poster.jpg`. No remote video URL or additional package is required.

## Verification after merge into main

Landing implementation `c64fdff` was fast-forward merged into local `main` at Abbas's request. Fresh checks on the merged checkout passed: all 27 automated tests, TypeScript/Vite production build, and all nine landing browser groups against the production preview under the browser's normal autoplay policy.

An additional disposable-profile merge smoke check passed six workspace groups: required form validation/save/same-date update in per-user storage; record filtering/details/reload persistence; updated dashboard chart; anatomy/front/back/region/radiation controls; emergency paths/restart/handoff/exit; and all five workspace routes at 1440/390/320px in light/dark modes (30 route/theme/width combinations). No page overflow or browser runtime exceptions occurred. Reports are in ignored `tmp/ui-review/landing-results.json` and `tmp/ui-review/merged-workspace-results.json`. These are functional/rendering checks of the current prototype, not medical-content validation.
