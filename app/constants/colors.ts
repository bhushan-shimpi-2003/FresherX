// FresherX Color Palette
// A curated, modern palette with brand identity

export const palette = {
  // Brand
  primary: '#6C63FF',       // Indigo-violet — brand identity
  primaryLight: '#8B85FF',
  primaryDark: '#4B44CC',

  secondary: '#FF6584',     // Coral pink — accent
  secondaryLight: '#FF8FA3',
  secondaryDark: '#CC4D67',

  accent: '#43D9AD',        // Mint green — success/match
  accentLight: '#6FE5C0',
  accentDark: '#2DB88E',

  // Neutrals
  black: '#0A0A0F',
  darkBg: '#12121A',
  darkCard: '#1C1C28',
  darkBorder: '#2A2A3D',
  darkMuted: '#3A3A55',

  white: '#FFFFFF',
  lightBg: '#F5F5FF',
  lightCard: '#FFFFFF',
  lightBorder: '#E8E8F0',
  lightMuted: '#C8C8D8',

  // Text
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#9898B8',
  textMutedDark: '#5A5A7A',

  textPrimaryLight: '#0A0A1F',
  textSecondaryLight: '#4A4A6A',
  textMutedLight: '#8A8AAA',

  // Status
  success: '#43D9AD',
  successBg: 'rgba(67, 217, 173, 0.12)',
  warning: '#FFB84D',
  warningBg: 'rgba(255, 184, 77, 0.12)',
  error: '#FF5E5E',
  errorBg: 'rgba(255, 94, 94, 0.12)',
  info: '#4DAFFF',
  infoBg: 'rgba(77, 175, 255, 0.12)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#6C63FF', '#4B44CC'] as [string, string],
  gradientAccent: ['#FF6584', '#6C63FF'] as [string, string],
  gradientSuccess: ['#43D9AD', '#4DAFFF'] as [string, string],
  gradientDark: ['#1C1C28', '#12121A'] as [string, string],

  // Transparent
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.3)',
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',
} as const;

export type ColorKey = keyof typeof palette;
