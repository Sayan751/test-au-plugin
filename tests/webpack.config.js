const { ProvidePlugin } = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { AureliaPlugin, ModuleDependenciesPlugin } = require("aurelia-webpack-plugin");

function getAureliaMainPath(isTest, testDir, srcDir) {
  return isTest ? path.resolve(testDir, "./main") : path.resolve(srcDir, "./main");
}


// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || [];
const when = (condition, config, negativeConfig) => condition ? ensureArray(config) : ensureArray(negativeConfig);

const baseUrl = "/";
const cssRules = [{
    loader: "css-loader",
    options: {
      // We want to use css-modules!!
      modules: true,
      // Number of loaders applied before CSS loader. We want to use one loader (postcss-loader) before css-loader, hence 1
      importLoaders: 1,
      localIdentName: "[name]__[local]___[hash:base64:5]"
    }
  },
  {
    loader: "postcss-loader",
    options: { plugins: () => [ require("autoprefixer")({ browsers: ["last 2 versions"] }) ] }
  }
];

module.exports = (
    { production, server, srcDir, outDir, testDir, isTest, auMain, auIncludeAll, auModuleDependencies, alias, title } = { isTest: false, auModuleDependencies: {}}
  ) => ({

  mode: production ? "production" : "development",
  entry: {
    app: ["aurelia-bootstrapper"]
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: [srcDir, "node_modules"],
    symlinks: false,
    alias
  },
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? "[name].[chunkhash].js" : "[name].[hash].js",
    sourceMapFilename: production ? "[name].[chunkhash].bundle.map" : "[name].[hash].bundle.map",
    chunkFilename: production ? "[name].[chunkhash].js" : "[name].[hash].js"
  },
  devServer: {
    contentBase: outDir,
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true
  },
  devtool: production ? undefined : "cheap-module-eval-source-map",
  optimization: !isTest ? {
    minimize: !!production,
    splitChunks: {
      chunks: "all",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
        },
        default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
        }
      }
    }
  }:undefined,
  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      { test: /\.css$/i, issuer: [{ not: [{ test: /\.html$/i }] }], use: ["style-loader", ...cssRules] },

      // CSS required in templates cannot be extracted safely
      // because Aurelia would try to require it again in runtime
      { test: /\.css$/i, issuer: [{ test: /\.html$/i }], use: [ "css-loader" ] },
      { test: /app\.scss$/, loaders: ["style-loader", "css-loader", "sass-loader"] },
      ...when(isTest,
          [
            { test: /\.ts$/i, loader: ['istanbul-instrumenter-loader', "ts-loader"], include: srcDir, },
            { test: /\.ts$/i, loader: "ts-loader", include: testDir }
          ],
          [ { test: /\.ts$/i, loader: ["ts-loader"],include: srcDir } ]),
      { test: /\.html$/i, loader: "html-loader" },
      { test: /\.(png|gif|jpg|cur)$/i, loader: "url-loader", options: { limit: 8192 } },      
      { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: "url-loader", options: { limit: 10000, mimetype: "application/font-woff2" } },
      { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: "url-loader", options: { limit: 10000, mimetype: "application/font-woff" } },      
      { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: "file-loader" },
      { test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/, loader: 'expose-loader?Promise' },
    ]
  },

  plugins: [
    new AureliaPlugin({aureliaApp: auMain || getAureliaMainPath(isTest, testDir, srcDir), includeAll: auIncludeAll}),
    new ModuleDependenciesPlugin(({ ...(isTest ? { 'aurelia-testing': ['./compile-spy', './view-spy'] } : {}), auModuleDependencies })),
    new ProvidePlugin({ 
      'Promise': 'bluebird',
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
    ...when(!isTest, 
      new HtmlWebpackPlugin({
        template: "index.ejs",
        minify: production ? {
          removeComments: true,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          minifyCSS: true,
          minifyJS: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          ignoreCustomFragments: [/\${.*?}/g]
        } : undefined,
        metadata: {
          // available in index.ejs //
          title,
          server,
          baseUrl
        }
      }), []
    )
  ]
});