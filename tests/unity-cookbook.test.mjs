import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../unity-cookbook/index.html', import.meta.url), 'utf8');
const homepage = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const publisher = readFileSync(new URL('../scripts/build_pages.py', import.meta.url), 'utf8');
const seed = html.match(/<script type="application\/json" id="seed">([\s\S]*?)<\/script>/)?.[1];

test('Unity Cookbook seed includes the expected teaching entries', () => {
  assert.ok(seed, 'missing seed data');
  const topics = JSON.parse(seed);
  assert.equal(topics.length, 34);
  assert.equal(topics.reduce((count, topic) => count + topic.methods.length, 0), 54);
  const ids = new Set(topics.map(topic => topic.id));
  assert.equal(ids.size, topics.length, 'topic identifiers must be unique');
  for (const id of ['find-object', 'inactive', 'prefab-reference', 'serialized-pairs']) {
    assert.ok(ids.has(id), 'missing required topic: ' + id);
  }
});

test('Unity Cookbook is linked and allowlisted for GitHub Pages', () => {
  assert.match(homepage, /href="\.\/unity-cookbook\/"/);
  assert.match(publisher, /"unity-cookbook\/index.html"/);
  assert.match(html, /href="\.\.\/"[^>]*>← Engineering Codex/);
});

test('personal study data stays browser-local with explicit export', () => {
  assert.match(html, /localStorage/);
  assert.match(html, /indexedDB/);
  assert.match(html, /unity-cookbook-backup-/);
});
