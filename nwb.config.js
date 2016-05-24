var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
  type: 'react-component',
  build: {
    externals: {
      'react': 'React'
    },
    global: 'WhyDidYouUpdate',
    jsNext: false,
    umd: true
  },
  webpack: {
    extra: {
      plugins: [
        new LodashModuleReplacementPlugin
      ]
    }
  }
}
