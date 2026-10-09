#!/usr/bin/env node
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { gunzipSync } from "zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "src/components/learning/RichContent.tsx");
const scripts = join(root, "scripts");

let needs = true;
if (existsSync(target)) {
  const cur = readFileSync(target, "utf8");
  needs = cur.length < 500 || cur.trim() === "PLACEHOLDER" || !cur.includes("protectMath(text");
  console.log(`RichContent size=${cur.length}, restore=${needs}`);
}
if (!needs) process.exit(0);

const parts = [];
for (let i = 0; i < 3; i++) {
  const p = join(scripts, `rc_part${i}.b64`);
  if (!existsSync(p)) {
    console.error("missing", p);
    process.exit(1);
  }
  parts.push(readFileSync(p, "utf8").trim());
}
const b64 = parts.join("");
const text = gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
writeFileSync(target, text);
console.log(`Restored RichContent.tsx (${text.length} bytes)`);
