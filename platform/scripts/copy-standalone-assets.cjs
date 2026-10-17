const { cp, mkdir } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");

const standaloneDir = resolve(".next/standalone");
const standaloneNextDir = resolve(standaloneDir, ".next");

async function copyStandaloneAssets() {
  await mkdir(standaloneNextDir, { recursive: true });
  await cp(resolve(".next/static"), resolve(standaloneNextDir, "static"), { recursive: true, force: true });

  const publicDir = resolve("public");
  if (existsSync(publicDir)) {
    await cp(publicDir, resolve(standaloneDir, "public"), { recursive: true, force: true });
  }
}

copyStandaloneAssets().catch((error) => {
  console.error("Could not copy standalone assets", error);
  process.exitCode = 1;
});
