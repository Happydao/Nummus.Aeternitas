import { formatAmount, formatDate, loadLatestSnapshot } from "./data-utils.js";

const LINKS = [
  { label: "Dashboard", url: "https://happydao.github.io/nummus-nav-dashboard/" },
  { label: "Jupiter", url: "https://jup.ag/tokens/9JK2U7aEkp3tWaFNuaJowWRgNys5DVaKGxWk73VT5ray" },
  { label: "X / Twitter", url: "https://x.com/NummusMemeCoin" },
  // Add the verified URLs here when they become available.
  { label: "Vault on Solscan", url: null },
  { label: "RugCheck", url: null }
];

const links = document.querySelector("#external-links");
for (const item of LINKS.filter(({ url }) => Boolean(url))) {
  const anchor = document.createElement("a");
  anchor.href = item.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = item.label;
  links.append(anchor);
}

function render({ snapshot, source, stale }) {
  document.querySelector("#tbtc-value").textContent = formatAmount(snapshot.tbtcAmount, 8);
  document.querySelector("#burn-value").textContent = formatAmount(snapshot.nummusBurned, 6);
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
