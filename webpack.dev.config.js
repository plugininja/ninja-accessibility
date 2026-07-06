import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import CopyPlugin from "copy-webpack-plugin";
import { globSync } from "glob";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build dynamic entry points from the source folder root (ninja-drive pattern).
const entries = Object.fromEntries(
    globSync("./source/*.{ts,tsx,js}", {
        cwd: __dirname,
    }).map((file) => [
        path.basename(file).replace(/\.(tsx?|jsx?)$/, ""),
        path.resolve(__dirname, file),
    ]),
);

export default {
    ...defaultConfig,

    entry: entries,

    mode: "development",

    devtool: "eval-source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],

        alias: {
            "~": path.resolve(__dirname, "source"),
            "~kernel": path.resolve(__dirname, "source/kernel"),
            "~ui": path.resolve(__dirname, "source/ui"),
            "~shared": path.resolve(__dirname, "source/shared"),
            "~features": path.resolve(__dirname, "source/features"),
        },

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
            { test: /\.m?js$/, resolve: { fullySpecified: false } },
            ...(defaultConfig.module?.rules ?? []),
        ],
    },

    plugins: [
        ...(defaultConfig.plugins || []).filter(
            (plugin) => plugin.constructor.name !== "CleanWebpackPlugin",
        ),
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
                    from: path.resolve(
                        __dirname,
                        "node_modules/material-symbols/material-symbols-outlined.woff2",
                    ),
                    to: path.resolve(
                        __dirname,
                        "assets/fonts/material-symbols-outlined.woff2",
                    ),
                },
            ],
            options: {
                concurrency: 100,
            },
        }),
    ],
};
