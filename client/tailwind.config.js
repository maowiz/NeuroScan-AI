/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    primary: '#00fff2',
                    secondary: '#ff00ff',
                    accent: '#7c3aed',
                    dark: '#0a0a12',
                    darker: '#050508',
                    light: '#e2e8f0',
                    glass: 'rgba(255, 255, 255, 0.05)',
                    glassDark: 'rgba(10, 10, 18, 0.7)',
                }
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 255, 242, 0.5)',
                'neon-pink': '0 0 20px rgba(255, 0, 255, 0.5)',
                'neon-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
                'glow-cyan': '0 0 40px rgba(0, 255, 242, 0.3)',
                'glow-pink': '0 0 40px rgba(255, 0, 255, 0.3)',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 255, 242, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 255, 242, 1)' },
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
