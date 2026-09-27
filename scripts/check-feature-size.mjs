import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../src/features/", import.meta.url));
const limit = 250;
const violations = [];

async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "confined-spaces") continue;
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await check(path);
    else if (/\.tsx?$/.test(entry.name)) {
      const lines = (await readFile(path, "utf8")).split("\n").length;
      if (lines > limit) violations.push(`${path.replace(root, "")}: ${lines} linhas`);
    }
  }
}

await check(root.replace(/\/$/, ""));
if (violations.length) {
  console.error(`Arquivos de feature acima de ${limit} linhas:\n${violations.join("\n")}`);
  process.exitCode = 1;
}
