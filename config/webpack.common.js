const webpack = require('webpack');
const helpers = require('./helpers');

/**
 * Webpack Plugins
 *
 * problem with copy-webpack-plugin
 */
const AssetsPlugin = require('assets-webpack-plugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');
//const PreloadWebpackPlugin = require('preload-webpack-plugin');

/**
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const METADATA = {
  title: 'Angular template',
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
      'main': AOT ? './src/main.browser.aot.ts' :
        './src/main.browser.ts'

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
              loader: 'ngc-webpack',
              options: {
                disable: !AOT,
              }
            },
            {
              loader: 'angular2-template-loader'
            }
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },
        {
          test: /\.css$/,
          use: ['to-string-loader', 'css-loader'],
          exclude: [helpers.root('src', 'styles')]
        },
        {
          test: /\.scss$/,
          use: ['to-string-loader', 'css-loader', 'sass-loader'],
          exclude: [helpers.root('src', 'styles')]
        },
        {
          test: /\.html$/,
          use: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
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
      // Use for DLLs
      // new AssetsPlugin({
      //   path: helpers.root('dist'),
      //   filename: 'webpack-assets.json',
      //   prettyPrint: true
      // }),
      // new CommonsChunkPlugin({
      //  1 name: 'vendor',
      //  Specify the correct order the scripts will be injected in
      //  2 name: ['polyfills', 'vendor'].reverse()
      //   chunks: ['main'],
      //   minChunks: module => /node_modules/.test(module.resource)
      // }),

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

      //new PreloadWebpackPlugin({
      //  rel: 'preload',
      //  as: 'script',
      //  include: ['polyfills', 'vendor', 'main'].reverse(),
      //  fileBlacklist: ['.css', '.map']
      //}),
      //new PreloadWebpackPlugin({
      //  rel: 'prefetch',
      //  as: 'script',
      //  include: 'asyncChunks'
      //}),

      new HtmlWebpackPlugin({
        template: 'src/index.html',
        title: METADATA.title,
        chunksSortMode: function (a, b) {
          const entryPoints = ["inline", "polyfills", "sw-register", "styles", "vendor", "main"];
          return entryPoints.indexOf(a.names[0]) - entryPoints.indexOf(b.names[0]);
        },
        metadata: METADATA,
        inject: 'body'
      }),
      new ScriptExtHtmlWebpackPlugin({
        sync: /polyfills|vendor/,
        defaultAttribute: 'async',
        preload: [/polyfills|vendor|main/],
        prefetch: [/chunk/]
      }),
      new HtmlElementsPlugin({
        headTags: require('./head-config.common')
      }),
      new LoaderOptionsPlugin({}),
      new ngcWebpack.NgcWebpackPlugin({
        disabled: !AOT,
        tsConfig: helpers.root('tsconfig.webpack.json'),
      }),
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
