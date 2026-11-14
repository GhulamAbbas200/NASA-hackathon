# ASTRA local demo

Use a fresh browser profile for the original 14 simulated records. Start at `#dashboard`. State clearly that the observations are simulated and the tool is decision support, not a diagnosis.

1. **Overview (20 seconds).** Show the ISS workspace, stored check-in count, scheduled daily prompt, source notice and light/dark toggle. The text stays readable in both modes.
2. **Body overview (30 seconds).** Select Head/Chest using anatomy hotspots or labelled buttons. Show the live region panel, latest values, mini trends, source/help and prototype status chip. Switch to Front model and Back model; select lower back. Use Whole body → radiation to explain why a dosimeter is required.
3. **Check-in (40 seconds).** Open Check-in. The current simulated date is prefilled if it exists. Keep provenance set to simulated. Change sleep/fatigue, expand a measurement guide, and show optional temperature/glucose inputs. Save; explain same-date edits update rather than duplicate.
4. **Trends (30 seconds).** Return to Overview and scroll to Trends & guidance. Select Sleep duration, then Blood glucose. Show the dashed prior-seven baseline, date/value table, missing readings, and source-linked next actions. Emphasize “prototype rule, not a medical threshold.”
5. **Emergency (35 seconds).** Enter from the persistent button or chest panel. Follow the guided questions through the sourced checklist handoff. Show source/verification notes and Back/Restart. Never present this as a current approved flight checklist or CPR training.
6. **Environments (15 seconds).** Switch to spacecraft/Moon base. Show their conceptual label, unknown equipment/schedule, and changed escalation text. Switch back to ISS; stored history is preserved.
7. **Sources & limits (20 seconds).** Open About. Show NASA/CSA and peer-reviewed sources, OSDR rodent-bone context, simulated-data explanation, local storage and MIT drawing credits. Close with the need for mission-medical review before operational use.

If demonstrating empty/reset states, do it last: Check-in → Manage local records → Clear → explicit confirmation. Reset stays empty after reload. It does not silently restore the demo or change theme preference.

Deployment is deferred by Abbas. Local commands: `npm.cmd install`, `npm.cmd run dev`; validation: `npm.cmd test`, `npm.cmd run build`.
