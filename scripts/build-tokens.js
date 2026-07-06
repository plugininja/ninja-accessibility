import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const TOKENS_PATH = path.resolve(ROOT, "tokens/index.json");
const SCSS_OUT_PATH = path.resolve(
    ROOT,
    "source/assets/sass/utilities/_tokens.scss",
);
const TS_OUT_PATH = path.resolve(ROOT, "source/kernel/types/tokens.ts");
const STYLES_OUT_PATH = path.resolve(ROOT, "source/kernel/types/styles.ts");

function cssVarName(group, segments) {
    switch (group) {
        case "color":
            return `--pnpna-${segments.slice(2).join("-")}`;
        case "spacing":
            return `--pnpna-space-${segments.slice(1).join("-")}`;
        case "typography": {
            const map = { size: "font-size", weight: "font-weight" };
            if (segments.length === 2) {
                return `--pnpna-${segments[1]}`;
            }
            const prefix = map[segments[1]] || segments[1];
            return `--pnpna-${prefix}-${segments.slice(2).join("-")}`;
        }
        case "border":
            return `--pnpna-${segments.slice(1).join("-")}`;
        case "breakpoint":
            return `--pnpna-breakpoint-${segments.slice(1).join("-")}`;
        case "transition":
            return `--pnpna-transition-${segments.slice(1).join("-")}`;
        default:
            return `--pnpna-${segments.slice(1).join("-")}`;
    }
}

function flattenTokens(obj, pathSegments = []) {
    const results = [];

    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && typeof value === "object") {
            if ("value" in value) {
                results.push({
                    path: [...pathSegments, key],
                    value: value.value,
                    kind: "simple",
                });
            } else if ("light" in value && "dark" in value) {
                results.push({
                    path: [...pathSegments, key],
                    light: value.light,
                    dark: value.dark,
                    kind: "themeable",
                });
            } else {
                results.push(...flattenTokens(value, [...pathSegments, key]));
            }
        }
    }

    return results;
}

function generateScss(tokens) {
    const lines = [
        "// ================================================================",
        "// AUTO-GENERATED from tokens/index.json — DO NOT EDIT DIRECTLY",
        "// Run `npm run build:tokens` to regenerate",
        "// ================================================================",
        "",
        "// Default (light) theme",
        ":root {",
    ];

    const darkLines = [
        "",
        "// Dark theme overrides",
        '[pnpna-theme-status="dark"] {',
    ];

    const lightLines = [
        "",
        "// Light theme overrides (for scoped light elements inside dark parent)",
        '[pnpna-theme-status="light"] {',
    ];

    for (const token of tokens) {
        const name = cssVarName(token.path[0], token.path);

        if (token.kind === "simple") {
            lines.push(`    ${name}: ${token.value};`);
        } else {
            lines.push(`    ${name}: ${token.light};`);
            darkLines.push(`    ${name}: ${token.dark};`);
            lightLines.push(`    ${name}: ${token.light};`);
        }
    }

    lines.push("}");
    darkLines.push("}");
    lightLines.push("}");

    return [...lines, ...darkLines, ...lightLines, ""].join("\n");
}

function generateTypescript(tokens) {
    const entries = [];

    for (const token of tokens) {
        const name = cssVarName(token.path[0], token.path);
        const tsKey = name
            .replace("--pnpna-", "")
            .replace(/-/g, "_")
            .toUpperCase();

        entries.push(`    ${tsKey}: "${name}"`);
    }

    return [
        "// ================================================================",
        "// AUTO-GENERATED from tokens/index.json — DO NOT EDIT DIRECTLY",
        "// Run `npm run build:tokens` to regenerate",
        "// ================================================================",
        "",
        "export const CSS_VAR = {",
        entries.join(",\n"),
        "} as const;",
        "",
        "export type CssVarKey = keyof typeof CSS_VAR;",
        "",
        "export type CssVarValue = (typeof CSS_VAR)[CssVarKey];",
        "",
    ].join("\n");
}

