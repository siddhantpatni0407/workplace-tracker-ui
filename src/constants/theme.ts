// src/constants/theme.ts

/**
 * Theme and styling constants
 * Centralized theme configuration for consistent UI
 */

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

// Color palette - Enhanced Red and Gray theme
export const COLORS = {
  // Primary colors - Enhanced Purple theme with better contrast
  PRIMARY: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',    // Main purple
    700: '#7c3aed',    // Darker purple
    800: '#6d28d9',
    900: '#581c87'
  },

  // Secondary colors - Enhanced Gray theme with warm undertones
  SECONDARY: {
    50: '#fafafa',     // Very light gray
    100: '#f5f5f5',    // Light gray
    200: '#e5e5e5',    // Light border gray
    300: '#d4d4d4',    // Medium light gray
    400: '#a3a3a3',    // Medium gray
    500: '#737373',    // Base gray
    600: '#525252',    // Dark gray
    700: '#404040',    // Darker gray
    800: '#262626',    // Very dark gray
    900: '#171717'     // Almost black
  },

  // Status colors
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  INFO: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  },

  // Neutral colors
  NEUTRAL: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  }
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_FAMILIES: {
    PRIMARY: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    SECONDARY: 'Georgia, "Times New Roman", serif',
    MONOSPACE: '"Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace'
  },

  FONT_SIZES: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
    '5XL': '3rem',    // 48px
    '6XL': '3.75rem', // 60px
    '7XL': '4.5rem',  // 72px
    '8XL': '6rem',    // 96px
    '9XL': '8rem'     // 128px
  },

  FONT_WEIGHTS: {
    THIN: 100,
    EXTRALIGHT: 200,
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
    BLACK: 900
  },

  LINE_HEIGHTS: {
    NONE: 1,
    TIGHT: 1.25,
    SNUG: 1.375,
    NORMAL: 1.5,
    RELAXED: 1.625,
    LOOSE: 2
  }
} as const;

// Spacing (based on 4px grid)
export const SPACING = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  7: '1.75rem',  // 28px
  8: '2rem',     // 32px
  9: '2.25rem',  // 36px
  10: '2.5rem',  // 40px
  11: '2.75rem', // 44px
  12: '3rem',    // 48px
  14: '3.5rem',  // 56px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  28: '7rem',    // 112px
  32: '8rem',    // 128px
  36: '9rem',    // 144px
  40: '10rem',   // 160px
  44: '11rem',   // 176px
  48: '12rem',   // 192px
  52: '13rem',   // 208px
  56: '14rem',   // 224px
  60: '15rem',   // 240px
  64: '16rem',   // 256px
  72: '18rem',   // 288px
  80: '20rem',   // 320px
  96: '24rem'    // 384px
} as const;

// Border radius
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  MD: '0.375rem',   // 6px
  LG: '0.5rem',     // 8px
  XL: '0.75rem',    // 12px
  '2XL': '1rem',    // 16px
  '3XL': '1.5rem',  // 24px
  FULL: '9999px'
} as const;

// Shadows
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  INNER: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
} as const;

// Component-specific styling
export const COMPONENT_STYLES = {
  BUTTON: {
    SIZES: {
      XS: { padding: '0.25rem 0.5rem', fontSize: TYPOGRAPHY.FONT_SIZES.XS },
      SM: { padding: '0.375rem 0.75rem', fontSize: TYPOGRAPHY.FONT_SIZES.SM },
      MD: { padding: '0.5rem 1rem', fontSize: TYPOGRAPHY.FONT_SIZES.BASE },
      LG: { padding: '0.75rem 1.5rem', fontSize: TYPOGRAPHY.FONT_SIZES.LG },
      XL: { padding: '1rem 2rem', fontSize: TYPOGRAPHY.FONT_SIZES.XL }
    },
    VARIANTS: {
      PRIMARY: { bg: COLORS.PRIMARY[600], text: 'white' },
      SECONDARY: { bg: COLORS.SECONDARY[100], text: COLORS.SECONDARY[900] },
      SUCCESS: { bg: COLORS.SUCCESS[600], text: 'white' },
      WARNING: { bg: COLORS.WARNING[500], text: 'white' },
      ERROR: { bg: COLORS.ERROR[600], text: 'white' },
      INFO: { bg: COLORS.INFO[600], text: 'white' }
    }
  },

  CARD: {
    DEFAULT: {
      background: 'white',
      border: `1px solid ${COLORS.NEUTRAL[200]}`,
      borderRadius: BORDER_RADIUS.LG,
      padding: SPACING[6],
      boxShadow: SHADOWS.SM
    }
  },

  INPUT: {
    DEFAULT: {
      padding: '0.5rem 0.75rem',
      border: `1px solid ${COLORS.NEUTRAL[300]}`,
      borderRadius: BORDER_RADIUS.MD,
      fontSize: TYPOGRAPHY.FONT_SIZES.BASE
    },
    FOCUS: {
      borderColor: COLORS.PRIMARY[500],
      boxShadow: `0 0 0 3px ${COLORS.PRIMARY[100]}`
    }
  }
} as const;

// CSS custom properties for dynamic theming
export const CSS_VARIABLES = {
  LIGHT: {
    '--color-bg-primary': COLORS.NEUTRAL[50],
    '--color-bg-secondary': 'white',
    '--color-text-primary': COLORS.NEUTRAL[900],
    '--color-text-secondary': COLORS.NEUTRAL[600],
    '--color-border': COLORS.NEUTRAL[200],
    '--color-accent': COLORS.PRIMARY[600]
  },
  DARK: {
    '--color-bg-primary': COLORS.NEUTRAL[900],
    '--color-bg-secondary': COLORS.NEUTRAL[800],
    '--color-text-primary': COLORS.NEUTRAL[100],
    '--color-text-secondary': COLORS.NEUTRAL[400],
    '--color-border': COLORS.NEUTRAL[700],
    '--color-accent': COLORS.PRIMARY[400]
  }
} as const;