import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FileText, Image, MoreHorizontal, Share2, Trash2 } from 'lucide-react-native';
import { LedgerFile } from '../data/types';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { displayDate } from '../utils/format';

type Props = {
  file: LedgerFile;
  onShare: () => void;
  onDelete?: () => void;
};

export function FileCard({ file, onShare, onDelete }: Props) {
  const Icon = iconFor(file.fileType);
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon color={colors.primary} size={24} />
      </View>
      <View style={styles.flex}>
        <Text numberOfLines={1} style={styles.name}>
          {file.fileName}
        </Text>
        <Text style={styles.subtitle}>{file.projectTitle}</Text>
        <Text style={styles.meta}>
          {file.studentName} · {displayDate(file.uploadedAt)}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <Share2 color={colors.primary} size={18} />
        </TouchableOpacity>
        {onDelete ? (
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Trash2 color={colors.danger} size={18} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const iconFor = (fileType: string) => {
  const lower = fileType.toLowerCase();
  if (lower.includes('image')) return Image;
  if (lower.includes('pdf') || lower.includes('document')) return FileText;
  return MoreHorizontal;
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  flex: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  deleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
});
