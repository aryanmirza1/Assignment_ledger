import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, onPress, icon: Icon, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled}
      onPress={onPress}
      style={[styles.primary, disabled && styles.disabled, style]}
    >
      {Icon ? <Icon color={colors.white} size={20} strokeWidth={2.4} /> : null}
      <Text style={styles.primaryText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress, icon: Icon, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled}
      onPress={onPress}
      style={[styles.secondary, disabled && styles.disabled, style]}
    >
      {Icon ? <Icon color={colors.primary} size={20} strokeWidth={2.4} /> : null}
      <Text style={styles.secondaryText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    ...shadows.soft,
  },
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondary: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.55,
  },
});
