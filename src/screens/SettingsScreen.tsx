import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  DatabaseBackup,
  FileDown,
  Info,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { clearAllData, exportSnapshot, getAnalytics, listAssignments, listPayments, reseedData } from '../data/database';
import { exportFullRecordsPdf } from '../services/pdfService';
import { importBackupFile, writeBackupFile } from '../services/fileService';
import { colors, radii, shadows, spacing } from '../theme/theme';

export function SettingsScreen() {
  const navigation = useNavigation();
  const [clearOpen, setClearOpen] = useState(false);

  const exportPdf = async () => {
    const [analytics, assignments, payments] = await Promise.all([
      getAnalytics(),
      listAssignments(),
      listPayments(),
    ]);
    await exportFullRecordsPdf(analytics, assignments, payments);
  };

  const exportBackup = async () => {
    await writeBackupFile(await exportSnapshot());
  };

  const importBackup = async () => {
    try {
      const ok = await importBackupFile();
      if (ok) Alert.alert('Backup imported', 'Your local records were restored.');
    } catch {
      Alert.alert('Import failed', 'Please choose a valid Assignment Ledger JSON backup.');
    }
  };

  const clearData = async () => {
    await clearAllData();
    setClearOpen(false);
    Alert.alert('Data cleared', 'All local records were removed.');
    navigation.navigate('Dashboard' as never);
  };

  const reseed = async () => {
    await reseedData();
    Alert.alert('Sample data restored', 'The three demo assignment records are back.');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Settings" subtitle="Local-only personal storage" rightIcon={ShieldCheck} />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>Aryan</Text>
              <Text style={styles.meta}>Assignment Ledger</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Local only</Text>
            </View>
          </View>

          <View style={styles.card}>
            <SettingRow icon={FileDown} title="Export All Records as PDF" onPress={exportPdf} />
            <SettingRow icon={DatabaseBackup} title="Export Database Backup" onPress={exportBackup} />
            <SettingRow icon={Upload} title="Import Database Backup" onPress={importBackup} />
            <SettingRow icon={RefreshCcw} title="Restore Sample Seed Data" onPress={reseed} />
            <SettingRow icon={Trash2} title="Clear All Data" danger onPress={() => setClearOpen(true)} />
            <SettingRow
              icon={Info}
              title="About App"
              onPress={() =>
                Alert.alert(
                  'Assignment Ledger',
                  'A personal offline app for tracking assignments, clients, payments, files, and PDF reports.',
                )
              }
            />
          </View>

          <View style={styles.notice}>
            <RotateCcw color={colors.primary} size={18} />
            <Text style={styles.noticeText}>Your data is stored locally on this device only.</Text>
          </View>
        </ScrollView>
      </View>
      <ConfirmModal
        visible={clearOpen}
        title="Clear all data?"
        message="This permanently removes assignments, payments, and file records from this device."
        confirmLabel="Clear Data"
        destructive
        onCancel={() => setClearOpen(false)}
        onConfirm={clearData}
      />
    </SafeAreaView>
  );
}

type RowProps = {
  icon: typeof FileDown;
  title: string;
  danger?: boolean;
  onPress: () => void;
};

function SettingRow({ icon: Icon, title, danger, onPress }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.rowIcon, danger && styles.dangerIcon]}>
        <Icon color={danger ? colors.danger : colors.primary} size={22} />
      </View>
      <Text style={[styles.rowText, danger && styles.dangerText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  profile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radii.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  flex: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginTop: spacing.lg,
    overflow: 'hidden',
    ...shadows.soft,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 76,
    paddingHorizontal: spacing.lg,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  dangerIcon: {
    backgroundColor: '#fee2e2',
  },
  rowText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  dangerText: {
    color: colors.danger,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  noticeText: {
    color: colors.muted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
