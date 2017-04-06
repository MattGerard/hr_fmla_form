const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {
  const isProduction = env.production === true;

  const entry = isProduction
    ? ['./src/index.js']
    : [
        './src/index.js',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:8080'
      ];

  const extractCSS = new ExtractTextPlugin({
    filename: './css/style-[contenthash:10].css',
    disable: !isProduction
  });

  const plugins = isProduction
    ? [
        new webpack.optimize.UglifyJsPlugin(),
        new HTMLWebpackPlugin({
          template: 'index-template.html'
        }),
        extractCSS
      ]
    : [new webpack.HotModuleReplacementPlugin(), extractCSS];

  return {
    externals: {
      jquery: 'jQuery' //jquery is a vendor file, avail. as global const.
    },
    devtool: 'source-map',
    entry: entry,
    plugins: plugins,
    module: {
      rules: [
        {
          test: /\.js$/,
          loaders: ['babel-loader?compact=false'],
          exclude: '/node_modules/'
        },
        {
          test: /\.(png|jpg|gif)$/,
          loaders: ['url-loader?limit=10000&name=img/[hash:12].[ext]'],
          exclude: '/node_modules/'
        },
        {
          test: /\.css$/,
          use: extractCSS.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: function() {
                    return [
                      require('precss'),
                      require('postcss-cssnext')({
                        browsers: ['last 2 versions', '> 5%']
                      })
                    ];
                  }
                }
              }
            ],
            // use style-loader in development
            fallback: 'style-loader'
          }),
          exclude: '/node_modules/'
        }
      ]
    },
    output: {
      path: path.join(__dirname, './dist/'),
      publicPath: isProduction ? '/' : '/dist/',
      filename: isProduction ? 'bundle.[hash:12].min.js' : 'bundle.js',
      chunkFilename: 'bundle-[name]-[chunkhash].js'
    }
  };
};
