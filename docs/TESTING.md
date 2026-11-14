# Local verification

## Automated contracts

At repository root:

```powershell
npm.cmd test
npm.cmd run build
```

The suite has 27 tests: indicator/rule/reminder coverage, emergency graph/source integrity, installed package slugs/rendering/callback, prior-seven baseline comparison and persistence, missing data, check-in parsing/scales/provenance/optional values, same-date save, reminders, and storage corruption/quota/reset behavior.

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
