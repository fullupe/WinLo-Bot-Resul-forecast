// RS Lotto domain logic: fetch, parse, command parser, forecast.

export type Row = {
  game: string;
  date: string; // DD-MM-YYYY
  numbers: string;
  first: number[];
  extra6: number;
  extra7: number;
  last: number[];
  raw: any;
};

const API_URL = "/api/results";
const CACHE_KEY = "rslotto_cache_v2";
const CACHE_TTL_MS = 5 * 60 * 1000;

function formatDate(d: string): string {
  // 2026/06/23 or 2026-06-23 -> 23-06-2026
  if (!d) return "";
  const parts = d.replace(/-/g, "/").split("/");
  if (parts.length !== 3) return d;
  const [y, m, day] = parts;
  return `${day.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
}

function toNumArr(s: any): number[] {
  if (!s) return [];
  if (Array.isArray(s)) return s.map(Number).filter((n) => !isNaN(n));
  return String(s)
    .split(/[,\s-]+/)
    .map((x) => parseInt(x, 10))
    .filter((n) => !isNaN(n));
}

export async function loadData(): Promise<Row[]> {
  // Cache check
  try {
    if (typeof localStorage !== "undefined") {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { t, data } = JSON.parse(cached);
        if (Date.now() - t < CACHE_TTL_MS) return data;
      }
    }
  } catch {}

  const res = await fetch(API_URL);
  const raw = await res.json();
  const arr = Array.isArray(raw) ? raw : (raw.latest_draws ?? raw.results ?? raw.data ?? []);

  const rows: Row[] = arr.map((d: any) => {
      const first = toNumArr(d.first);
      const last = toNumArr(d.last);
      const extra6 = Number(d.extra6) || 0;
      const extra7 = Number(d.extra7) || 0;
      const all = [...first, extra6, extra7, ...last].filter(Boolean);
      return {
        game: (d.game || "").trim(),
        date: formatDate(d.date),
        numbers: all.join("-"),
        first,
        extra6,
        extra7,
        last,
        raw: d,
      };
    })
    .filter((r: Row) => r.game && r.date);

try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: rows }));
    }
  } catch {}
  return rows;
}

export function getGames(rows: Row[]): string[] {
  return [...new Set(rows.map((r) => r.game))].sort();
}

function parseDateInput(s: string): string | null {
  // accepts DD-MM-YYYY, TODAY, YESTERDAY
  const up = s.toUpperCase().trim();
  const today = new Date();
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  if (up === "TODAY") return fmt(today);
  if (up === "YESTERDAY") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return fmt(y);
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
  return null;
}

function formatResult(r: Row): string {
  const pad = (a: number[]) => a.map((n) => String(n).padStart(2, "0")).join("-");
  return `📅 ${r.date}\nF5: ${pad(r.first)}\nExt6: ${String(r.extra6).padStart(2, "0")}\nExt7: ${String(r.extra7).padStart(2, "0")}\nL5: ${pad(r.last)}`;
}

function listGames(games: string[]): string {
  return (
    "🎰 *Available Games*\n" +
    games.map((g, i) => `${i + 1}. ${g}`).join("\n") +
    "\n\n📌 *How to use:*\n" +
    "• Latest result: type `1` or `1 latest`\n" +
    "• Specific date: type `1 23-06-2026`, `1 today`, or `1 yesterday`\n" +
    "• Forecast: type `F1` or `forecast 1`\n" +
    "• Show menu again: type `menu`"
  );
}

function resolveGame(token: string, games: string[]): string | null {
  const t = token.trim();
  const n = parseInt(t, 10);
  if (!isNaN(n) && n >= 1 && n <= games.length) return games[n - 1];
  const match = games.find((g) => g.toUpperCase() === t.toUpperCase());
  if (match) return match;
  const partial = games.find((g) => g.toUpperCase().startsWith(t.toUpperCase()));
  return partial ?? null;
}

function forecast(game: string, rows: Row[]): string {
  const year = new Date().getFullYear();
  const gameRows = rows.filter((r) => r.game === game && r.date.endsWith(`-${year}`));
  if (gameRows.length === 0) return `No ${year} data yet for *${game}*.`;

  const now = Date.now();
  const dateMs = (d: string) => {
    const [dd, mm, yy] = d.split("-").map(Number);
    return new Date(yy, mm - 1, dd).getTime();
  };

  const weights: Record<number, number> = {};
  const lastSeen: Record<number, number> = {};

  for (const r of gameRows) {
    const ms = dateMs(r.date);
    const days = (now - ms) / (1000 * 60 * 60 * 24);
    const w = days <= 30 ? 2 : 1;
    const nums = [...r.first, r.extra6, r.extra7, ...r.last].filter((n) => n >= 1 && n <= 99);
    for (const n of nums) {
      weights[n] = (weights[n] || 0) + w;
      if (!lastSeen[n] || ms > lastSeen[n]) lastSeen[n] = ms;
    }
  }

  const seenEntries = Object.entries(weights).map(([n, w]) => ({
    n: parseInt(n, 10),
    w,
  }));
  const sortedByWeight = [...seenEntries].sort((a, b) => b.w - a.w);
  const hot = sortedByWeight.slice(0, 3);
  const cold = sortedByWeight.slice(-3).reverse();

  const due = [...seenEntries]
    .sort((a, b) => (lastSeen[a.n] || 0) - (lastSeen[b.n] || 0))
    .slice(0, 3);

  const never: number[] = [];
  for (let i = 1; i <= 99; i++) if (!weights[i]) never.push(i);

  const pick = [...hot.slice(0, 3).map((x) => x.n), ...due.slice(0, 3).map((x) => x.n)];
  const uniquePick = [...new Set(pick)].slice(0, 6);

  const fmtEntry = (e: { n: number; w: number }) => `${String(e.n).padStart(2, "0")}(${e.w})`;

  return [
    `*${game} — ${year} Forecast*`,
    `📊 ${gameRows.length} draws analysed`,
    `🔥 Hot: ${hot.map(fmtEntry).join(" • ")}`,
    `❄️ Cold: ${cold.map(fmtEntry).join(" • ")}`,
    `⏳ Due: ${due.map(fmtEntry).join(" • ")}`,
    `🚫 Never (${never.length} nums): ${never.slice(0, 30).join(", ")}${never.length > 30 ? "…" : ""}`,
    ``,
    `🎯 Play: ${uniquePick.map((n) => String(n).padStart(2, "0")).join(" - ")}`,
  ].join("\n");
}

export function handleCommand(input: string, rows: Row[]): string {
  const games = getGames(rows);
  const text = input.trim();
  if (!text) return "👋 Welcome! Type `menu` to see available games and commands.";

  const up = text.toUpperCase();
  if (["LIST", "HI", "HELLO", "MENU", "START"].includes(up)) {
    return listGames(games);
  }

  // Forecast: F1, F ABIA, FORECAST 1
  const fMatch = up.match(/^(?:F|FORECAST)\s*(.+)$/);
  if (fMatch) {
    const g = resolveGame(fMatch[1], games);
    if (!g) return `Couldn't find that game. Type \`menu\` to see all available games.`;
    return forecast(g, rows);
  }

  // <game> [date]
  const parts = text.split(/\s+/);
  const g = resolveGame(parts[0], games);
  if (!g) return `Unknown command. Type \`menu\` to see games or \`F1\` for a forecast.`;

  const gameRows = rows
    .filter((r) => r.game === g)
    .sort((a, b) => {
      const [da, ma, ya] = a.date.split("-").map(Number);
      const [db, mb, yb] = b.date.split("-").map(Number);
      return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
    });

  if (gameRows.length === 0) return `No results found for *${g}*.`;

  if (parts.length >= 2) {
    const dateArg = parts.slice(1).join(" ");
    const d = parseDateInput(dateArg);
    if (!d) return `Bad date. Use \`${parts[0]} today\`, \`${parts[0]} yesterday\`, or \`${parts[0]} DD-MM-YYYY\` (e.g. \`${parts[0]} 23-06-2026\`).`;
    const hit = gameRows.find((r) => r.date === d);
    if (!hit) return `No *${g}* draw found on ${d}.`;
    return `*${g}*\n${formatResult(hit)}`;
  }

  return `*${g}* — Latest Result\n${formatResult(gameRows[0])}`;
}

export function welcomeMessage(games: string[]): string {
  return (
    "👋 Welcome to *RS Lotto*!\n\n" +
    "🎰 Games loaded:\n" +
    games.map((g, i) => `${i + 1}. ${g}`).join("\n") +
    "\n\n📌 *Quick commands:*\n" +
    "• `menu` — show game list\n" +
    "• `1` — latest result for game #1\n" +
    "• `1 today` / `1 23-06-2026` — result for a specific date\n" +
    "• `F1` — forecast for game #1"
  );
}
