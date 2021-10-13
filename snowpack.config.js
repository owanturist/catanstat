const fg = require('fast-glob')

module.exports = {
  mount: {
    public: '/',
    src: '/dist'
  },
  plugins: [
    ['snowpack-plugin-elm', { optimize: 'build' }],
    '@jadex/snowpack-plugin-tailwindcss-jit' // fix for https://github.com/tailwindlabs/tailwindcss/issues/3950
  ],
  exclude: ['**/node_modules/**/*', 'review/**/*.elm'],
  routes: [
    /* Enable an SPA Fallback in development: */
    {
      match: 'all',
      src: '(?!.*(.svg|.gif|.json|.jpg|.jpeg|.png|.js)).*',
      dest: '/index.html'
    }
  ],
  env: {
    NODE_ENV: process.env.NODE_ENV
  },
  devOptions: {
    open: 'none',
    port: 3000
  }
}
