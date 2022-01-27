const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const PATHS = {
    entryPoint: path.resolve(__dirname, 'src/index.ts'),
    bundles: path.resolve(__dirname, 'dist'),
}

const devConfig = require('./webpack.config.dev');

const config = {
    // These are the entry point of our library. We tell webpack to use
    // the name we assign later, when creating the bundle. We also use
    // the name to filter the second entry point for applying code
    // minification via UglifyJS
    entry: {
        'i18n-babel': {
            import: PATHS.entryPoint,
            library: {
                name: 'Translator',
                type: 'umd',
                umdNamedDefine: true,
                export: 'Translator',
            },
        },
        'i18n-babel.esm': {
            import: PATHS.entryPoint,
            library: {
                name: 'Translator',
                type: 'window',
                export: 'Translator',
            },
        }
    },
    // The output defines how and where we want the bundles. The special
    // value `[name]` in `filename` tell Webpack to use the name we defined above.
    // We target a UMD and name it Translator. When including the bundle in the browser
    // it will be accessible at `window.Translator`
    output: {
        path: PATHS.bundles,
        filename: '[name].min.js',
        libraryTarget: 'umd',
        library: 'Translator',
        umdNamedDefine: true,
    },
    // Add resolve for `tsx` and `ts` files, otherwise Webpack would
    // only look for common JavaScript file extension (.js)
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    // Activate source maps for the bundles in order to preserve the original
    // source when the user debugs the application
    devtool: 'source-map',
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/components.d.ts" },
                { from: "lib/index.d.ts" },
                { from: "lib/translator.d.ts" },
                { from: "lib/types.d.ts" },
                { from: "lib/**/*.js", to: "esm/[name][ext]" }
            ],
        }),
        new CompressionPlugin({
            test: /i18n-babel.*\.js(\?.*)?$/i,
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ test: /i18n-babel.*\.js(\?.*)?$/i })],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        return devConfig;
    }

    return config;
};