function generateStyleTypes(tokens) {
    // Helper to extract type values from token category
    // For color.* tokens, path is ['color', subcategory, name]
    // For border.radius.* tokens, path is ['border', 'radius', name]
    // We want just the name part (skip first 2 elements)
    function extractType(category, subcategory = null) {
        return tokens
            .filter((t) => {
                if (subcategory) {
                    return t.path[0] === category && t.path[1] === subcategory;
                }
                return t.path[0] === category;
            })
            .map((t) => {
                // For color tokens, skip 'color' + subcategory (first 2 elements)
                // For others like border.radius, skip 'border' + 'radius' (first 2 elements)
                const name = t.path.slice(2).join("-");
                return `"${name}"`;
            });
    }

    // Extract all types from tokens
    const colors = extractType("color");
    const radii = extractType("border", "radius");
    const borderStyles = extractType("border", "style");
    const fontSizes = extractType("typography", "size");
    const fontWeights = extractType("typography", "weight");
    const sizes = extractType("layout", "size");
    const aligns = extractType("layout", "align");
    const inlineAligns = extractType("layout", "inline-align");
    const textAligns = extractType("layout", "text-align");
    const textTransforms = extractType("layout", "text-transform");

    return [
        "// ================================================================",
        "// AUTO-GENERATED from tokens/index.json — DO NOT EDIT DIRECTLY",
        "// Run `npm run build:tokens` to regenerate",
        "// ================================================================",
        "",
        "// Color types - auto-generated from color.* tokens",
        "type Color =",
        `    | ${colors.join("\n    | ")};`,
        "",
        "export type TextColor = Color;",
        "",
        "export type BackgroundColor = Color;",
        "",
        "export type BorderColor = Color;",
        "",
        "// Border radius types - auto-generated from border.radius.* tokens",
        "export type BorderRadius =",
        `    | ${radii.join("\n    | ")};`,
        "",
        "// Border style types - auto-generated from border.style.* tokens",
        "export type BorderStyle =",
        `    | ${borderStyles.join("\n    | ")};`,
        "",
        "// Font size types - auto-generated from typography.size.* tokens",
        "export type FontSize =",
        `    | ${fontSizes.join("\n    | ")}`,
        "    | \"inherit\";",
        "",
        "// Font weight types - auto-generated from typography.weight.* tokens",
        "export type FontWeight =",
        `    | ${fontWeights.join("\n    | ")}`,
        "    | \"inherit\";",
        "",
        "// Size types - auto-generated from layout.size.* tokens",
        "export type Size =",
        `    | ${sizes.join("\n    | ")};`,
        "",
        "// Align types - auto-generated from layout.align.* tokens",
        "export type Align =",
        `    | ${aligns.join("\n    | ")};`,
        "",
        "// InlineAlign types - auto-generated from layout.inline-align.* tokens",
        "export type InlineAlign =",
        `    | ${inlineAligns.join("\n    | ")};`,
        "",
        "export type BlockAlign = InlineAlign;",
        "",
        "// TextAlign types - auto-generated from layout.text-align.* tokens",
        "export type TextAlign =",
        `    | ${textAligns.join("\n    | ")};`,
        "",
        "// TextTransform types - auto-generated from layout.text-transform.* tokens",
        "export type TextTransform =",
        `    | ${textTransforms.join("\n    | ")};`,
        "",
    ].join("\n");
}

function main() {
    console.log("🔧 Building design tokens...");

    if (!fs.existsSync(TOKENS_PATH)) {
        console.error(`❌ Tokens file not found: ${TOKENS_PATH}`);
        process.exit(1);
    }

    const raw = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf-8"));
    const tokens = flattenTokens(raw);

    console.log(`   Found ${tokens.length} tokens`);

    const scss = generateScss(tokens);
    fs.mkdirSync(path.dirname(SCSS_OUT_PATH), { recursive: true });
    fs.writeFileSync(SCSS_OUT_PATH, scss, "utf-8");
    console.log(`   ✓ ${SCSS_OUT_PATH}`);

    const ts = generateTypescript(tokens);
    fs.mkdirSync(path.dirname(TS_OUT_PATH), { recursive: true });
    fs.writeFileSync(TS_OUT_PATH, ts, "utf-8");
    console.log(`   ✓ ${TS_OUT_PATH}`);

    const stylesTs = generateStyleTypes(tokens);
    fs.mkdirSync(path.dirname(STYLES_OUT_PATH), { recursive: true });
    fs.writeFileSync(STYLES_OUT_PATH, stylesTs, "utf-8");
    console.log(`   ✓ ${STYLES_OUT_PATH}`);

    console.log("✅ Token build complete");
}

main();
