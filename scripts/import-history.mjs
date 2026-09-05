import { readFile, writeFile } from "node:fs/promises";
import { extractHistory, validateSnapshot } from "../data-utils.js";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) throw new Error("Usage: node scripts/import-history.mjs <history.json> <latest.json>");

const incoming = extractHistory(JSON.parse(await readFile(inputPath, "utf8")));
let current;
try {
  current = validateSnapshot(JSON.parse(await readFile(outputPath, "utf8")));
} catch (error) {
  throw new Error(`Existing verified snapshot is invalid; refusing to overwrite it: ${error.message}`);
}

if (Date.parse(incoming.generatedAt) <= Date.parse(current.generatedAt)) {
  console.log(`No update: received ${incoming.generatedAt}, current snapshot is ${current.generatedAt}.`);
  process.exit(0);
}

await writeFile(outputPath, `${JSON.stringify(incoming, null, 2)}\n`);
console.log(`Imported verified dataset generated at ${incoming.generatedAt}.`);
