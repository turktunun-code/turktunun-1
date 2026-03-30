/**
 * Şeffaf arka planlı WebM (VP9 + alpha) üretir — tarayıcıda gerçek transparanlık.
 *
 * Gerekli: FFmpeg (https://ffmpeg.org/) PATH'te olmalı.
 *
 * Beyaz zemin chromakey ile silinir; maskotta çok beyaz alan varsa
 * chromakey değerlerini düşürün (örn. 0.05:0.04) veya videoyu yeşil perde ile yeniden export edin.
 *
 * Çalıştırma: npm run bot-webm
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botDir = path.join(__dirname, "..", "public", "bot");

const NAMES = ["selamlama", "arama", "bulma"];

function main() {
  if (!fs.existsSync(botDir)) {
    console.error("Klasör yok:", botDir);
    process.exit(1);
  }

  for (const name of NAMES) {
    const input = path.join(botDir, `${name}.mp4`);
    const output = path.join(botDir, `${name}.webm`);
    if (!fs.existsSync(input)) {
      console.warn("Atlanıyor (dosya yok):", input);
      continue;
    }
    const args = [
      "-y",
      "-i",
      input,
      "-vf",
      "chromakey=white:0.09:0.06",
      "-c:v",
      "libvpx-vp9",
      "-pix_fmt",
      "yuva420p",
      "-b:v",
      "0",
      "-crf",
      "30",
      "-auto-alt-ref",
      "0",
      "-an",
      output,
    ];
    console.log("ffmpeg", ...args);
    try {
      execFileSync("ffmpeg", args, { stdio: "inherit" });
      console.log("Tamam:", output);
    } catch {
      console.error(
        "FFmpeg başarısız. ffmpeg kurulu mu kontrol edin; gerekirse chromakey eşiğini bu script içinde değiştirin.",
      );
      process.exit(1);
    }
  }
}

main();
