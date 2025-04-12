/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A4D2E', // Forest Green
        secondary: '#4F6F52', // Calming Teal
        background: '#F8F9FA', // Light Gray
        surface: '#FFFFFF', // White
        'text-primary': '#343A40', // Dark Charcoal
        'text-secondary': '#6C757D', // Medium Gray
        accent: '#E8C872', // Warm Gold
        'glass-border': 'rgba(255, 255, 255, 0.2)',
        // Define shades for glassmorphism background if needed, e.g.
        'glass-bg-light': 'rgba(255, 255, 255, 0.1)',
        'glass-bg-medium': 'rgba(255, 255, 255, 0.2)',
        'glass-bg-dark': 'rgba(255, 255, 255, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem', // Keep existing or adjust if needed
        'glass': '12px', // Example border radius for glass elements
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'], // Add Poppins for headings
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};