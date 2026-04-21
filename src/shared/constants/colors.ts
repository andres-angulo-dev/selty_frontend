export const Colors = {
    // ------------------------------
    // Primary colors (brand identity)
    // ------------------------------
    primary: {
      main: '#1E3A5F',       // Dark blue - main brand color
      light: '#2E5A8F',      // Lighter blue - hover states
      dark: '#0E2A4F',       // Darker blue - pressed states
    },

    // ------------------------------
    // Secondary colors (accents)
    // ------------------------------
    secondary: {
      main: '#4A90D9',       // Light blue - secondary actions
      light: '#6AAAF9',      // Lighter - hover
      dark: '#2A70B9',       // Darker - pressed
    },

    // ------------------------------
    // Neutral colors (backgrounds, text, borders)
    // ------------------------------
    neutral: {
      white: '#FFFFFF',
      background: '#FFFFFF', // Pure white background
      card: '#FFFFFF',       // Card background
      border: '#E1E5EB',     // Border color
      disabled: '#B0B8C4',   // Disabled state
      inputBg: '#F2F4F7',    // Search bar and input fields background
    },

    // ------------------------------
    // Text colors
    // ------------------------------
    text: {
      primary: '#1E1E1E',    // Main text
      secondary: '#666666',  // Secondary text
      secondaryBis: '#2A70B9',
      tertiary: '#999999',   // Placeholder, hints
      inverse: '#FFFFFF',    // Text on dark backgrounds
    },

    // ------------------------------
    // Semantic colors (feedback)
    // ------------------------------
    semantic: {
      success: '#28A745',
      error: '#DC3545',
      warning: '#FFC107',
      info: '#17A2B8',
    },

    // ------------------------------
    // Shadow tokens (cards on white background)
    // ------------------------------
    shadow: {
      card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
      strong: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      },
    },
} as const;

export type ColorKeys = keyof typeof Colors;