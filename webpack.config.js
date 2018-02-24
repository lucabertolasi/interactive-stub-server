const APP_NAME = 'Immediate JSON Stub';

const CleanWebpackPlugin  = require('clean-webpack-plugin');
const ExtractTextPlugin   = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin   = require('html-webpack-plugin');
const path                = require('path');
const UglifyJSPlugin      = require('uglifyjs-webpack-plugin');
const WebpackJsObfuscator = require('webpack-js-obfuscator');

const extractSass = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: process.env.NODE_ENV === 'development'
});

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './app.js'
  },
  module: {
    rules: [{
      test: /\.(s?)css$/,
      use: extractSass.extract({
        use: [{
          loader: 'css-loader' // translates CSS into CommonJS
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }],
        // use style-loader in development
        fallback: 'style-loader' // creates style nodes from JS strings
      })
    }]
  },
  plugins: [
    extractSass,
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      hash: true,
      cache: true,
      title: APP_NAME,
      template: './src/index.html',
      filename: './index.html', //relative to root of the application
    }),
    new UglifyJSPlugin(),
    // new WebpackJsObfuscator()
  ],
  // watch: true,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000,
    compress: true,
    open: true
  }
};
