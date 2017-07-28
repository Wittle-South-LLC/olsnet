var webpack = require('webpack')
var path = require('path')
var WebpackChunkHash = require('webpack-chunk-hash')
var InlineChunkPlugin = require('html-webpack-inline-chunk-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var WebpackAutoInject = require('webpack-auto-inject-version')

// Should resolve to the docroot subdirectory of the working directory
var BUILD_DIR = path.resolve(__dirname, '../web')
// Should resolve to the src subdirectory of the working directory
var APP_DIR = path.resolve(__dirname, 'src')

process.traceDeprecation = true

var config = {
  // Root of the dependency tree, also known as the entry point for the
  // application. It is where webpack will start to find all dependencies
  entry: {
    'main': APP_DIR + '/index.jsx'
  },
  // Tell webpack about where the output should be, and how it should be
  // named
  output: {
    path: BUILD_DIR,
    // Filename template applies to all chunks, including vendor. Path is
    // prefixed to continue to allow all chunks to be stored in the same
    // directory.
    filename: '/js/[name].[chunkhash].js',
    // Chunk plugin suggests that .chunk. should be replace with .[chunkhash]. to
    // assist the browswer with understanding what it can cache. Right now that
    // is a potential future optimization, given how long it took to get this
    // configuration working.
    chunkFilename: '/js/[id].chunk.js'
  },
  // Resolve section helps webpack find code. My specific entries allow
  // import statements to skip including the file extensions.
  // Allows import statements to omit file suffixes for both js and .jsx files
  // There is currently no modules section, because it doesn't appear to be
  // needed
  resolve: {
    extensions: ['.js', '.jsx']
  },
  // Tells webpack to generate a source map for debugging. Could be hidden
  // behind a production switch, as the source map is not needed for
  // production
  devtool: 'source-map',
  // Setting for webpack-dev-server to make the browserHistory component of
  // react-router to work
  devServer: {
    historyApiFallback: true
  },
  plugins: [
    // Reads NODE_ENV from the environment where webpack is invoked, and replaces
    // process.env.NODE_ENV within application source with its value. Used to
    // define environment-specific behavior
    new webpack.DefinePlugin({
      'process.env': {
        // During build replace process.env.NODE_ENV with contents of NODE_ENV
        // environment variable present when webpack was run
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        // During build replace process.env.API_PATH with contents of API_PATH
        // environment variable present when webpack was run
        'API_PATH': JSON.stringify(process.env.API_PATH)
      }
    }),
    // Will auto-inject application version number from package.json, but
    // TODO: Fix regexp for updated bundle filename(s); this should be main(something)
    new WebpackAutoInject({autoIncrease: false, injectByTagFileRegex: /^bundle\.js$/}),
    // Should package all contents of node_modules (3rd party components) in a separate
    // chunk withe a filename prefixed with vendor
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor'],
      minChunks: function (module) {
        return module.context && module.context.indexOf('node_modules') !== -1
      }
    }),
    // Generates a hash token on each build of a bundle; should not change unless
    // source changes. Assists browsers with caching unchanged code between reloads
    new WebpackChunkHash(),
    // Updates HTML file during build, and will inject the <script> tag to include
    // both the main javascript file (continaing the applicatino) and vendor javascript
    // file (containing 3rd party code)
    new HtmlWebpackPlugin({
      template: APP_DIR + '/html/index.html',
      filename: BUILD_DIR + '/index.html',
      inject: true
    }),
    new webpack.ProvidePlugin({
      'FB': 'facebook'
    }),
    // Generates the manifest that identifies the specific builds of main and vendor
    // to embed in the HTML
    new InlineChunkPlugin({
      inlineChunks: ['manifest']
    })
  ],
  externals: {
    facebook: 'FB'
  },
  module: {
    loaders: [
      // Loader specification for JSX files that are not named routes
      // Note that this includes the required babel presets for react
      // and ES6 / ES2015, so a .babel_preset file is not required
      {
        test: /\.jsx$/,
        include: APP_DIR,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: ['react', 'es2015'],
          env: {
            development: {
              plugins: [
                ['react-intl', {
                  'messagesDir': './messages/'
                }]
              ]
            }
          }
        }
      },
      // Loader specification for .js files, assumes they are ES6 / ES2015
      {
        test: /\.js$/,
        include: APP_DIR,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.png$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.jpg$/,
        loader: 'file-loader'
      },
      {
        test: /\.gif$/,
        loader: 'file-loader'
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=[name].[ext]'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=[name].[ext]'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  }
}

module.exports = config
