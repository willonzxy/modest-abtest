module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false
      }
    ]
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        corejs: {
          version: 3,
          proposals: true
        }
      }
    ]
  ],
  // 禁止中文转义成Unicode编码
  generatorOpts: {
    jsescOption: {
      minimal: true
    }
  }
};
