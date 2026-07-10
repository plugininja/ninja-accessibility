/**
 * Clean & Verify Distribution
 * ===========================
 * Runs AFTER the free JS bundles have been rebuilt inside the dist folder.
 *
 * 1. Removes build tooling and dev files that must not ship
 *    (scripts/, package.json, webpack configs, tsconfig, source maps, …).
 * 2. Adds an ABSPATH guard to generated *.asset.php manifests.
 * 3. VERIFIES the shipped bundles:
 *      - no webpack eval-source-map / dev-build banners
 *      - no premium markers (fs_premium_only) left in any shipped file
 *      - no *.map files
 *    Exits non-zero on any violation so the zip step never runs on a bad dist.
 *
 * Usage:
 *   node scripts/clean-dist.js --mode=github   # cleans dist-free/
 *   node scripts/clean-dist.js --mode=wporg    # cleans dist-wporg/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
        const [k, v] = a.replace(/^--/, "").split("=");
        return [k, v ?? true];
    })
);

const MODE = args.mode ?? "github";
const DIST = path.resolve(ROOT, MODE === "wporg" ? "dist-wporg" : "dist-free");

if (!fs.existsSync(DIST)) {
    console.error(`❌  ${path.basename(DIST)}/ not found. Run strip-premium first.`);
    process.exit(1);
}

// ─── 1. Remove build tooling / dev files ────────────────────────────────────

const REMOVE_DIRS = [
    "scripts",
    "node_modules",
    ".claude",
    ".vscode",
    ".idea",
    "tokens",
    // source/ ships in the wporg zip (human-readable code for reviewers)
    // but is dropped from the GitHub free zip (already in the repository).
    ...(MODE === "github" ? ["source"] : []),
];

const REMOVE_FILES = [
    "package.json",
    "package-lock.json",
    "webpack.prod.config.js",
    "webpack.dev.config.js",
    "tsconfig.json",
    "postcss.config.cjs",
    ".eslintrc.json",
    ".eslintrc.cjs",
    ".gitignore",
    ".DS_Store",
];

for (const dir of REMOVE_DIRS) {
    const p = path.join(DIST, dir);
    if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
        console.log(`  [removed] ${dir}/`);
    }
}

for (const file of REMOVE_FILES) {
    const p = path.join(DIST, file);
    if (fs.existsSync(p)) {
        fs.rmSync(p);
        console.log(`  [removed] ${file}`);
    }
}

// Recursively remove *.map and .DS_Store anywhere in the dist.
function walk(dir, fn) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(p, fn);
        } else {
            fn(p);
        }
    }
}

walk(DIST, (file) => {
    if (file.endsWith(".map") || path.basename(file) === ".DS_Store") {
        fs.rmSync(file);
        console.log(`  [removed] ${path.relative(DIST, file)}`);
    }
});

// ─── 2. ABSPATH guard for generated *.asset.php files ───────────────────────

walk(DIST, (file) => {
    if (!file.endsWith(".asset.php")) {
        return;
    }
    let content = fs.readFileSync(file, "utf8");
    if (!content.includes("ABSPATH")) {
        content = content.replace(
            /^<\?php\s*/,
            "<?php defined( 'ABSPATH' ) || exit( 'No direct script access allowed' ); "
        );
        fs.writeFileSync(file, content, "utf8");
    }
});

// ─── 3. Verify shipped bundles ───────────────────────────────────────────────

const violations = [];

walk(DIST, (file) => {
    const rel = path.relative(DIST, file);
    const ext = path.extname(file).toLowerCase();

    if (![".js", ".css", ".php", ".ts", ".tsx", ".jsx", ".scss"].includes(ext)) {
        return;
    }

    const content = fs.readFileSync(file, "utf8");

    // Dev-build / eval-source-map artefacts in shipped assets.
    if (rel.startsWith(`assets${path.sep}js`)) {
        if (
            content.includes("eval-source-map") ||
            content.includes("An eval-source-map devtool has been used") ||
            /\beval\(/.test(content)
        ) {
            violations.push(`${rel}: contains eval()/dev-build artefacts — not a production bundle`);
        }
    }

    // Premium markers must never survive the strip.
    if (content.includes("fs_premium_only") || rel.includes("__premium_only")) {
        violations.push(`${rel}: premium marker still present`);
    }
});

// Warn if a dist bundle is byte-identical to the root (premium) bundle —
// a sign the in-dist rebuild silently didn't run.
const distJs = path.join(DIST, "assets", "js");
const rootJs = path.join(ROOT, "assets", "js");
if (fs.existsSync(distJs) && fs.existsSync(rootJs)) {
    for (const name of ["settings.js", "common.js"]) {
        const a = path.join(distJs, name);
        const b = path.join(rootJs, name);
        if (fs.existsSync(a) && fs.existsSync(b)) {
            const same =
                fs.statSync(a).size === fs.statSync(b).size &&
                fs.readFileSync(a).equals(fs.readFileSync(b));
            if (same) {
                console.warn(
                    `  ⚠️  ${name} is identical to the root (premium) build — verify the in-dist rebuild ran.`
                );
            }
        }
    }
}

if (violations.length) {
    console.error("\n❌  Dist verification FAILED:\n");
    for (const v of violations) {
        console.error(`   - ${v}`);
    }
    process.exit(1);
}

console.log(`\n✅  ${path.basename(DIST)}/ cleaned and verified.\n`);
