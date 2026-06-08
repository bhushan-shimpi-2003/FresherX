import { palette } from '../constants/colors';
import { fontFamily, fontSize } from '../constants/typography';
import { borderRadius, spacing } from '../constants/spacing';

export const darkTheme = {
  dark: true,
  colors: {
    // Backgrounds
    background: palette.darkBg,
    card: palette.darkCard,
    border: palette.darkBorder,
    muted: palette.darkMuted,

    // Text
    text: palette.textPrimaryDark,
    textSecondary: palette.textSecondaryDark,
    textMuted: palette.textMutedDark,

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
    glass: palette.glass,
    glassBorder: palette.glassBorder,

    // Tab bar
    tabBar: palette.darkCard,
    tabBarBorder: palette.darkBorder,
    tabBarActive: palette.primary,
    tabBarInactive: palette.textMutedDark,
  },
  typography: { fontFamily, fontSize },
  spacing,
  borderRadius,
} as const;

export type Theme = typeof darkTheme;
