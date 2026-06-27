import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Assignments: undefined;
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
