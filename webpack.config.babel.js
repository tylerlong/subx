export default {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    library: 'SubX',
    libraryTarget: 'umd',
    globalObject: 'this' // fix window undefined issue in node
  },
  externals: {
    rxjs: {
      commonjs: 'rxjs',
      commonjs2: 'rxjs',
      amd: 'rxjs',
      root: 'rxjs'
    }
  }
}
