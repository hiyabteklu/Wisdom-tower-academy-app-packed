#!/usr/bin/env node
/** Restore src/app/ui-polish.css if it was corrupted (size < 1kb). */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "src/app/ui-polish.css");
const url =
  "https://raw.githubusercontent.com/hiyabteklu/Wisdom-tower-academy/28c9550a139702016e1ae5cb5dc72f4ace3841c8/src/app/ui-polish.css";

let needsRestore = true;
if (existsSync(target)) {
  const size = readFileSync(target).length;
  needsRestore = size < 1000;
  console.log(`ui-polish.css size=${size}, restore=${needsRestore}`);
}

if (!needsRestore) {
  process.exit(0);
}

try {
  const res = await fetch(url);
  if (!res.ok) {
    console.warn("Failed to download ui-polish.css, status:", res.status);
    process.exit(0);
  }
  const text = await res.text();
  writeFileSync(target, text);
  console.log(`Restored ui-polish.css (${text.length} bytes)`);
} catch (e) {
  console.warn("Error restoring ui-polish.css:", e);
  process.exit(0);
}
