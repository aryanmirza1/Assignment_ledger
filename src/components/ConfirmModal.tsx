import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { PrimaryButton, SecondaryButton } from './Buttons';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <SecondaryButton title={cancelLabel} onPress={onCancel} style={styles.action} />
            <PrimaryButton
              title={confirmLabel}
              onPress={onConfirm}
              style={[styles.action, destructive && styles.destructive]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(9, 11, 15, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '100%',
    ...shadows.card,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  action: {
    flex: 1,
  },
  destructive: {
    backgroundColor: colors.danger,
  },
});
