import * as SQLite from 'expo-sqlite';
import {
  Analytics,
  Assignment,
  AssignmentInput,
  LedgerFile,
  Payment,
  PaymentMethod,
} from './types';
import { isOverdue, nowISO, paymentStatusFor, todayISO } from '../utils/format';

const DATABASE_NAME = 'assignment-ledger.db';

let db: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDb();
  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentName TEXT NOT NULL,
      studentPhone TEXT NOT NULL,
      studentEmail TEXT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      institution TEXT,
      assignmentType TEXT NOT NULL,
      deadline TEXT NOT NULL,
      startDate TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      totalAmount REAL NOT NULL DEFAULT 0,
      paidAmount REAL NOT NULL DEFAULT 0,
      remainingAmount REAL NOT NULL DEFAULT 0,
      paymentStatus TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignmentId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentDate TEXT NOT NULL,
      note TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignmentId INTEGER NOT NULL,
      fileName TEXT NOT NULL,
      fileUri TEXT NOT NULL,
      fileType TEXT,
      fileSize INTEGER DEFAULT 0,
      uploadedAt TEXT NOT NULL,
      FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
    );
  `);

  await seedDatabase();
};

const seedDatabase = async () => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM assignments');
  if ((row?.count ?? 0) > 0) {
    return;
  }

  const samples: AssignmentInput[] = [
    {
      studentName: 'Ali Khan',
      studentPhone: '03001234567',
      studentEmail: 'ali.khan@example.com',
      title: 'Business Report',
      subject: 'Management',
      institution: 'University of Sargodha',
      assignmentType: 'Report',
      deadline: offsetDate(4),
      startDate: todayISO(),
      status: 'In Progress',
      priority: 'High',
      totalAmount: 12000,
      paidAmount: 6000,
      notes: 'Prepare executive summary, references, and formatting.',
    },
    {
      studentName: 'Hamza Ahmed',
      studentPhone: '03007654321',
      studentEmail: 'hamza@example.com',
      title: 'Cyber Security Case Study',
      subject: 'Cyber Security',
      institution: 'Virtual University',
      assignmentType: 'Case Study',
      deadline: offsetDate(-2),
      startDate: offsetDate(-10),
      status: 'Completed',
      priority: 'Medium',
      totalAmount: 15000,
      paidAmount: 15000,
      notes: 'Completed and delivered with Turnitin-friendly references.',
    },
    {
      studentName: 'Sara Malik',
      studentPhone: '03111234567',
      studentEmail: 'sara@example.com',
      title: 'Marketing Presentation',
      subject: 'Marketing',
      institution: 'Superior College',
      assignmentType: 'Presentation',
      deadline: offsetDate(8),
      startDate: todayISO(),
      status: 'Not Started',
      priority: 'Urgent',
      totalAmount: 8000,
      paidAmount: 3000,
      notes: 'Need 12 slides with speaker notes.',
    },
  ];

  for (const sample of samples) {
    const id = await createAssignment(sample);
    if (sample.paidAmount > 0) {
      await addPayment(id, sample.paidAmount, 'Cash', sample.startDate, 'Seed payment');
    }
  }
};

const offsetDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const listAssignments = async () => {
  const database = await getDb();
  return database.getAllAsync<Assignment>('SELECT * FROM assignments ORDER BY deadline ASC, updatedAt DESC');
};

export const getAssignment = async (id: number) => {
  const database = await getDb();
  return database.getFirstAsync<Assignment>('SELECT * FROM assignments WHERE id = ?', id);
};

export const createAssignment = async (input: AssignmentInput) => {
  const database = await getDb();
  const total = Math.max(0, Number(input.totalAmount || 0));
  const paid = Math.max(0, Math.min(Number(input.paidAmount || 0), total));
  const remaining = Math.max(0, total - paid);
  const paymentStatus = paymentStatusFor(paid, total);
  const createdAt = nowISO();

  const result = await database.runAsync(
    `INSERT INTO assignments (
      studentName, studentPhone, studentEmail, title, subject, institution,
      assignmentType, deadline, startDate, status, priority, totalAmount,
      paidAmount, remainingAmount, paymentStatus, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.studentName,
    input.studentPhone,
    input.studentEmail,
    input.title,
    input.subject,
    input.institution,
    input.assignmentType,
    input.deadline,
    input.startDate,
    input.status,
    input.priority,
    total,
    paid,
    remaining,
    paymentStatus,
    input.notes,
    createdAt,
    createdAt,
  );

  return result.lastInsertRowId;
};

