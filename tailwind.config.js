module.exports = {
  content: ['./*.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.625rem', '0.75rem']
      }
    },
    screens: {
      '2xs': '375px',
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px'
    }
  }
}
