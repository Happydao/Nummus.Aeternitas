export const INITIAL_FALLBACK = Object.freeze({
  generatedAt: "2026-09-05T13:09:40.687Z",
  tbtcAmount: 0.87952182,
  tbtcDate: "2026-09-05",
  nummusBurned: 2270716.167223,
  lastBurnDate: "2026-08-24"
});

const isValidDate = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
const isValidNumber = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;

export function validateSnapshot(value) {
  if (!value || typeof value !== "object") throw new Error("Snapshot must be an object");
  if (!isValidDate(value.generatedAt)) throw new Error("Snapshot generatedAt is missing or invalid");
  if (!isValidNumber(value.tbtcAmount)) throw new Error("Snapshot tbtcAmount is missing or invalid");
  if (!isValidDate(value.tbtcDate)) throw new Error("Snapshot tbtcDate is missing or invalid");
  if (!isValidNumber(value.nummusBurned)) throw new Error("Snapshot nummusBurned is missing or invalid");
  if (!isValidDate(value.lastBurnDate)) throw new Error("Snapshot lastBurnDate is missing or invalid");
  return {
    generatedAt: value.generatedAt,
    tbtcAmount: value.tbtcAmount,
    tbtcDate: value.tbtcDate,
    nummusBurned: value.nummusBurned,
    lastBurnDate: value.lastBurnDate
  };
}

export function extractHistory(value) {
  if (!value || typeof value !== "object") throw new Error("History payload must be an object");
  if (!isValidDate(value.generatedAt)) throw new Error("History generatedAt is missing or invalid");
  if (!Array.isArray(value.tbtcHistory) || value.tbtcHistory.length === 0) throw new Error("History tbtcHistory is empty");
  if (!Array.isArray(value.supplyHistory) || value.supplyHistory.length === 0) throw new Error("History supplyHistory is empty");

  const tbtc = value.tbtcHistory.at(-1);
  const supply = value.supplyHistory.at(-1);
  if (!isValidNumber(tbtc?.amount)) throw new Error("Latest tBTC amount is missing or invalid");
  if (!isValidDate(tbtc?.date)) throw new Error("Latest tBTC date is missing or invalid");
  if (!isValidNumber(supply?.burnedCumulative)) throw new Error("Latest cumulative burn is missing or invalid");
  if (!isValidDate(supply?.date)) throw new Error("Latest burn date is missing or invalid");

  return {
    generatedAt: value.generatedAt,
    tbtcAmount: tbtc.amount,
    tbtcDate: tbtc.date,
    nummusBurned: supply.burnedCumulative,
    lastBurnDate: supply.date
  };
}

export function isStale(generatedAt, now = Date.now()) {
  return now - Date.parse(generatedAt) > 48 * 60 * 60 * 1000;
}

export async function loadLatestSnapshot(fetchImpl = fetch, now = Date.now()) {
  let local;
  try {
    const response = await fetchImpl("./data/latest.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Local snapshot request failed (${response.status})`);
    local = validateSnapshot(await response.json());
  } catch (error) {
    console.error("NUMMUS local data fallback failed validation; using bundled verified snapshot.", error);
    local = validateSnapshot(INITIAL_FALLBACK);
  }

  try {
    const dataUrl = `https://raw.githubusercontent.com/Happydao/nummus-nav-dashboard/main/data/history.json?t=${Date.now()}`;
    const response = await fetchImpl(dataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Remote history request failed (${response.status})`);
    const remote = extractHistory(await response.json());
    if (Date.parse(remote.generatedAt) < Date.parse(local.generatedAt)) {
      return { snapshot: local, source: "local-newer", stale: isStale(local.generatedAt, now) };
    }
    return { snapshot: remote, source: "remote", stale: isStale(remote.generatedAt, now) };
  } catch (error) {
    console.error("NUMMUS live data update failed; showing the last verified local snapshot.", error);
    return { snapshot: local, source: "fallback", stale: isStale(local.generatedAt, now) };
  }
}

export function formatAmount(value, maximumFractionDigits) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: true
  }).format(value);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(value));
}
