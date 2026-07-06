/**
 * Zip WordPress.org Distribution
 * ================================
 * Creates ninja-accessibility.zip from the dist-wporg/ directory.
 * This is the package submitted to WordPress.org (no Freemius, no premium code).
 *
 * Usage: node scripts/zip-wporg.js
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.resolve(ROOT, "dist-wporg");
const ZIP_NAME = "ninja-accessibility.zip";
const ZIP_PATH = path.resolve(ROOT, ZIP_NAME);

if (!fs.existsSync(DIST)) {
    console.error(`❌  dist-wporg/ not found. Run "npm run strip-premium:wporg" first.`);
    process.exit(1);
}

if (fs.existsSync(ZIP_PATH)) {
    fs.rmSync(ZIP_PATH);
}

console.log(`\n📦  Zipping dist-wporg/ → ${ZIP_NAME}\n`);

execSync(`cd "${DIST}" && zip -r "${ZIP_PATH}" . -x "*.DS_Store" -x "__MACOSX/*"`, {
    stdio: "inherit",
});

console.log(`\n✅  Created: ${ZIP_PATH}\n`);
console.log(`\n🚀  Ready for WordPress.org submission!\n`);
