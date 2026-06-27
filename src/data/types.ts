export type ProjectStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Completed' | 'Cancelled';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type PaymentStatus = 'Not Paid' | 'Partially Paid' | 'Fully Paid';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Other';

export type ProjectType =
  | 'Essay'
  | 'Report'
  | 'Presentation'
  | 'Coding Project'
  | 'Case Study'
  | 'Research'
  | 'Technical Task'
  | 'Other';

export type Project = {
  id: number;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  title: string;
  subject: string;
  institution: string;
  projectType: ProjectType;
  deadline: string;
  startDate: string;
  status: ProjectStatus;
  priority: Priority;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = Omit<
  Project,
  'id' | 'remainingAmount' | 'paymentStatus' | 'createdAt' | 'updatedAt'
>;

export type Payment = {
  id: number;
  projectId: number;
  projectTitle?: string;
  studentName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  note: string;
  createdAt: string;
};

export type LedgerFile = {
  id: number;
  projectId: number;
  projectTitle?: string;
  studentName?: string;
  fileName: string;
  fileUri: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

export type Analytics = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalAmount: number;
  totalReceived: number;
  totalRemaining: number;
  currentMonthReceived: number;
  pendingPayments: number;
};

export const projectStatuses: ProjectStatus[] = [
  'Not Started',
  'In Progress',
  'Submitted',
  'Completed',
  'Cancelled',
];

export const priorities: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const projectTypes: ProjectType[] = [
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
