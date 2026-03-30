/**
 * Kare tuvaldeki dairesel amblem: dışarıdaki parşömen kareyi tam şeffaflaştırır.
 * İç figür / bej dolgulara dokunmaz (sadece daire dışı alpha=0).
 * Kullanım: node scripts/process-logo.mjs [kaynak] [hedef]
 */
import sharp from "sharp";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const src = process.argv[2] || path.join(root, "public", "logo.png");
const dest = process.argv[3] || path.join(root, "public", "logo.png");

async function main() {
  if (!existsSync(src)) {
    console.error("Kaynak bulunamadı:", src);
    process.exit(1);
  }

  const img = sharp(src).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 4) {
    console.error("RGBA bekleniyordu");
    process.exit(1);
  }

  const out = Buffer.from(data);
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const radius = (Math.min(width, height) / 2) * 0.992;
  const R2 = radius * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > R2) {
        out[i + 3] = 0;
      }
    }
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(dest + ".tmp");

  const fs = await import("fs/promises");
  await fs.rename(dest + ".tmp", dest);
  console.log("Logo güncellendi:", dest);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
