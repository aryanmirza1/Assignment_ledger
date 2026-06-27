import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNav } from '../components/BottomNav';
import { AddPaymentScreen } from '../screens/AddPaymentScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { ProjectFormScreen } from '../screens/ProjectFormScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
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
      <Tab.Screen name="Projects" component={ProjectsScreen} />
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
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
    </Stack.Navigator>
  );
}
