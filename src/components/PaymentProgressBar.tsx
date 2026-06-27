import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme/theme';

type Props = {
  paid: number;
  total: number;
};

export function PaymentProgressBar({ paid, total }: Props) {
  const percent = total <= 0 ? 0 : Math.min(100, Math.max(0, (paid / total) * 100));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.pill,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    height: '100%',
  },
});
