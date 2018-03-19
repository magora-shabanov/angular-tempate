const helpers = require('./helpers');
const path = require('path');

console.log(path.resolve('src/styles'));

/**
 * Webpack Plugins
 */
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const METADATA = {
    title: '--title--',
    baseUrl: '/',
    isDevServer: helpers.isWebpackDevServer(),
    HMR: HMR,
    AOT: AOT
};

/**
 * Webpack configuration
 */
module.exports = function (options) {
    let isProd = options.env === 'production';
    return {
        //cache: false,
        entry: {
            'polyfills': './src/polyfills.browser.ts',
            'main': isProd ? './src/main.browser.prod.ts' :
                './src/main.browser.ts',
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            modules: [helpers.root('src'), helpers.root('node_modules')],

        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ng-router-loader',
                            options: {
                                loader: 'async-import',
                                genDir: 'compiled',
                                aot: AOT
                            }
                        },
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: 'tsconfig.webpack.json',
                                useCache: !isProd
                            }
                        },
                        {
                            loader: 'angular2-template-loader'
                        }
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },
                {
                    test: /\.styl$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'to-string-loader',
                        use: ['css-loader', 'stylus-loader']
                    }),
                    include: path.resolve('src/styles')
                },
                {
                    test: /\.styl$/,
                    use: ['to-string-loader', 'css-loader', 'stylus-loader'],
                    include: path.resolve('src/app')
                },
                {
                    test: /\.pug$/,
                    use: ['raw-loader', 'pug-html-loader']
                },
                {
                    test: /\.(jpg|png|gif)$/,
                    use: 'file-loader'
                },
                {
                    test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
                    use: 'file-loader'
                }

            ],

        },

        plugins: [
            new CheckerPlugin(),
            new CommonsChunkPlugin({
                name: 'polyfills',
                chunks: ['polyfills']
            }),
            new ContextReplacementPlugin(
                /(.+)?angular(\\|\/)core(.+)?/,
                helpers.root('src'), // location of your src
                {
                    /**
                     * Your Angular Async Route paths relative to this root directory
                     */
                }
            ),
            new CopyWebpackPlugin([
                    {from: 'src/assets', to: 'assets'},
                    {from: 'src/meta'}
                ],
                isProd ? {ignore: ['mock-data/**/*']} : undefined
            ),
            new ExtractTextPlugin('[name].css'),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
                chunksSortMode: function (a, b) {
                    const entryPoints = ["inline", "polyfills", "sw-register", "styles", "vendor", "main"];
                    return entryPoints.indexOf(a.names[0]) - entryPoints.indexOf(b.names[0]);
                },
                inject: 'app'
            }),
            new ScriptExtHtmlWebpackPlugin({
                sync: /polyfills|vendor/,
                defaultAttribute: 'async',
                preload: [/polyfills|vendor|main/],
                prefetch: [/chunk/]
            }),
            new LoaderOptionsPlugin({}),
            new InlineManifestWebpackPlugin(),
        ],
        node: {
            global: true,
            crypto: 'empty',
            process: true,
            module: false,
            clearImmediate: false,
            setImmediate: false
        }

    };
};