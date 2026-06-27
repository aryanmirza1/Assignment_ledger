import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, LucideIcon } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme/theme';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: LucideIcon;
  onRightPress?: () => void;
};

export function AppHeader({ title, subtitle, onBack, rightIcon: RightIcon, onRightPress }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <TouchableOpacity style={styles.roundButton} onPress={onBack}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.logo}>
          <Text style={styles.logoText}>AL</Text>
        </View>
      )}
      {onBack ? (
        <View style={styles.logo}>
          <Text style={styles.logoText}>AL</Text>
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {RightIcon ? (
        <TouchableOpacity style={styles.roundButton} onPress={onRightPress}>
          <RightIcon size={22} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radii.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  logoText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 1,
  },
  roundButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadows.soft,
  },
  placeholder: {
    width: 24,
  },
});
