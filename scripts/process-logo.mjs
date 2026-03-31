/**
 * Kare tuvaldeki dairesel amblem: dışarıdaki parşömen kareyi tam şeffaflaştırır.
 * İç figür / bej dolgulara dokunmaz (sadece daire dışı alpha=0).
 *
 * Çıktıyı bir CDN’e yükleyip admin panelinde URL olarak verin; depoda logo dosyası tutulmaz.
 *
 * Kullanım: node scripts/process-logo.mjs <kaynak.png> <cikis.png>
 */
import sharp from "sharp";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const src = process.argv[2];
const dest = process.argv[3];

async function main() {
  if (!src || !dest) {
    console.error("Kullanım: node scripts/process-logo.mjs <kaynak.png> <cikis.png>");
    console.error("Örnek: node scripts/process-logo.mjs ./ham-logo.png ./cikis-logo.png");
    process.exit(1);
  }

  const srcPath = path.isAbsolute(src) ? src : path.join(root, src);
  const destPath = path.isAbsolute(dest) ? dest : path.join(root, dest);

  if (!existsSync(srcPath)) {
    console.error("Kaynak bulunamadı:", srcPath);
    process.exit(1);
  }

  const img = sharp(srcPath).ensureAlpha();
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
    .toFile(destPath + ".tmp");

  const fs = await import("fs/promises");
  await fs.rename(destPath + ".tmp", destPath);
  console.log("Çıktı yazıldı:", destPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
