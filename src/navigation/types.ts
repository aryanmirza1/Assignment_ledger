import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Projects: { filter?: 'All' | 'Active' | 'Completed' | 'Pending Payment' | 'Overdue' } | undefined;
  Payments: undefined;
  Files: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  ProjectForm: { projectId?: number } | undefined;
  ProjectDetail: { projectId: number };
  AddPayment: { projectId?: number } | undefined;
};
