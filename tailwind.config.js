const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
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
    },
    keyframes: {
      glow: {
        '0%': {
          'background-position': '-200px 0'
        },
        '100%': {
          'background-position': 'calc(200px + 100%) 0'
        }
      }
    },
    animation: {
      glow: 'glow 1.2s ease-in-out infinite'
    }
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const COLOR_BASE = 'hsl(0 0% 86%)'
      const COLOR_GLOW = 'hsl(0 0% 96%)'

      addUtilities({
        '.animate-glow': {
          background: `${COLOR_BASE} no-repeat`,
          'background-size': '200px 100%',
          'background-image': `linear-gradient(
            90deg,
            ${COLOR_BASE},
            ${COLOR_GLOW},
            ${COLOR_BASE}
          )`
        }
      })
    })
  ]
}
