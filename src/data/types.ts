export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Completed' | 'Cancelled';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type PaymentStatus = 'Not Paid' | 'Partially Paid' | 'Fully Paid';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Other';

export type AssignmentType =
  | 'Essay'
  | 'Report'
  | 'Presentation'
  | 'Coding Project'
  | 'Case Study'
  | 'Research'
  | 'Technical Task'
  | 'Other';

export type Assignment = {
  id: number;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  title: string;
  subject: string;
  institution: string;
  assignmentType: AssignmentType;
  deadline: string;
  startDate: string;
  status: AssignmentStatus;
  priority: Priority;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentInput = Omit<
  Assignment,
  'id' | 'remainingAmount' | 'paymentStatus' | 'createdAt' | 'updatedAt'
>;

export type Payment = {
  id: number;
  assignmentId: number;
  assignmentTitle?: string;
  studentName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  note: string;
  createdAt: string;
};

export type LedgerFile = {
  id: number;
  assignmentId: number;
  assignmentTitle?: string;
  studentName?: string;
  fileName: string;
  fileUri: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

export type Analytics = {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  totalAmount: number;
  totalReceived: number;
  totalRemaining: number;
  currentMonthReceived: number;
  pendingPayments: number;
};

export const assignmentStatuses: AssignmentStatus[] = [
  'Not Started',
  'In Progress',
  'Submitted',
  'Completed',
  'Cancelled',
];

export const priorities: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const assignmentTypes: AssignmentType[] = [
  'Report',
  'Case Study',
  'Research',
  'Technical Task',
  'Presentation',
];

export const paymentMethods: PaymentMethod[] = [
  'Cash',
  'Bank Transfer',
  'Easypaisa',
  'JazzCash',
  'Other',
];
