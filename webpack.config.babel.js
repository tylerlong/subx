export default {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    library: 'SubX',
    libraryTarget: 'umd',
    globalObject: 'this' // fix window undefined issue in node
  }
}
