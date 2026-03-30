import type { Member } from "./member";

function parseCsvGrid(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) {
      rows.push(row);
    }
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      pushCell();
    } else if (c === "\n") {
      pushCell();
      pushRow();
    } else if (c === "\r") {
      // CRLF: skip; bare CR treated as newline
      if (text[i + 1] === "\n") {
        i++;
      }
      pushCell();
      pushRow();
    } else {
      cell += c;
    }
  }

  pushCell();
  if (row.some((x) => x.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\u0130/g, "i")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

function classifyHeader(header: string): keyof Member | "skip" {
  const h = norm(header.replace(/\*/g, ""));

  if (h.includes("zaman") || h.includes("timestamp") || h.includes("time stamp")) {
    return "skip";
  }
  if (h.includes("elektronik") || h.includes("e-posta") || h.includes("telegram")) {
    return "digitalContact";
  }
  if (h.includes("kidem") || h.includes("rutbe")) {
    return "rank";
  }
  if (h.includes("tam ad") || h.includes("ad-soyad") || h === "ad soyad") {
    return "fullName";
  }
  if (h.includes("mesleg") || h.includes("endustri") || h.includes("sanayinin") || h.includes("uzmanlik")) {
    return "sector";
  }
  if (h.includes("marka")) {
    return "brand";
  }
  if (h.includes("hammadde") || h.includes("ihtiyac")) {
    return "materials";
  }
  if (h.includes("konum") || h.includes("lokasyon") || h.includes("il - ilce")) {
    return "location";
  }
  if (h.includes("iletisim") || h.includes("telefon") || h.includes("numara")) {
    return "contact";
  }
  if (h.includes("referans")) {
    return "reference";
  }

  return "skip";
}

export function sheetCsvToMembers(csvText: string): Member[] {
  const grid = parseCsvGrid(csvText.replace(/^\uFEFF/, ""));
  if (grid.length < 2) return [];

  const headers = grid[0].map((h) => h.trim());
  const colMap: Partial<Record<number, keyof Member>> = {};

  headers.forEach((h, idx) => {
    const field = classifyHeader(h);
    if (field !== "skip") {
      colMap[idx] = field;
    }
  });

  const rows: Member[] = [];

  for (let r = 1; r < grid.length; r++) {
    const line = grid[r];
    const cells: Partial<Record<keyof Member, string>> = {};
    for (let c = 0; c < line.length; c++) {
      const field = colMap[c];
      if (!field) continue;
      const val = (line[c] ?? "").trim();
      if (!val) continue;
      cells[field] = val;
    }

    const fullName = (cells.fullName ?? "").trim();
    if (!fullName) continue;

    rows.push({
      rank: (cells.rank ?? "").trim(),
      fullName,
      sector: (cells.sector ?? "").trim(),
      brand: (cells.brand ?? "").trim(),
      materials: (cells.materials ?? "").trim(),
      location: (cells.location ?? "").trim(),
      contact: (cells.contact ?? "").trim(),
      digitalContact: (cells.digitalContact ?? "").trim(),
      reference: (cells.reference ?? "").trim(),
      source: "sheet",
    });
  }

  return rows;
}
