const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const PATHS = {
    entryPoint: path.resolve(__dirname, 'src/index.ts'),
    bundles: path.resolve(__dirname, 'dist'),
}

const config = {
    // These are the entry point of our library. We tell webpack to use
    // the name we assign later, when creating the bundle. We also use
    // the name to filter the second entry point for applying code
    // minification via UglifyJS
    entry: {
        'i18n-babel': {
            import: PATHS.entryPoint,
            library: {
                // all options under `output.library` can be used here
                name: 'Translator',
                type: 'umd',
                umdNamedDefine: true,
            },
        },
        'i18n-babel.esm': {
            import: PATHS.entryPoint,
            library: {
                // all options under `output.library` can be used here
                name: 'Translator',
                type: 'window',
                umdNamedDefine: true,
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
        filename: '[name].js',
        publicPath: '',
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
                { from: "examples/plain-js/all*", to: "" },
                {
                    from: "examples/plain-js/index.html",
                    transform: (content) => content.toString().replace(/https:\/\/unpkg.com\/i18n-babel\/dist/ig, ''),
                }
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 9000,
        watchFiles: ['lib/**/*.js', 'examples/plain-js/**/*'],
    },
};

module.exports = config;
