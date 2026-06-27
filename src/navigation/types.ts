import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Assignments: { filter?: 'All' | 'Active' | 'Completed' | 'Pending Payment' | 'Overdue' } | undefined;
  Payments: undefined;
  Files: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  AssignmentForm: { assignmentId?: number } | undefined;
  AssignmentDetail: { assignmentId: number };
  AddPayment: { assignmentId?: number } | undefined;
};
