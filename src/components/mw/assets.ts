/**
 * Presentation helpers for asset glyphs / colors / network labels.
 * Colors + glyphs mirror the design handoff's ASSETS catalogue. Base ticker and
 * network are derived from the backend fireblockAssetId (e.g. "USDT_ERC20"),
 * which is the only place the network is encoded — the whitelist model has no
 * explicit network field.
 */
export interface CoinMeta {
  glyph: string;
  color: string;
}

export const COIN_META: Record<string, CoinMeta> = {
  EUR: { glyph: "€", color: "#4775f2" },
  BTC: { glyph: "₿", color: "#f7931a" },
  ETH: { glyph: "Ξ", color: "#627eea" },
  USDT: { glyph: "₮", color: "#26a17b" },
  USDC: { glyph: "$", color: "#2775ca" },
  BNB: { glyph: "B", color: "#f0b90b" },
  SOL: { glyph: "S", color: "#9945ff" },
  XRP: { glyph: "X", color: "#23292f" },
};

const NET_LABEL: Record<string, string> = {
  ERC20: "ERC20",
  TRC20: "TRC20",
  TRX: "TRC20",
  TRON: "TRC20",
  BSC: "BSC",
  BEP20: "BSC",
  POLYGON: "Polygon",
  MATIC: "Polygon",
  MATIC_POLYGON: "Polygon",
  SEPA: "SEPA",
};

/** Base symbol from a fireblockAssetId ("USDT_ERC20" -> "USDT", "BTC" -> "BTC"). */
export function baseTicker(assetId = ""): string {
  const up = String(assetId).toUpperCase();
  return (up.split(/[_\-]/)[0] || up).slice(0, 5);
}

/** Human network label, or null for single-network assets. */
export function networkOf(assetId = ""): string | null {
  const parts = String(assetId).toUpperCase().split(/[_\-]/);
  if (parts.length < 2) return null;
  const rest = parts.slice(1).join("_");
  return NET_LABEL[rest] ?? NET_LABEL[parts[1]!] ?? parts.slice(1).join(" ");
}

const FALLBACK_COLORS = ["#4775f2", "#7a4ff0", "#db33a1", "#0ea5e9", "#16a34a", "#f59e0b"];

export function coinMeta(assetId = ""): CoinMeta {
  const base = baseTicker(assetId);
  if (COIN_META[base]) return COIN_META[base]!;
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return { glyph: base.charAt(0) || "?", color: FALLBACK_COLORS[h % FALLBACK_COLORS.length]! };
}

/** first5…last5 truncation used across the design. */
export function shortAddr(a = ""): string {
  return a.length > 12 ? a.slice(0, 5) + "…" + a.slice(-5) : a;
}
