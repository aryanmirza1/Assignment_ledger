import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Edit3, FileDown, FilePlus2, Trash2, CheckCircle2, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ConfirmModal } from '../components/ConfirmModal';
import { FileCard } from '../components/FileCard';
import { PaymentCard } from '../components/PaymentCard';
import { PaymentProgressBar } from '../components/PaymentProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import {
  deleteAssignment,
  deleteFileRecord,
  deletePayment,
  getAssignment,
  listFiles,
  listPayments,
  markAssignmentCompleted,
} from '../data/database';
import { Assignment, LedgerFile, Payment } from '../data/types';
import { RootStackParamList } from '../navigation/types';
import { pickAndAttachFiles, shareFile } from '../services/fileService';
import { exportAssignmentPdf } from '../services/pdfService';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { currency, displayDate } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AssignmentDetail'>;

export function AssignmentDetailScreen({ navigation, route }: Props) {
  const { assignmentId } = route.params;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<LedgerFile[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    const [assignmentResult, paymentResult, fileResult] = await Promise.all([
      getAssignment(assignmentId),
      listPayments(assignmentId),
      listFiles(assignmentId),
    ]);
    setAssignment(assignmentResult);
    setPayments(paymentResult);
    setFiles(fileResult);
  }, [assignmentId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const attachFiles = async () => {
    await pickAndAttachFiles(assignmentId);
    await load();
  };

  const complete = async () => {
    await markAssignmentCompleted(assignmentId);
    await load();
  };

  const exportPdf = async () => {
    if (!assignment) return;
    await exportAssignmentPdf(assignment, payments, files);
  };

  const remove = async () => {
    await deleteAssignment(assignmentId);
    setDeleteOpen(false);
    navigation.goBack();
  };

  const deleteFile = async (fileId: number) => {
    await deleteFileRecord(fileId);
    await load();
  };

  const removePayment = async (paymentId: number) => {
    await deletePayment(paymentId);
    await load();
  };

  if (!assignment) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppHeader title="Assignment" subtitle="Loading..." onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Assignment" subtitle={assignment.studentName} onBack={() => navigation.goBack()} rightIcon={Edit3} onRightPress={() => navigation.navigate('AssignmentForm', { assignmentId })} />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.title}>{assignment.title}</Text>
            <Text style={styles.subtitle}>{assignment.subject}</Text>
            <View style={styles.badges}>
              <StatusBadge label={assignment.status} />
              <StatusBadge label={assignment.paymentStatus} type="payment" />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.amountRow}>
              <Metric label="Total" value={currency(assignment.totalAmount)} />
              <Metric label="Paid" value={currency(assignment.paidAmount)} />
              <Metric label="Remaining" value={currency(assignment.remainingAmount)} warning />
            </View>
            <PaymentProgressBar paid={assignment.paidAmount} total={assignment.totalAmount} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Client Details</Text>
            <InfoRow label="Student/client" value={assignment.studentName} />
            <InfoRow label="Phone" value={assignment.studentPhone || '-'} />
            <InfoRow label="Email" value={assignment.studentEmail || '-'} />
            <InfoRow label="Institution" value={assignment.institution || '-'} />
            <InfoRow label="Deadline" value={displayDate(assignment.deadline)} />
            <InfoRow label="Start date" value={displayDate(assignment.startDate)} />
            <InfoRow label="Created" value={displayDate(assignment.createdAt)} />
            <InfoRow label="Updated" value={displayDate(assignment.updatedAt)} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notes}>{assignment.notes || 'No notes added.'}</Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton title="Add Payment" icon={WalletCards} onPress={() => navigation.navigate('AddPayment', { assignmentId })} />
            <SecondaryButton title="Edit Assignment" icon={Edit3} onPress={() => navigation.navigate('AssignmentForm', { assignmentId })} />
            <SecondaryButton title="Attach Files" icon={FilePlus2} onPress={attachFiles} />
            <SecondaryButton title="Mark Completed" icon={CheckCircle2} onPress={complete} />
            <SecondaryButton title="Export PDF" icon={FileDown} onPress={exportPdf} />
            <SecondaryButton title="Delete Assignment" icon={Trash2} onPress={() => setDeleteOpen(true)} />
          </View>

          <Text style={styles.sectionTitle}>Attached Files</Text>
          <View style={styles.list}>
            {files.length ? (
              files.map((file) => <FileCard key={file.id} file={file} onShare={() => shareFile(file.fileUri)} onDelete={() => deleteFile(file.id)} />)
            ) : (
              <Text style={styles.emptyText}>No attached files yet.</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Payment History</Text>
          <View style={styles.list}>
            {payments.length ? (
              payments.map((payment) => <PaymentCard key={payment.id} payment={payment} onDelete={() => removePayment(payment.id)} />)
            ) : (
              <Text style={styles.emptyText}>No payments recorded.</Text>
            )}
          </View>
        </ScrollView>
      </View>
      <ConfirmModal
        visible={deleteOpen}
        title="Delete assignment?"
        message="This also deletes related payment and file records from the local database."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={remove}
      />
    </SafeAreaView>
  );
}

function Metric({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, warning && styles.warning]}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 36,
  },
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  warning: {
    color: colors.warning,
  },
  infoRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  notes: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
  },
  actions: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
});
