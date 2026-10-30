// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    'postcss-preset-env': {
      // keep logical properties native: converting them to physical left/right broke every RTL layout
      features: {
        'nesting-rules': true,
        'logical-properties-and-values': false,
        'float-clear-logical-values': false,
        'logical-resize': false,
        'logical-overflow': false,
        'logical-overscroll-behavior': false,
        'logical-viewport-units': false,
      },
    },
  }
}