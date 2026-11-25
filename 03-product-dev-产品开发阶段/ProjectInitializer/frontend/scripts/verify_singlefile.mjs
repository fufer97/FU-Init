#!/usr/bin/env node
/**
 * Verify that dist/index.html is a self-contained single-file HTML suitable for WorkBuddy 资料库 publishing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distHtml = path.resolve(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(distHtml)) {
  console.error('[verify_singlefile] FAIL: dist/index.html does not exist');
  process.exit(1);
}

const html = fs.readFileSync(distHtml, 'utf-8');
const sizeKb = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);

const externalScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)];
const externalStyles = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)];

if (externalScripts.length > 0 || externalStyles.length > 0) {
  console.error('[verify_singlefile] FAIL: Found external script or stylesheet references:', {
    externalScripts: externalScripts.map((m) => m[1]),
    externalStyles: externalStyles.map((m) => m[1]),
  });
  process.exit(1);
}

for (const forbidden of ['@FUF 独家研发', 'skyforge/credentials.yaml', '/Users/muyu/MuYuKnowledge']) {
  if (html.includes(forbidden)) {
    console.error(`[verify_singlefile] FAIL: Found forbidden legacy brand/personal string: ${forbidden}`);
    process.exit(1);
  }
}

console.log(`[verify_singlefile] PASS: dist/index.html is 100% self-contained (${sizeKb} KB), 0 external scripts/styles, 0 legacy brand/personal strings.`);
