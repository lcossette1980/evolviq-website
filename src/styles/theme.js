/**
 * Centralized theme configuration for EvolvIQ
 * Provides consistent design tokens and utility classes
 */

// Core brand colors
export const colors = {
  // Primary brand colors
  charcoal: '#2A2A2A',
  chestnut: '#A44A3F', 
  khaki: '#A59E8C',
  pearl: '#D7CEB2',
  bone: '#F5F2EA',
  navy: '#2C3E50',

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B', 
  error: '#EF4444',
  info: '#3B82F6',

  // Neutral grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};

// Typography scale
export const typography = {
  fontFamily: {
    serif: ['Playfair Display', 'serif'],
    sans: ['Lato', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }]
  }
};

// Spacing scale
export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem'
};

// Component-specific design tokens
export const components = {
  button: {
    // Primary button (chestnut)
    primary: 'bg-chestnut text-white hover:bg-chestnut/90 transition-colors font-medium rounded-lg px-6 py-3 shadow-sm hover:shadow-md',
    
    // Secondary button (outline)
    secondary: 'border-2 border-chestnut text-chestnut hover:bg-chestnut hover:text-white transition-colors font-medium rounded-lg px-6 py-3',
    
    // Tertiary button (ghost)
    tertiary: 'text-chestnut hover:bg-chestnut/5 transition-colors font-medium rounded-lg px-6 py-3',
    
    // Danger button
    danger: 'bg-red-500 text-white hover:bg-red-600 transition-colors font-medium rounded-lg px-6 py-3',
    
    // Small size variants
    small: {
      primary: 'bg-chestnut text-white hover:bg-chestnut/90 transition-colors font-medium rounded-md px-4 py-2 text-sm',
      secondary: 'border border-chestnut text-chestnut hover:bg-chestnut hover:text-white transition-colors font-medium rounded-md px-4 py-2 text-sm'
    },
    
    // Large size variants  
    large: {
      primary: 'bg-chestnut text-white hover:bg-chestnut/90 transition-colors font-medium rounded-lg px-8 py-4 text-lg',
      secondary: 'border-2 border-chestnut text-chestnut hover:bg-chestnut hover:text-white transition-colors font-medium rounded-lg px-8 py-4 text-lg'
    }
  },

  card: {
    base: 'bg-white rounded-xl shadow-sm border border-gray-200',
    interactive: 'bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer',
    elevated: 'bg-white rounded-xl shadow-lg border border-gray-200'
  },

  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent transition-colors',
    error: 'w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors',
    large: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent transition-colors text-lg'
  },

  badge: {
    primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-chestnut text-white',
    secondary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  },

  navigation: {
    link: 'font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:text-chestnut hover:bg-chestnut/5',
    linkActive: 'font-medium transition-all duration-200 px-3 py-2 rounded-lg text-chestnut bg-chestnut/5 relative',
    mobile: 'block px-4 py-4 text-base font-medium w-full text-left rounded-lg transition-colors hover:text-chestnut hover:bg-chestnut/5'
  },

  assessment: {
    container: 'max-w-4xl mx-auto space-y-6 px-4',
    stepIndicator: 'flex justify-center items-center space-x-2 mb-8',
    questionCard: 'bg-white rounded-xl p-6 shadow-sm',
    progressBar: 'w-full bg-gray-200 rounded-full h-2',
    progressFill: 'bg-chestnut h-2 rounded-full transition-all duration-300'
  },

  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    container: 'bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto',
    header: 'bg-gradient-to-r from-chestnut to-chestnut/80 text-white p-8 relative',
    body: 'p-8'
  }
};

// Layout utilities
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerSmall: 'max-w-4xl mx-auto px-4 sm:px-6',
  section: 'py-12 sm:py-16 lg:py-20',
  sectionSmall: 'py-8 sm:py-12',
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-1 md:grid-cols-2',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center'
  }
};

// Animation utilities
export const animations = {
  transition: 'transition-all duration-200 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  fadeIn: 'animate-fadeIn',
  slideIn: 'animate-slideIn',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
};

// Responsive utilities
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Export all theme tokens
export const theme = {
  colors,
  typography,
  spacing,
  components,
  layout,
  animations,
  breakpoints
};

export default theme;