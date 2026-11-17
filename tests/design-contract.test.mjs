import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.mjs', import.meta.url), 'utf8');

test('premium navigation preserves all canonical section links', () => {
  for (const page of ['home', 'curriculum', 'terminal', 'pointers', 'sources']) {
    assert.match(html, new RegExp(`id="view-${page}"`));
    assert.match(html, new RegExp(`data-nav="${page}"`));
  }
  assert.match(html, /<nav class="nav-list" aria-label="Primary navigation">/);
  assert.match(html, /id="main" tabindex="-1"/);
});

test('new decorative UI is optional and respects motion preferences', () => {
  assert.match(html, /id="motion-toggle"[^>]+aria-label=/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /body\.motion-paused/);
  assert.match(app, /document\.hidden/);
  assert.match(app, /cancelAnimationFrame/);
  assert.match(app, /addEventListener\('pointerleave', resetTilt/);
});

test('learning UI IDs survive the visual redesign', () => {
  for (const id of ['course-search', 'curriculum-list', 'source-grid', 'terminal-input', 'terminal-form', 'mission-counter', 'pointer-value', 'value-slider', 'pointer-connected']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test('honest animated progress: official exploration is separate from degree completion', () => {
  assert.match(html, /id="explored-progress-track"[^>]*role="progressbar"/);
  assert.match(html, /id="curriculum-progress-track"[^>]*role="progressbar"/);
  assert.match(html, /id="mission-progress-track"[^>]*role="progressbar"/);
  assert.match(html, /not verified degree completion/);
  assert.match(app, /engineering-codex:official-entries-reviewed:v1/);
  assert.match(app, /reviewedEntries\.has\(e\.curriculum_entry_id\)/);
  assert.match(app, /setProgress\('#mission-progress-track'/);
  assert.match(css, /@keyframes progress-shine/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('concentrated track is 11 published terms and not a personal transcript', () => {
  const plan=JSON.parse(readFileSync(new URL('../data/public/concentrated_curriculum_5786.json',import.meta.url),'utf8'));
  assert.equal(plan.entries.length,56);
  assert.equal(plan.terms.length,11);
  assert.equal(plan.terms.reduce((a,b)=>a+b.credits,0),160);
  assert.equal(plan.terms.filter(t=>t.semester==='summer').length,3);
  assert.ok(!plan.terms.some(t=>t.year===4&&t.semester==='summer'));
  assert.ok(plan.entries.every(e=>e.student_status==='unknown'));
  assert.match(html, /id="academy-years"/);
  assert.match(html, /data-plan="concentrated"/);
  assert.match(app, /concentrated_curriculum_5786\.json/);
  assert.match(html, /Knowledge Graph/);
  assert.match(html, /Assignment Studio/);
});


test('private academic import remains opt-in, browser-only and absent from public curriculum', () => {
  assert.match(html, /id="private-progress-input"[^>]*type="file"|type="file"[^>]*id="private-progress-input"/);
  assert.match(html, /id="private-progress-track"[^>]*role="progressbar"/);
  assert.match(html, /Nothing loaded\. No personal grades or records/);
  assert.match(app, /engineering-codex-private-progress/);
  assert.match(app, /await file\.text\(\)/);
  const begin=app.indexOf('function setupPrivateCreditImport()');
  const end=app.indexOf('let term=initialTerminalState()',begin);
  assert.ok(begin>=0&&end>begin);
  const onlyImporter=app.slice(begin,end);
  assert.doesNotMatch(onlyImporter,/localStorage|sessionStorage|fetch\(|sendBeacon|XMLHttpRequest/);
  assert.match(onlyImporter,/results\.hidden=true/);
  assert.match(onlyImporter,/calculatedEarned/);
  const plan=JSON.parse(readFileSync(new URL('../data/public/concentrated_curriculum_5786.json',import.meta.url),'utf8'));
  assert.ok(plan.entries.every(row=>row.student_status==='unknown'));
  assert.doesNotMatch(JSON.stringify(plan),/earned_credits|personal_progress|private-progress/);
});
