/**
 * Controlled breakpoint remap without cascade collisions.
 * Uses placeholders so 1599→1279 is not later converted by 1279→1023.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");

/** old → new (×0.8). Sorted descending by old. */
const BP_MAP = [
  [2560, 2048],
  [1920, 1536],
  [1919, 1535],
  [1800, 1440],
  [1600, 1280],
  [1599, 1279],
  [1560, 1248],
  [1500, 1200],
  [1499, 1199],
  [1440, 1152],
  [1439, 1151],
  [1366, 1093],
  [1360, 1088],
  [1359, 1087],
  [1280, 1024],
  [1279, 1023],
  [1180, 944],
  [1179, 943],
  [1100, 880],
  [1099, 879],
  [1025, 820],
  [1024, 819],
  [981, 785],
  [980, 784],
  [900, 720],
  [899, 719],
  [769, 615],
  [768, 614],
  [767, 613],
  [640, 512],
  [620, 496],
  [600, 480],
  [520, 416],
  [480, 384],
  [430, 344],
  [420, 336],
  [390, 312],
  [374, 299],
  [360, 288],
  [349, 279],
  [320, 256],
];

function remapMediaBlock(block) {
  let out = block;
  const tokens = new Map();

  BP_MAP.forEach(([oldVal], i) => {
    const token = `__BP${i}__`;
    tokens.set(token, BP_MAP[i][1]);
    const re = new RegExp(`(?<![\\d.])${oldVal}px`, "g");
    out = out.replace(re, token);
  });

  for (const [token, newVal] of tokens) {
    out = out.split(token).join(`${newVal}px`);
  }

  return out;
}

function processCss(content) {
  return content.replace(/@media[^{]+\{[\s\S]*?\n\}/g, (mediaBlock) => remapMediaBlock(mediaBlock));
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") walk(full, files);
    } else if (/\.(css|module\.css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const cssFiles = walk(SRC);
let changed = 0;

for (const file of cssFiles) {
  const before = fs.readFileSync(file, "utf8");
  const after = processCss(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed += 1;
    console.log("updated:", path.relative(ROOT, file));
  }
}

console.log(`\nDone. ${changed} CSS file(s) updated.`);
