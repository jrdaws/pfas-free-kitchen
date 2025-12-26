/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			// HubSpot Adapted Color Scheme - Orange primary, Navy secondary
  			brand: {
  				primary: '#F97316',      // orange-500 (the star!)
  				secondary: '#1E3A5F',    // deep navy
  				success: '#10B981',      // emerald-500
  				light: '#FFFFFF',        // pure white
  				dark: '#1C1917',         // near-black
  				muted: '#64748B',        // slate gray
  				'muted-light': '#94A3B8' // slate-400
  			},
  			// Navy palette for secondary actions
  			navy: {
  				50: '#F0F4F8',
  				100: '#E1E8F0',
  				200: '#C3D0E0',
  				300: '#8BA3BD',
  				400: '#5C7A99',
  				500: '#2C4A73',
  				600: '#1E3A5F',
  				700: '#15294a',
  				800: '#0D1A30',
  				900: '#080F1A',
  			},
  			// Orange palette for primary actions
  			orange: {
  				50: '#FFF7ED',
  				100: '#FFEDD5',
  				200: '#FED7AA',
  				300: '#FDBA74',
  				400: '#FB923C',
  				500: '#F97316',
  				600: '#EA580C',
  				700: '#C2410C',
  				800: '#9A3412',
  				900: '#7C2D12',
  			},
  			terminal: {
  				bg: '#1E293B',           // slate-800
  				header: '#334155',       // slate-700
  				text: '#94A3B8',         // slate-400
  				bright: '#E2E8F0',       // slate-200
  				prompt: '#F97316',       // orange-500
  				success: '#10B981',      // emerald-500
  				error: '#EF4444',
  				warning: '#F59E0B'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			// Extended foreground colors for theme system
  			'foreground-secondary': 'hsl(var(--foreground-secondary))',
  			'foreground-muted': 'hsl(var(--foreground-muted))',
  			// Success/Warning/Destructive
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			// Primary hover
  			'primary-hover': 'hsl(var(--primary-hover))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			mono: [
  				'JetBrains Mono',
  				'SF Mono',
  				'Courier New',
  				'monospace'
  			],
  			sans: [
  				'DM Sans',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			],
  			display: [
  				'DM Sans',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			]
  		},
  		animation: {
  			blink: 'blink 1s step-end infinite',
  			'fade-in': 'fadeIn 0.5s ease-out forwards',
  			'slide-up': 'slideUp 0.6s ease-out forwards',
  			float: 'float 6s ease-in-out infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			blink: {
  				'0%, 50%': {
  					opacity: '1'
  				},
  				'51%, 100%': {
  					opacity: '0'
  				}
  			},
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		}
  	}
  },
  plugins: [],
}
