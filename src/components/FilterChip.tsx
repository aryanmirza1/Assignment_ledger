import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme/theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function FilterChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.active]}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  active: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  text: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: colors.white,
  },
});
