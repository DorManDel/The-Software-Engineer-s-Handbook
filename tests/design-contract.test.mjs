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
  assert.match(html, /not your personal degree completion/);
  assert.match(app, /engineering-codex:official-entries-reviewed:v1/);
  assert.match(app, /reviewedEntries\.has\(e\.curriculum_entry_id\)/);
  assert.match(app, /setProgress\('#mission-progress-track'/);
  assert.match(css, /@keyframes progress-shine/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
