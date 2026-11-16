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
