/**
 * One-off script: generates public/og-image.png (1200×630) for Open Graph.
 * Run: node scripts/generate-og-image.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "public", "og-image.png");
const logoPath = join(root, "public", "assets", "_LOGO_NegroRojo.svg");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("sharp is required. Install with: npm install sharp");
    process.exit(1);
  }

  const logoSvg = readFileSync(logoPath);
  const logoWidth = 520;
  const logoBuffer = await sharp(logoSvg).resize(logoWidth).png().toBuffer();

  const canvas = sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  });

  const composited = await canvas
    .composite([
      {
        input: logoBuffer,
        top: Math.round((630 - logoWidth * 0.22) / 2),
        left: Math.round((1200 - logoWidth) / 2),
      },
    ])
    .png()
    .toBuffer();

  writeFileSync(outPath, composited);
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
