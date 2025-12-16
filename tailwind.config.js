// Tailwind config placeholder removed to avoid requiring tailwind during initial install.
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./pages/**/*.{js,jsx,ts,tsx}',
		'./components/**/*.{js,jsx,ts,tsx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
		colors: {
			brand: {
				DEFAULT: '#6366f1',
				dark: '#4f46e5'
			},
			accent: {
				DEFAULT: '#f97316',
				muted: '#fb923c'
			},
			glass: 'rgba(255,255,255,0.04)'
		},
		fontFamily: {
			sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
			mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
		}
	},
	},
	plugins: [],
}
