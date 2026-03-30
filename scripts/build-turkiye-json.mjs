/**
 * data/turkiye-il-ilce.json üretir.
 * Ham dosya: depo köküne `data-turkey-raw.json` indirin:
 * https://raw.githubusercontent.com/nidea1/Turkey-s-Provinces-Districts/master/Turkey.json
 * Çalıştırma: npm run data:turkiye
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const rawPath = path.join(root, "data-turkey-raw.json");
const outPath = path.join(root, "data", "turkiye-il-ilce.json");

if (!fs.existsSync(rawPath)) {
  console.error("Eksik:", rawPath, "\nYukarıdaki URL’den indirip bu ada kaydedin.");
  process.exit(1);
}

function titleTr(s) {
  const t = String(s).trim().toLocaleLowerCase("tr-TR");
  if (!t) return "";
  return t.charAt(0).toLocaleUpperCase("tr-TR") + t.slice(1);
}

const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const out = {};
for (const p of raw) {
  const il = titleTr(p.name);
  const districts = [...new Set(p.districts.map((d) => titleTr(d.name)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
  out[il] = districts;
}
const iller = Object.keys(out).sort((a, b) => a.localeCompare(b, "tr"));
const ordered = {};
for (const il of iller) ordered[il] = out[il];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(ordered), "utf8");
console.log("Yazıldı:", outPath, "il:", iller.length);
