import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNav } from '../components/BottomNav';
import { AddPaymentScreen } from '../screens/AddPaymentScreen';
import { AssignmentDetailScreen } from '../screens/AssignmentDetailScreen';
import { AssignmentFormScreen } from '../screens/AssignmentFormScreen';
import { AssignmentsScreen } from '../screens/AssignmentsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FilesScreen } from '../screens/FilesScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false, animation: 'fade' }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assignments" component={AssignmentsScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Files" component={FilesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AssignmentForm" component={AssignmentFormScreen} />
      <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
      <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
    </Stack.Navigator>
  );
}
