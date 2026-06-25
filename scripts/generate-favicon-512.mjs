/**
 * Generates public/favicon-512x512.png from Favicon_EteceStudio_Rojo.svg.
 * Artwork ~85% of canvas (~7.5% transparent margin per side).
 * Run: node scripts/generate-favicon-512.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "Favicon_EteceStudio_Rojo.svg");
const outPath = join(root, "public", "favicon-512x512.png");

const CANVAS = 512;
/** Target artwork coverage: 82–88% → use 85%. */
const COVERAGE = 0.85;
const ARTWORK = Math.round(CANVAS * COVERAGE);

async function main() {
  const sharp = (await import("sharp")).default;
  const svg = readFileSync(svgPath);

  const artwork = await sharp(svg)
    .resize(ARTWORK, ARTWORK, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const { width = ARTWORK, height = ARTWORK } = await sharp(artwork).metadata();
  const left = Math.floor((CANVAS - width) / 2);
  const top = Math.floor((CANVAS - height) / 2);
  const right = CANVAS - width - left;
  const bottom = CANVAS - height - top;

  const png = await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: artwork, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  writeFileSync(outPath, png);

  const meta = await sharp(png).metadata();
  if (meta.width !== CANVAS || meta.height !== CANVAS) {
    throw new Error(
      `Expected ${CANVAS}×${CANVAS}, got ${meta.width}×${meta.height}`,
    );
  }

  console.log(`Wrote ${outPath} (${meta.width}×${meta.height}, ${meta.format})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
