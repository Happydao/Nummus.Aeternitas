import { formatAmount, formatDate, loadLatestSnapshot } from "./data-utils.js";

const LINKS = [
  { label: "Institutional Metrics Dashboard", url: "https://happydao.github.io/nummus-nav-dashboard/", primary: true },
  { label: "Jupiter", url: "https://jup.ag/tokens/9JK2U7aEkp3tWaFNuaJowWRgNys5DVaKGxWk73VT5ray" },
  { label: "X / Twitter", url: "https://x.com/NummusMemeCoin" },
  // Add the verified URLs here when they become available.
  { label: "Vault on Solscan", url: null },
  { label: "RugCheck", url: "https://rugcheck.xyz/tokens/9JK2U7aEkp3tWaFNuaJowWRgNys5DVaKGxWk73VT5ray" }
];

const links = document.querySelector("#external-links");
for (const item of LINKS.filter(({ url }) => Boolean(url))) {
  const anchor = document.createElement("a");
  anchor.href = item.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = item.label;
  if (item.primary) anchor.classList.add("is-primary");
  links.append(anchor);
}

function render({ snapshot, source, stale }) {
  const tbtcValue = document.querySelector("#tbtc-value");
  const burnValue = document.querySelector("#burn-value");
  tbtcValue.textContent = formatAmount(snapshot.tbtcAmount, 4);
  burnValue.textContent = formatAmount(snapshot.nummusBurned, 0);
  tbtcValue.title = `Exact verified value: ${snapshot.tbtcAmount} tBTC`;
  burnValue.title = `Exact verified value: ${snapshot.nummusBurned} NUMMUS`;
  tbtcValue.setAttribute("aria-label", `${snapshot.tbtcAmount} tBTC`);
  burnValue.setAttribute("aria-label", `${snapshot.nummusBurned} NUMMUS`);
  document.querySelector("#tbtc-date").textContent = formatDate(snapshot.tbtcDate);
  document.querySelector("#burn-date").textContent = formatDate(snapshot.lastBurnDate);

  const status = document.querySelector("#data-status");
  status.className = "status";
  const updated = formatDate(snapshot.generatedAt);
  if (source === "fallback") {
    status.classList.add("is-fallback");
    status.lastChild.textContent = ` Live update unavailable · verified snapshot ${updated}`;
  } else if (stale) {
    status.classList.add("is-stale");
    status.lastChild.textContent = ` Update delayed · last dataset ${updated}`;
  } else {
    status.lastChild.textContent = ` Data current · updated ${updated}`;
  }
}

loadLatestSnapshot().then(render).catch((error) => {
  console.error("NUMMUS data rendering failed.", error);
});
