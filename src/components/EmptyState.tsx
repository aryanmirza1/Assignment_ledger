import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme/theme';
import { PrimaryButton } from './Buttons';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon color={colors.primary} size={34} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 54,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.pill,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
});
