import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const output = new URL("../dist/", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL("assets/", output), { recursive: true });
await mkdir(new URL("data/", output), { recursive: true });

for (const file of ["index.html", "styles.css", "app.js", "data-utils.js"]) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, output));
}
for (const file of ["nummus-logo.png", "favicon.png", "og.png"]) {
  await cp(new URL(`../assets/${file}`, import.meta.url), new URL(`assets/${file}`, output));
}
await cp(new URL("../data/latest.json", import.meta.url), new URL("data/latest.json", output));
await writeFile(new URL(".nojekyll", output), "");
console.log("Production site built in dist/");