export const updateAssignment = async (id: number, input: AssignmentInput) => {
  const database = await getDb();
  const total = Math.max(0, Number(input.totalAmount || 0));
  const paid = Math.max(0, Math.min(Number(input.paidAmount || 0), total));
  const remaining = Math.max(0, total - paid);
  const paymentStatus = paymentStatusFor(paid, total);

  await database.runAsync(
    `UPDATE assignments SET
      studentName = ?, studentPhone = ?, studentEmail = ?, title = ?, subject = ?,
      institution = ?, assignmentType = ?, deadline = ?, startDate = ?, status = ?,
      priority = ?, totalAmount = ?, paidAmount = ?, remainingAmount = ?,
      paymentStatus = ?, notes = ?, updatedAt = ?
    WHERE id = ?`,
    input.studentName,
    input.studentPhone,
    input.studentEmail,
    input.title,
    input.subject,
    input.institution,
    input.assignmentType,
    input.deadline,
    input.startDate,
    input.status,
    input.priority,
    total,
    paid,
    remaining,
    paymentStatus,
    input.notes,
    nowISO(),
    id,
  );
};

export const deleteAssignment = async (id: number) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM assignments WHERE id = ?', id);
};

export const markAssignmentCompleted = async (id: number) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE assignments SET status = ?, updatedAt = ? WHERE id = ?',
    'Completed',
    nowISO(),
    id,
  );
};

export const listPayments = async (assignmentId?: number) => {
  const database = await getDb();
  const where = assignmentId ? 'WHERE p.assignmentId = ?' : '';
  const params = assignmentId ? [assignmentId] : [];
  return database.getAllAsync<Payment>(
    `SELECT p.*, a.title as assignmentTitle, a.studentName as studentName
     FROM payments p
     JOIN assignments a ON a.id = p.assignmentId
     ${where}
     ORDER BY p.paymentDate DESC, p.createdAt DESC`,
    params,
  );
};

export const addPayment = async (
  assignmentId: number,
  amount: number,
  paymentMethod: PaymentMethod,
  paymentDate: string,
  note: string,
) => {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO payments (assignmentId, amount, paymentMethod, paymentDate, note, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    assignmentId,
    Math.max(0, Number(amount || 0)),
    paymentMethod,
    paymentDate,
    note,
    nowISO(),
  );
  await recalculateAssignmentPayment(assignmentId);
};

export const recalculateAssignmentPayment = async (assignmentId: number) => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE assignmentId = ?',
    assignmentId,
  );
  const assignment = await getAssignment(assignmentId);
  if (!assignment) {
    return;
  }
  const paid = Number(row?.total ?? 0);
  const remaining = Math.max(0, Number(assignment.totalAmount) - paid);
  const paymentStatus = paymentStatusFor(paid, Number(assignment.totalAmount));
  await database.runAsync(
    'UPDATE assignments SET paidAmount = ?, remainingAmount = ?, paymentStatus = ?, updatedAt = ? WHERE id = ?',
    paid,
    remaining,
    paymentStatus,
    nowISO(),
    assignmentId,
  );
};

export const deleteFileRecord = async (id: number) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM files WHERE id = ?', id);
};

export const deletePayment = async (id: number) => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ assignmentId: number }>(
    'SELECT assignmentId FROM payments WHERE id = ?',
    id,
  );
  if (!row) return;
  await database.runAsync('DELETE FROM payments WHERE id = ?', id);
  await recalculateAssignmentPayment(row.assignmentId);
};

