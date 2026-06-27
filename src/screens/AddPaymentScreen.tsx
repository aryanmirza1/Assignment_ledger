import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays, Check, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/Buttons';
import { FilterChip } from '../components/FilterChip';
import { TextInputField } from '../components/TextInputField';
import { addPayment, listProjects } from '../data/database';
import { Project, paymentMethods, PaymentMethod } from '../data/types';
import { RootStackParamList } from '../navigation/types';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { currency, safeNumber, todayISO } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPayment'>;

export function AddPaymentScreen({ navigation, route }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | undefined>(route.params?.projectId);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    const load = async () => {
      const result = await listProjects();
      setProjects(result);
      if (!projectId && result[0]) setProjectId(result[0].id);
    };
    void load();
  }, [projectId]);

  const selected = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects],
  );

  const save = useCallback(async () => {
    const paidAmount = safeNumber(amount);
    if (!projectId || !selected) {
      setError('Select a project first.');
      return;
    }
    if (paidAmount <= 0) {
      setError('Payment amount is required.');
      return;
    }

    const commit = async () => {
      await addPayment(projectId, paidAmount, paymentMethod, paymentDate, note);
      navigation.goBack();
    };

    if (paidAmount > selected.remainingAmount && selected.remainingAmount > 0) {
      Alert.alert(
        'Payment exceeds remaining amount',
        `Remaining balance is ${currency(selected.remainingAmount)}. Add this payment anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Payment', onPress: () => void commit() },
        ],
      );
      return;
    }

    await commit();
  }, [amount, projectId, navigation, note, paymentDate, paymentMethod, selected]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Add Payment" subtitle="Update project balance" onBack={() => navigation.goBack()} rightIcon={WalletCards} />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.section}>Select Project</Text>
          <View style={styles.projectList}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => setProjectId(project.id)}
                style={[styles.projectCard, projectId === project.id && styles.projectActive]}
              >
                <View style={styles.flex}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectMeta}>
                    {project.studentName} · Remaining {currency(project.remainingAmount)}
                  </Text>
                </View>
                {projectId === project.id ? <Check color={colors.accent} size={22} /> : null}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Payment Details</Text>
          <TextInputField
            label="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              setError('');
            }}
            error={error}
            placeholder="e.g. 5000"
          />
          <TextInputField
            label="Payment Date"
            value={paymentDate}
            onChangeText={setPaymentDate}
            placeholder="YYYY-MM-DD"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {paymentMethods.map((method) => (
              <FilterChip
                key={method}
                label={method}
                active={paymentMethod === method}
                onPress={() => setPaymentMethod(method)}
              />
            ))}
          </ScrollView>
          <TextInputField
            label="Notes"
            multiline
            value={note}
            onChangeText={setNote}
            placeholder="Optional note"
            style={styles.textArea}
          />
          <PrimaryButton title="Save Payment" icon={CalendarDays} onPress={save} />
        </ScrollView>
      </View>
    </SafeAreaView>
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
  section: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  projectList: {
    gap: spacing.sm,
  },
  projectCard: {
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
  projectActive: {
    borderColor: colors.accent,
  },
  flex: {
    flex: 1,
  },
  projectTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  projectMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  chips: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  textArea: {
    minHeight: 110,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
});
