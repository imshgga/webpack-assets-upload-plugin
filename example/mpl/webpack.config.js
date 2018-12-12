const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UploadPlugin = require('../../index.js')

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, './'),
  entry: './src/main.js',
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './dist'),
    filename: 'dist.[hash:8].js',
  },
  devtool: 'eval-source-map',
  devServer: {
    compress: false,
    host: '0.0.0.0',
    port: 9000
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
      inject: true,
      chunksSortMode: 'dependency'
    }),
    new UploadPlugin({
      remotePath: '/you/taget/path',
      host: 'host',
      port: 'port || 22',
      username: 'username',
      password: 'password'
    })
  ]
}
