import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'

const mode = process.env.NODE_ENV || 'development'

export default {
  mode,
  target: 'web',
  context: `${__dirname}/src`,
  entry: {
    background: './background',
    'content-scripts': './content-scripts'
  },
  output: {
    path: `${__dirname}/app/`,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(jpg|gif|png|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode)
      }
    }),
    new CopyWebpackPlugin([{
      from: 'manifest.json',
      transform: function (content, path) {
        return Buffer.from(JSON.stringify({
          ...JSON.parse(content.toString()),
          version: process.env.npm_package_version
        }))
      }
    }])
  ],
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '~~': `${__dirname}/`,
      '~': `${__dirname}/src/`
    }
  }
}
