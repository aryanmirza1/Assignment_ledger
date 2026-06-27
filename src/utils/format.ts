import { Project } from '../data/types';

export const currency = (value: number) =>
  `Rs ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const nowISO = () => new Date().toISOString();

export const displayDate = (value?: string) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const isOverdue = (project: Project) => {
  const due = new Date(`${project.deadline}T23:59:59`);
  const isClosed = project.status === 'Completed' || project.status === 'Cancelled';
  return !isClosed && due.getTime() < Date.now();
};

export const isDueSoon = (project: Project) => {
  const due = new Date(`${project.deadline}T23:59:59`);
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const isClosed = project.status === 'Completed' || project.status === 'Cancelled';
  return !isClosed && due.getTime() >= now && due.getTime() <= now + sevenDays;
};

export const paymentStatusFor = (paid: number, total: number) => {
  if (total <= 0 || paid <= 0) {
    return 'Not Paid' as const;
  }
  if (paid >= total) {
    return 'Fully Paid' as const;
  }
  return 'Partially Paid' as const;
};

export const safeNumber = (value: string | number) => {
  const parsed = typeof value === 'number' ? value : Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const sanitizeFileName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
