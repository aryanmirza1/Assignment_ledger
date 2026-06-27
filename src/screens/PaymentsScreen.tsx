import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Plus, ReceiptText, WalletCards } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { PaymentCard } from '../components/PaymentCard';
import { PrimaryButton } from '../components/Buttons';
import { SummaryCard } from '../components/SummaryCard';
import { Analytics, Payment } from '../data/types';
import { deletePayment, getAnalytics, listPayments } from '../data/database';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/theme';
import { currency } from '../utils/format';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function PaymentsScreen() {
  const navigation = useNavigation<Navigation>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const load = useCallback(async () => {
    const [paymentResult, analyticsResult] = await Promise.all([listPayments(), getAnalytics()]);
    setPayments(paymentResult);
    setAnalytics(analyticsResult);
  }, []);

  const removePayment = async (paymentId: number) => {
    await deletePayment(paymentId);
    await load();
  };

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader title="Payments" subtitle={`${payments.length} records`} rightIcon={WalletCards} />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            <SummaryCard label="Total Received" value={currency(analytics?.totalReceived ?? 0)} icon={WalletCards} tone="green" />
            <SummaryCard label="Total Remaining" value={currency(analytics?.totalRemaining ?? 0)} icon={ReceiptText} tone="orange" />
            <SummaryCard label="This Month" value={currency(analytics?.currentMonthReceived ?? 0)} icon={WalletCards} tone="blue" />
            <SummaryCard label="Pending Payments" value={analytics?.pendingPayments ?? 0} icon={ReceiptText} tone="dark" />
          </View>
          <PrimaryButton title="Add Payment" icon={Plus} onPress={() => navigation.navigate('AddPayment')} style={styles.button} />
          {payments.length ? (
            <View style={styles.list}>
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} onDelete={() => removePayment(payment.id)} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={WalletCards}
              title="No payments recorded yet"
              description="Add a payment to update assignment balances automatically."
              actionLabel="Add Payment"
              onAction={() => navigation.navigate('AddPayment')}
            />
          )}
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
    padding: spacing.md,
    paddingBottom: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  button: {
    marginVertical: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
});
