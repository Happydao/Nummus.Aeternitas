import assert from "node:assert/strict";
import test from "node:test";
import { extractHistory, isStale, loadLatestSnapshot, validateSnapshot } from "../data-utils.js";

const local = {
  generatedAt: "2026-09-05T13:09:40.687Z",
  tbtcAmount: 0.87952182,
  tbtcDate: "2026-09-05",
  nummusBurned: 2270716.167223,
  lastBurnDate: "2026-08-24"
};
const history = {
  generatedAt: "2026-09-05T14:00:00.000Z",
  tbtcHistory: [{ date: "2026-09-05", amount: 0.87952182 }],
  supplyHistory: [{ date: "2026-08-24", burnedCumulative: 2270716.167223 }]
};
const response = (body, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => body });

test("extracts only the required latest verified values", () => {
  assert.deepEqual(extractHistory(history), { ...local, generatedAt: history.generatedAt });
});

test("rejects incomplete history rather than manufacturing a zero", () => {
  assert.throws(() => extractHistory({ ...history, supplyHistory: [{ date: "2026-08-24" }] }), /cumulative burn/);
  assert.throws(() => validateSnapshot({ ...local, tbtcAmount: null }), /tbtcAmount/);
});

test("loads valid remote data", async () => {
  const fetchMock = async (url) => response(String(url).includes("latest.json") ? local : history);
  const result = await loadLatestSnapshot(fetchMock, Date.parse("2026-09-06T00:00:00Z"));
  assert.equal(result.source, "remote");
  assert.equal(result.snapshot.nummusBurned, 2270716.167223);
  assert.equal(result.stale, false);
});

test("keeps local values when remote download fails", async () => {
  const fetchMock = async (url) => String(url).includes("latest.json") ? response(local) : response({}, false);
  const originalError = console.error;
  console.error = () => {};
  const result = await loadLatestSnapshot(fetchMock, Date.parse("2026-09-06T00:00:00Z"));
  console.error = originalError;
  assert.equal(result.source, "fallback");
  assert.deepEqual(result.snapshot, local);
});

test("keeps local values when remote JSON is invalid", async () => {
  const fetchMock = async (url) => response(String(url).includes("latest.json") ? local : { generatedAt: "invalid" });
  const originalError = console.error;
  console.error = () => {};
  const result = await loadLatestSnapshot(fetchMock);
  console.error = originalError;
  assert.equal(result.source, "fallback");
  assert.deepEqual(result.snapshot, local);
});

test("marks datasets older than 48 hours as stale", () => {
  assert.equal(isStale("2026-09-01T00:00:00Z", Date.parse("2026-09-03T00:00:01Z")), true);
  assert.equal(isStale("2026-09-01T00:00:00Z", Date.parse("2026-09-03T00:00:00Z")), false);
});
