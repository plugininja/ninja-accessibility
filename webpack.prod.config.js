import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { globSync } from "glob";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ======================================================================
// Detect all entry files dynamically (top-level source entries only;
// kernel/, features/, ui/, shared/ are imported by entries, not compiled
// independently) — ninja-drive pattern adapted for TS entries.
// ======================================================================
const jsEntries = Object.fromEntries(
    globSync("./source/*.{ts,tsx,js}", {
        cwd: __dirname,
    }).map((file) => [
        path.basename(file).replace(/\.(tsx?|jsx?)$/, ""),
        path.resolve(__dirname, file),
    ]),
);

// ======================================================================
// Plugin: Prepend semicolon to avoid JS concatenation issues
// ======================================================================
class PrependSemicolonPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapAsync(
            "PrependSemicolonPlugin",
            (compilation, callback) => {
                try {
                    for (const filename in compilation.assets) {
                        if (
                            filename.endsWith(".js") &&
                            !filename.includes("runtime")
                        ) {
                            const asset = compilation.assets[filename];
                            // webpack-sources v3 may return Buffer — coerce to string
                            const original = String(asset.source());

                            // Only prepend if not already starting with semicolon
                            if (!original.trim().startsWith(";")) {
                                const updated = ";" + original;
                                compilation.assets[filename] = {
                                    source: () => updated,
                                    size: () =>
                                        Buffer.byteLength(updated, "utf8"),
                                    map: () =>
                                        typeof asset.map === "function"
                                            ? asset.map()
                                            : null,
                                };
                            }
                        }
                    }
                    callback();
                } catch (error) {
                    callback(error);
                }
            },
        );
    }
}

// ======================================================================
// Main Webpack Configuration
// ======================================================================
export default {
    ...defaultConfig,

    mode: "production",

    entry: jsEntries,

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],

        alias: {
            "~": path.resolve(__dirname, "source"),
            "~kernel": path.resolve(__dirname, "source/kernel"),
            "~ui": path.resolve(__dirname, "source/ui"),
            "~shared": path.resolve(__dirname, "source/shared"),
            "~features": path.resolve(__dirname, "source/features"),
        },

        // Allow imports without explicit extensions (e.g. './App' → './App.tsx').
        extensionAlias: {
            ".js": [".js", ".jsx", ".ts", ".tsx"],
        },
    },

    output: {
        path: path.resolve(__dirname, "assets/js"),
        filename: "[name].js",
        chunkFilename: "chunks/[name].chunk.js",
        clean: true,
    },

    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        join_vars: false,
                    },
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                    priority: -10,
                    enforce: true,
                },
                shared: {
                    name: "shared",
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
        runtimeChunk: "single",
    },

    module: {
        ...defaultConfig.module,
        rules: [
            // Allow ESM imports without explicit file extension (fullySpecified: false).
            { test: /\.m?js$/, resolve: { fullySpecified: false } },
            ...(defaultConfig.module?.rules ?? []),
        ],
    },

    plugins: [
        ...defaultConfig.plugins.filter(
            (plugin) => plugin.constructor.name !== "CleanWebpackPlugin",
        ),
        new PrependSemicolonPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "source/assets/images"),
                    to: path.resolve(__dirname, "assets/images"),
                    noErrorOnMissing: true,
                },
                {
                    from: path.resolve(__dirname, "source/assets/fonts"),
                    to: path.resolve(__dirname, "assets/fonts"),
                    noErrorOnMissing: true,
                },
                {
                    from: path.resolve(__dirname, "source/assets/plugins"),
                    to: path.resolve(__dirname, "assets/plugins"),
                    noErrorOnMissing: true,
                },
                // Material Symbols font is in source/assets/fonts (copied from node_modules)
                // and will be copied along with other fonts in source/assets/fonts
            ],
            options: {
                concurrency: 100,
            },
        }),
    ],
};
