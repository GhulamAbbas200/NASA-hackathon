import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Body, type BodyPart } from 'react-body-map';
import { REGIONS } from '../types';
import { emergencySteps, EMERGENCY_START_STEP_ID } from './emergency';
import { indicators } from './indicators';
import { reminders } from './reminders';
import { regionMap, createBodyMapClickHandler } from './regionMap';
import { seedCheckIns } from './seed';
import { SOURCE_URLS } from './sources';
import { RULES } from '../lib/rules';
import { isCheckIn } from '../lib/storage';

test('every measured indicator has a rule and reminder; radiation has only a reminder', () => {
  const ids = indicators.map(indicator => indicator.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...Object.keys(RULES), 'radiation'].sort(), [...ids].sort());
  assert.deepEqual(reminders.map(reminder => reminder.indicatorId).sort(), [...ids].sort());
  assert.ok(indicators.every(indicator => indicator.sourceUrl.startsWith('https://')));
  assert.ok(seedCheckIns.length === 14 && seedCheckIns.every(entry => entry.simulated && isCheckIn(entry)));
});
test('emergency graph has only section 14b citations, resolves every branch and reaches every step', () => {
  const allowedSources = [SOURCE_URLS.acls, SOURCE_URLS.cpr] as string[];
  const reached = new Set<string>();
  const visit = (id: string) => {
    if (reached.has(id)) return;
    const step = emergencySteps.find(item => item.id === id);
    assert.ok(step, `Missing emergency step ${id}`);
    assert.ok(allowedSources.includes(step.sourceUrl) && step.sourceSection);
    reached.add(id);
    step.answers.forEach(answer => visit(answer.nextStepId));
  };
  visit(EMERGENCY_START_STEP_ID);
  assert.equal(reached.size, emergencySteps.length);
});
test('all mapped slugs exist in the installed male drawings, including usable head paths', () => {
  const require = createRequire(import.meta.url);
  const front = require('react-body-map/dist/assets/bodyFront.js').bodyFront as BodyPart[];
  const back = require('react-body-map/dist/assets/bodyBack.js').bodyBack as BodyPart[];
  const parts = [...front, ...back];
  const slugs = new Set(parts.map(part => part.slug));
  Object.keys(regionMap).forEach(slug => assert.ok(slugs.has(slug as BodyPart['slug']), `Unknown slug ${slug}`));
  assert.deepEqual([...new Set(Object.values(regionMap))].sort(), [...REGIONS].sort());
  for (const slug of ['head-front', 'head-back']) assert.ok(parts.find(part => part.slug === slug)?.pathArray?.length);
});
test('actual package API renders front/back and its callback adapter selects the right region', () => {
  const selected: string[] = [];
  const onBodyPartPress = createBodyMapClickHandler(region => selected.push(region));
  onBodyPartPress({ slug: 'head-front', color: '#ccc' });
  onBodyPartPress({ slug: 'lower-back-left', color: '#ccc' });
  onBodyPartPress({ slug: 'abs-lower', color: '#ccc' });
  assert.deepEqual(selected, ['head', 'lowerBack']);
  for (const side of ['front', 'back'] as const) {
    const html = renderToStaticMarkup(createElement(Body, { data: [], scale: 1, frontOnly: side === 'front', backOnly: side === 'back', side, onBodyPartPress }));
    assert.ok(html.includes(`id="head-${side}"`));
    assert.ok(html.includes('<svg'));
  }
});
