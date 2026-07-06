/**
 * Zip Free Distribution
 * =====================
 * Creates ninja-accessibility-free.zip from the dist-free/ directory.
 *
 * Usage: node scripts/zip-free.js
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.resolve(ROOT, "dist-free");
const ZIP_NAME = "ninja-accessibility-free.zip";
const ZIP_PATH = path.resolve(ROOT, ZIP_NAME);

if (!fs.existsSync(DIST)) {
    console.error(`❌  dist-free/ not found. Run "npm run strip-premium" first.`);
    process.exit(1);
}

if (fs.existsSync(ZIP_PATH)) {
    fs.rmSync(ZIP_PATH);
}

console.log(`\n📦  Zipping dist-free/ → ${ZIP_NAME}\n`);

execSync(`cd "${DIST}" && zip -r "${ZIP_PATH}" . -x "*.DS_Store" -x "__MACOSX/*"`, {
    stdio: "inherit",
});

console.log(`\n✅  Created: ${ZIP_PATH}\n`);
