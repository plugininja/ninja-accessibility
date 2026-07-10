/**
 * Strip Premium Script
 * ====================
 * Produces a "free" distribution of Ninja Accessibility by:
 *
 * 1. Copying the full plugin into dist-free/ (github mode) or
 *    dist-wporg/ (wporg mode).
 * 2. Removing any file whose name contains "__premium_only"
 *    (e.g. class-analytics__premium_only.php).
 * 3. Stripping PHP premium blocks:
 *      // @fs_premium_only
 *      ...
 *      // @end_fs_premium_only
 * 4. Stripping JS/TS premium blocks:
 *      /* <fs_premium_only> * /
 *      ...
 *      /* </fs_premium_only> * /
 * 5. In wporg mode only — also removes the Freemius folder and any
 *    Freemius bootstrap calls from the main plugin file.
 *
 * Usage:
 *   node scripts/strip-premium.js --mode=github   # → dist-free/
 *   node scripts/strip-premium.js --mode=wporg    # → dist-wporg/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
        const [k, v] = a.replace(/^--/, "").split("=");
        return [k, v ?? true];
    })
);

const MODE = args.mode ?? "github";
const DEST = MODE === "wporg" ? "dist-wporg" : "dist-free";
const DEST_PATH = path.resolve(ROOT, DEST);

// ─── Directories / files to exclude from the copy ───────────────────────────
const EXCLUDE_DIRS = new Set([
    "node_modules",
    ".git",
    ".github",
    ".claude",
    ".vscode",
    ".idea",
    "dist-free",
    "dist-wporg",
    "tests",
    // JS premium code is stripped from source/ and the bundles are REBUILT
    // inside the dist (see "free" / "wporg" npm scripts), so the dist needs
    // source/ in both modes. It also satisfies the WP.org human-readable
    // source requirement. clean-dist.js decides what ships in the final zip.
    ...(MODE === "wporg" ? ["freemius"] : []),
]);

const EXCLUDE_FILES = new Set([
    ".DS_Store",
    // Needed inside the dist to rebuild the free JS bundles; removed again
    // by scripts/clean-dist.js before zipping:
    //   webpack.prod.config.js, package.json, scripts/ …
    "webpack.dev.config.js",
    "package-lock.json",
    ".gitignore",
    ".eslintrc.cjs",
    ".eslintrc.json",
    "phpcs.xml.dist",
    "phpunit.xml.dist",
    ".php-cs-fixer.dist.php",
    "index copy.php",
    "WPORG-COMPLIANCE-REPORT.md",
    "ninja-accessibility.zip",
    "ninja-accessibility-free.zip",
]);

// ─── Premium-block regex patterns ────────────────────────────────────────────
// PHP: // @fs_premium_only … // @end_fs_premium_only
const PHP_PREMIUM_BLOCK = /\/\/ @fs_premium_only[\s\S]*?\/\/ @end_fs_premium_only\n?/gm;

// JS/TS: const JS_PREMIUM_BLOCK = /\/\* <fs_premium_only> \*\/[\s\S]*?\/\* <\/fs_premium_only> \*\/\n?/gm;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isPremiumFile(filePath) {
    return path.basename(filePath).includes("__premium_only");
}

function stripPhpPremiumBlocks(content) {
    return content.replace(PHP_PREMIUM_BLOCK, "");
}

function stripJsPremiumBlocks(content) {
    return content.replace(JS_PREMIUM_BLOCK, "");
}

function stripFreemiusFromMainFile(content) {
    // Remove the Freemius require_once line.
    content = content.replace(/.*require_once.*freemius.*\n/gi, "");
    // Remove pnpna_fs() function definitions and calls.
    content = content.replace(/\s*if \( function_exists\( '\\\\Pnpna\\\\pnpna_fs' \) \) \{[\s\S]*?^\}\n/m, "");
    // Remove pnpna_fs()->set_basename(…) guard block.
    content = content.replace(/if \( function_exists\( '\\\\Pnpna\\\\pnpna_fs' \) \) \{[\s\S]*?pnpna_fs\(\)\.set_basename[\s\S]*?^\} else \{/m, "");
    // Remove the closing brace that pairs with the else block removed above.
    content = content.replace(/^}\s*$\n?/m, "");
    return content;
}

// Only these extensions are read as text and run through the premium-block
// strippers. Everything else (fonts, images, .mo files, …) is copied
// byte-for-byte — reading binaries as UTF-8 corrupts them.
const TEXT_STRIP_EXTS = new Set([".php", ".js", ".ts", ".jsx", ".tsx", ".mts", ".cts"]);

function processFile(srcFile, destFile) {
    const ext = path.extname(srcFile).toLowerCase();

    fs.mkdirSync(path.dirname(destFile), { recursive: true });

    if (!TEXT_STRIP_EXTS.has(ext)) {
        fs.copyFileSync(srcFile, destFile);
        return;
    }

    let content = fs.readFileSync(srcFile, "utf8");

    if (ext === ".php") {
        content = stripPhpPremiumBlocks(content);
        if (MODE === "wporg" && path.basename(srcFile) === "ninja-accessibility.php") {
            content = stripFreemiusFromMainFile(content);
        }
    } else {
        content = stripJsPremiumBlocks(content);
    }

    fs.writeFileSync(destFile, content, "utf8");
}

function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        if (EXCLUDE_DIRS.has(entry.name) || EXCLUDE_FILES.has(entry.name)) {
            continue;
        }

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (isPremiumFile(srcPath)) {
            console.log(`  [skip premium] ${path.relative(ROOT, srcPath)}`);
            continue;
        }

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            processFile(srcPath, destPath);
        }
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\n🔪  Strip Premium → ${DEST}/ (mode: ${MODE})\n`);

// Clean destination.
if (fs.existsSync(DEST_PATH)) {
    fs.rmSync(DEST_PATH, { recursive: true, force: true });
}
fs.mkdirSync(DEST_PATH, { recursive: true });

copyDir(ROOT, DEST_PATH);

console.log(`\n✅  Done. Free distribution at: ${DEST_PATH}\n`);
