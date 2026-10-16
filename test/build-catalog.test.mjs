import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, compareVersions, primaryAsset, replaceBlock, hubTable, loadApps } from '../scripts/build-catalog.mjs';

const app = { id: 'demo', title: 'Demo', summary: 's', platform: 'p', category: 'c' };
const release = (tag, extra = {}) => ({
  tag_name: tag, name: tag, draft: false, prerelease: false, published_at: '2026-10-01T00:00:00Z',
  html_url: `https://example/${tag}`,
  assets: [
    { name: 'SHA256SUMS.txt', size: 90, browser_download_url: 'https://example/sums' },
    { name: 'Manual.pdf', size: 900, browser_download_url: 'https://example/pdf' },
    { name: `Demo-${tag}.exe`, size: 2048, digest: 'sha256:abc', browser_download_url: `https://example/${tag}.exe` },
  ],
  ...extra,
});

test('versions compare numerically', () => {
  assert.ok(compareVersions('1.10.0', '1.9.9') > 0);
  assert.ok(compareVersions('1.0', '1.0.1') < 0);
  assert.equal(compareVersions('2.2', '2.2.0'), 0);
});

test('releases are grouped by tag prefix, newest stable is latest', () => {
  const { apps: [demo] } = buildCatalog([app], [
    release('demo-v1.9.0'),
    release('demo-v1.10.0'),
    release('demo-v2.0.0', { prerelease: true }),
    release('demo-v3.0.0', { draft: true }),
    release('demo-extra-v9.0.0'),
    release('other-v5.0.0'),
  ]);
  assert.deepEqual(demo.releases.map(r => r.version), ['2.0.0', '1.10.0', '1.9.0']);
  assert.equal(demo.latest.version, '1.10.0');
  assert.equal(demo.latest.assets[2].sha256, 'abc');
});

test('app with no releases has latest null', () => {
  const { apps: [demo] } = buildCatalog([app], []);
  assert.equal(demo.latest, null);
  assert.match(hubTable({ apps: [demo] }), /Coming soon/);
});

test('primary asset is the installer, not checksums or manual', () => {
  const { apps: [demo] } = buildCatalog([app], [release('demo-v1.0.0')]);
  assert.equal(primaryAsset(demo.latest).name, 'Demo-demo-v1.0.0.exe');
});

test('replaceBlock keeps hand-written text and replaces only the generated block', () => {
  const once = replaceBlock('# Title\n\nIntro\n', 'TABLE 1');
  const twice = replaceBlock(once, 'TABLE 2');
  assert.match(twice, /^# Title\n\nIntro\n/);
  assert.ok(twice.includes('TABLE 2') && !twice.includes('TABLE 1'));
  assert.equal(replaceBlock(twice, 'TABLE 2'), twice);
});

test('every app.json in the repository is valid', () => {
  const apps = loadApps();
  assert.ok(apps.length > 0);
  assert.equal(new Set(apps.map(a => a.id)).size, apps.length);
});
