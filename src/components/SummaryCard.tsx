import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme/theme';

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'dark';
  onPress?: () => void;
};

const toneColors = {
  blue: colors.primary,
  green: colors.accent,
  orange: colors.warning,
  red: colors.danger,
  dark: colors.navy,
};

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - spacing.md * 2 - spacing.md) / 2;

export function SummaryCard({ label, value, icon: Icon, tone = 'blue', onPress }: Props) {
  const toneColor = toneColors[tone];
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : undefined}>
      <View style={[styles.iconWrap, { backgroundColor: `${toneColor}16` }]}>
        <Icon color={toneColor} size={20} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    width: cardWidth,
    aspectRatio: 1,
    padding: spacing.md,
    justifyContent: 'center',
    ...shadows.soft,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 40,
  },
  value: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
