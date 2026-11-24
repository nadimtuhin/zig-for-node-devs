// Compiles the Zig examples shipped with the guide so API drift is caught in CI.
//
//   node --experimental-strip-types scripts/check-zig-examples.mjs chapters  # chapter code (Zig 0.13, the playground's compiler)
//   node --experimental-strip-types scripts/check-zig-examples.mjs views     # full programs on the guide pages (Zig 0.14)
//
// Set ZIG to pick the compiler binary (default: `zig`). Programs are type-checked
// with -fno-emit-bin (build-obj when there is no main); files with test blocks are also run with `zig test`.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const zig = process.env.ZIG || 'zig';
const mode = process.argv[2];
const work = mkdtempSync(join(tmpdir(), 'zig-examples-'));

function decodeHtml(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

async function collect() {
  if (mode === 'chapters') {
    const { chaptersData } = await import('../src/data/chapters.ts');
    return Object.entries(chaptersData)
      .filter(([, c]) => !c.code.trimStart().startsWith('#')) // chapter 43 ships a Dockerfile
      .map(([id, c]) => ({ name: `${c.num}_${id}`, code: c.code }));
  }
  if (mode === 'views') {
    const dir = new URL('../src/components/views/', import.meta.url);
    const out = [];
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
      const html = readFileSync(new URL(file, dir), 'utf8');
      let i = 0;
      for (const m of html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)) {
        const code = decodeHtml(m[1]);
        if (code.includes('@import("std")') && /pub fn main\(/.test(code)) {
          out.push({ name: `${file.replace('.html', '')}_${i}`, code });
        }
        i++;
      }
    }
    return out;
  }
  throw new Error('usage: check-zig-examples.mjs <chapters|views>');
}

const examples = await collect();
const failures = [];
for (const { name, code } of examples) {
  const path = join(work, `${name}.zig`);
  writeFileSync(path, code);
  const libs = [];
  if (code.includes('@cImport')) libs.push('-lc');
  if (code.includes('sqlite3.h')) libs.push('-lsqlite3');
  const kind = /pub fn main\(/.test(code) ? 'build-exe' : 'build-obj';
  const steps = [[kind, ...libs, '-fno-emit-bin', path]];
  if (/^test "/m.test(code)) steps.push(['test', ...libs, path]);
  try {
    for (const args of steps) execFileSync(zig, args, { cwd: work, stdio: 'pipe' });
    console.log(`ok   ${name}`);
  } catch (err) {
    console.log(`FAIL ${name}\n${err.stderr?.toString() ?? err.message}`);
    failures.push(name);
  }
}
console.log(`\n${examples.length - failures.length}/${examples.length} ${mode} examples compiled`);
if (examples.length === 0 || failures.length) process.exit(1);
