module.exports = {
  type: 'react-component',
  build: {
    externals: {
      'react': 'React'
    },
    global: 'WhyDidYouUpdate',
    jsNext: false,
    umd: true
  }
}
