const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = env => {
  const PRODUCTION = env.ENV === 'production'
  const DEVELOPMENT = env.ENV === 'development'

  return {
    entry: path.resolve('./index.js'),

    output: {
      path: path.resolve('./build'),
      filename: '[name]-[hash].js',
      publicPath: '/'
    },

    resolve: {
      extensions: ['.js']
    },

    module: {
      noParse: /\.elm$/,
      rules: [
        {
          test: /\.elm$/,
          exclude: [/elm-stuff/, /node_modules/],
          use: {
            loader: 'elm-webpack-loader',
            options: DEVELOPMENT
              ? {
                  debug: true
                }
              : {
                  optimize: true
                }
          }
        }
      ]
    },

    devServer: {
      historyApiFallback: true
    },

    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(PRODUCTION),
        DEVELOPMENT: JSON.stringify(DEVELOPMENT)
      }),
      new HtmlWebpackPlugin({
        template: path.resolve('./index.html'),
        inject: 'body',
        minify: PRODUCTION && {
          caseSensitive: true,
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true,
          quoteCharacter: '"',
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          useShortDoctype: true
        }
      })
    ],

    devtool: PRODUCTION ? false : 'eval-source-map',

    mode: PRODUCTION ? 'production' : 'development',

    optimization: {
      minimize: PRODUCTION
    }
  }
}
