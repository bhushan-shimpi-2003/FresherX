import { palette } from '../constants/colors';
import { fontFamily, fontSize } from '../constants/typography';
import { borderRadius, spacing } from '../constants/spacing';

export const lightTheme = {
  dark: false,
  colors: {
    // Backgrounds
    background: palette.lightBg,
    card: palette.lightCard,
    border: palette.lightBorder,
    muted: palette.lightMuted,

    // Text
    text: palette.textPrimaryLight,
    textSecondary: palette.textSecondaryLight,
    textMuted: palette.textMutedLight,

    // Brand
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,
    secondary: palette.secondary,
    accent: palette.accent,

    // Status
    success: palette.success,
    successBg: palette.successBg,
    warning: palette.warning,
    warningBg: palette.warningBg,
    error: palette.error,
    errorBg: palette.errorBg,
    info: palette.info,
    infoBg: palette.infoBg,

    // Overlay / Glass
    overlay: palette.overlay,
    glass: 'rgba(255,255,255,0.6)',
    glassBorder: 'rgba(108,99,255,0.15)',

    // Tab bar
    tabBar: palette.lightCard,
    tabBarBorder: palette.lightBorder,
    tabBarActive: palette.primary,
    tabBarInactive: palette.textMutedLight,
  },
  typography: { fontFamily, fontSize },
  spacing,
  borderRadius,
} as const;

export type Theme = typeof lightTheme;