export const listFiles = async (assignmentId?: number) => {
  const database = await getDb();
  const where = assignmentId ? 'WHERE f.assignmentId = ?' : '';
  const params = assignmentId ? [assignmentId] : [];
  return database.getAllAsync<LedgerFile>(
    `SELECT f.*, a.title as assignmentTitle, a.studentName as studentName
     FROM files f
     JOIN assignments a ON a.id = f.assignmentId
     ${where}
     ORDER BY f.uploadedAt DESC`,
    params,
  );
};

export const addFileRecord = async (
  assignmentId: number,
  fileName: string,
  fileUri: string,
  fileType: string,
  fileSize: number,
) => {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO files (assignmentId, fileName, fileUri, fileType, fileSize, uploadedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    assignmentId,
    fileName,
    fileUri,
    fileType,
    fileSize,
    nowISO(),
  );
};

export const getAnalytics = async (): Promise<Analytics> => {
  const assignments = await listAssignments();
  const payments = await listPayments();
  const month = new Date().toISOString().slice(0, 7);
  const activeAssignments = assignments.filter(
    (item) => item.status !== 'Completed' && item.status !== 'Cancelled',
  ).length;

  return {
    totalAssignments: assignments.length,
    activeAssignments,
    completedAssignments: assignments.filter((item) => item.status === 'Completed').length,
    overdueAssignments: assignments.filter(isOverdue).length,
    totalAmount: assignments.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    totalReceived: assignments.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
    totalRemaining: assignments.reduce((sum, item) => sum + Number(item.remainingAmount || 0), 0),
    currentMonthReceived: payments
      .filter((item) => item.paymentDate.startsWith(month))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    pendingPayments: assignments.filter((item) => Number(item.remainingAmount || 0) > 0).length,
  };
};

export const clearAllData = async () => {
  const database = await getDb();
  await database.execAsync(`
    DELETE FROM files;
    DELETE FROM payments;
    DELETE FROM assignments;
    DELETE FROM sqlite_sequence WHERE name IN ('assignments', 'payments', 'files');
  `);
};

export const reseedData = async () => {
  await clearAllData();
  await seedDatabase();
};

export const exportSnapshot = async () => {
  const [assignments, payments, files] = await Promise.all([
    listAssignments(),
    listPayments(),
    listFiles(),
  ]);
  return {
    exportedAt: nowISO(),
    assignments,
    payments,
    files,
  };
};

export const importSnapshot = async (snapshot: {
  assignments?: Assignment[];
  payments?: Payment[];
  files?: LedgerFile[];
}) => {
  const database = await getDb();
  await clearAllData();

  for (const assignment of snapshot.assignments ?? []) {
    await database.runAsync(
      `INSERT INTO assignments (
        id, studentName, studentPhone, studentEmail, title, subject, institution,
        assignmentType, deadline, startDate, status, priority, totalAmount,
        paidAmount, remainingAmount, paymentStatus, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      assignment.id,
      assignment.studentName,
      assignment.studentPhone,
      assignment.studentEmail,
      assignment.title,
      assignment.subject,
      assignment.institution,
      assignment.assignmentType,
      assignment.deadline,
      assignment.startDate,
      assignment.status,
      assignment.priority,
      assignment.totalAmount,
      assignment.paidAmount,
      assignment.remainingAmount,
      assignment.paymentStatus,
      assignment.notes,
      assignment.createdAt,
      assignment.updatedAt,
    );
  }

  for (const payment of snapshot.payments ?? []) {
    await database.runAsync(
      `INSERT INTO payments (id, assignmentId, amount, paymentMethod, paymentDate, note, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      payment.id,
      payment.assignmentId,
      payment.amount,
      payment.paymentMethod,
      payment.paymentDate,
      payment.note,
      payment.createdAt,
    );
  }

  for (const file of snapshot.files ?? []) {
    await database.runAsync(
      `INSERT INTO files (id, assignmentId, fileName, fileUri, fileType, fileSize, uploadedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      file.id,
      file.assignmentId,
      file.fileName,
      file.fileUri,
      file.fileType,
      file.fileSize,
      file.uploadedAt,
    );
  }

  for (const assignment of snapshot.assignments ?? []) {
    await recalculateAssignmentPayment(assignment.id);
  }
};
