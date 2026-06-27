import * as SQLite from 'expo-sqlite';
import {
  Analytics,
  Project,
  ProjectInput,
  LedgerFile,
  Payment,
  PaymentMethod,
} from './types';
import { isOverdue, nowISO, paymentStatusFor, todayISO } from '../utils/format';

const DATABASE_NAME = 'project-ledger.db';

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

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentName TEXT NOT NULL,
      studentPhone TEXT NOT NULL,
      studentEmail TEXT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      institution TEXT,
      projectType TEXT NOT NULL,
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
      projectId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentDate TEXT NOT NULL,
      note TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      fileName TEXT NOT NULL,
      fileUri TEXT NOT NULL,
      fileType TEXT,
      fileSize INTEGER DEFAULT 0,
      uploadedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  await seedDatabase();
};

const seedDatabase = async () => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM projects');
  if ((row?.count ?? 0) > 0) {
    return;
  }

  const samples: ProjectInput[] = [
    {
      studentName: 'Ali Khan',
      studentPhone: '03001234567',
      studentEmail: 'ali.khan@example.com',
      title: 'Business Report',
      subject: 'Management',
      institution: 'University of Sargodha',
      projectType: 'Report',
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
      projectType: 'Case Study',
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
      projectType: 'Presentation',
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
    const id = await createProject(sample);
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

export const listProjects = async () => {
  const database = await getDb();
  return database.getAllAsync<Project>('SELECT * FROM projects ORDER BY deadline ASC, updatedAt DESC');
};

export const getProject = async (id: number) => {
  const database = await getDb();
  return database.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?', id);
};

export const createProject = async (input: ProjectInput) => {
  const database = await getDb();
  const total = Math.max(0, Number(input.totalAmount || 0));
  const paid = Math.max(0, Math.min(Number(input.paidAmount || 0), total));
  const remaining = Math.max(0, total - paid);
  const paymentStatus = paymentStatusFor(paid, total);
  const createdAt = nowISO();

  const result = await database.runAsync(
    `INSERT INTO projects (
      studentName, studentPhone, studentEmail, title, subject, institution,
      projectType, deadline, startDate, status, priority, totalAmount,
      paidAmount, remainingAmount, paymentStatus, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.studentName,
    input.studentPhone,
    input.studentEmail,
    input.title,
    input.subject,
    input.institution,
    input.projectType,
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

export const updateProject = async (id: number, input: ProjectInput) => {
  const database = await getDb();
  const total = Math.max(0, Number(input.totalAmount || 0));
  const paid = Math.max(0, Math.min(Number(input.paidAmount || 0), total));
  const remaining = Math.max(0, total - paid);
  const paymentStatus = paymentStatusFor(paid, total);

  await database.runAsync(
    `UPDATE projects SET
      studentName = ?, studentPhone = ?, studentEmail = ?, title = ?, subject = ?,
      institution = ?, projectType = ?, deadline = ?, startDate = ?, status = ?,
      priority = ?, totalAmount = ?, paidAmount = ?, remainingAmount = ?,
      paymentStatus = ?, notes = ?, updatedAt = ?
    WHERE id = ?`,
    input.studentName,
    input.studentPhone,
    input.studentEmail,
    input.title,
    input.subject,
    input.institution,
    input.projectType,
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

export const deleteProject = async (id: number) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM projects WHERE id = ?', id);
};

export const markProjectCompleted = async (id: number) => {
  const database = await getDb();
  await database.runAsync(
    'UPDATE projects SET status = ?, updatedAt = ? WHERE id = ?',
    'Completed',
    nowISO(),
    id,
  );
};

export const listPayments = async (projectId?: number) => {
  const database = await getDb();
  const where = projectId ? 'WHERE p.projectId = ?' : '';
  const params = projectId ? [projectId] : [];
  return database.getAllAsync<Payment>(
    `SELECT p.*, a.title as projectTitle, a.studentName as studentName
     FROM payments p
     JOIN projects a ON a.id = p.projectId
     ${where}
     ORDER BY p.paymentDate DESC, p.createdAt DESC`,
    params,
  );
};

export const addPayment = async (
  projectId: number,
  amount: number,
  paymentMethod: PaymentMethod,
  paymentDate: string,
  note: string,
) => {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO payments (projectId, amount, paymentMethod, paymentDate, note, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    projectId,
    Math.max(0, Number(amount || 0)),
    paymentMethod,
    paymentDate,
    note,
    nowISO(),
  );
  await recalculateProjectPayment(projectId);
};

export const recalculateProjectPayment = async (projectId: number) => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE projectId = ?',
    projectId,
  );
  const project = await getProject(projectId);
  if (!project) {
    return;
  }
  const paid = Number(row?.total ?? 0);
  const remaining = Math.max(0, Number(project.totalAmount) - paid);
  const paymentStatus = paymentStatusFor(paid, Number(project.totalAmount));
  await database.runAsync(
    'UPDATE projects SET paidAmount = ?, remainingAmount = ?, paymentStatus = ?, updatedAt = ? WHERE id = ?',
    paid,
    remaining,
    paymentStatus,
    nowISO(),
    projectId,
  );
};

export const deleteFileRecord = async (id: number) => {
  const database = await getDb();
  await database.runAsync('DELETE FROM files WHERE id = ?', id);
};

export const deletePayment = async (id: number) => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ projectId: number }>(
    'SELECT projectId FROM payments WHERE id = ?',
    id,
  );
  if (!row) return;
  await database.runAsync('DELETE FROM payments WHERE id = ?', id);
  await recalculateProjectPayment(row.projectId);
};

export const listFiles = async (projectId?: number) => {
  const database = await getDb();
  const where = projectId ? 'WHERE f.projectId = ?' : '';
  const params = projectId ? [projectId] : [];
  return database.getAllAsync<LedgerFile>(
    `SELECT f.*, a.title as projectTitle, a.studentName as studentName
     FROM files f
     JOIN projects a ON a.id = f.projectId
     ${where}
     ORDER BY f.uploadedAt DESC`,
    params,
  );
};

export const addFileRecord = async (
  projectId: number,
  fileName: string,
  fileUri: string,
  fileType: string,
  fileSize: number,
) => {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO files (projectId, fileName, fileUri, fileType, fileSize, uploadedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    projectId,
    fileName,
    fileUri,
    fileType,
    fileSize,
    nowISO(),
  );
};

export const getAnalytics = async (): Promise<Analytics> => {
  const projects = await listProjects();
  const payments = await listPayments();
  const month = new Date().toISOString().slice(0, 7);
  const activeProjects = projects.filter(
    (item) => item.status !== 'Completed' && item.status !== 'Cancelled',
  ).length;

  return {
    totalProjects: projects.length,
    activeProjects,
    completedProjects: projects.filter((item) => item.status === 'Completed').length,
    overdueProjects: projects.filter(isOverdue).length,
    totalAmount: projects.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    totalReceived: projects.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
    totalRemaining: projects.reduce((sum, item) => sum + Number(item.remainingAmount || 0), 0),
    currentMonthReceived: payments
      .filter((item) => item.paymentDate.startsWith(month))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    pendingPayments: projects.filter((item) => Number(item.remainingAmount || 0) > 0).length,
  };
};

export const clearAllData = async () => {
  const database = await getDb();
  await database.execAsync(`
    DELETE FROM files;
    DELETE FROM payments;
    DELETE FROM projects;
    DELETE FROM sqlite_sequence WHERE name IN ('projects', 'payments', 'files');
  `);
};

export const reseedData = async () => {
  await clearAllData();
  await seedDatabase();
};

export const exportSnapshot = async () => {
  const [projects, payments, files] = await Promise.all([
    listProjects(),
    listPayments(),
    listFiles(),
  ]);
  return {
    exportedAt: nowISO(),
    projects,
    payments,
    files,
  };
};

export const importSnapshot = async (snapshot: {
  projects?: Project[];
  payments?: Payment[];
  files?: LedgerFile[];
}) => {
  const database = await getDb();
  await clearAllData();

  for (const project of snapshot.projects ?? []) {
    await database.runAsync(
      `INSERT INTO projects (
        id, studentName, studentPhone, studentEmail, title, subject, institution,
        projectType, deadline, startDate, status, priority, totalAmount,
        paidAmount, remainingAmount, paymentStatus, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      project.id,
      project.studentName,
      project.studentPhone,
      project.studentEmail,
      project.title,
      project.subject,
      project.institution,
      project.projectType,
      project.deadline,
      project.startDate,
      project.status,
      project.priority,
      project.totalAmount,
      project.paidAmount,
      project.remainingAmount,
      project.paymentStatus,
      project.notes,
      project.createdAt,
      project.updatedAt,
    );
  }

  for (const payment of snapshot.payments ?? []) {
    await database.runAsync(
      `INSERT INTO payments (id, projectId, amount, paymentMethod, paymentDate, note, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      payment.id,
      payment.projectId,
      payment.amount,
      payment.paymentMethod,
      payment.paymentDate,
      payment.note,
      payment.createdAt,
    );
  }

  for (const file of snapshot.files ?? []) {
    await database.runAsync(
      `INSERT INTO files (id, projectId, fileName, fileUri, fileType, fileSize, uploadedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      file.id,
      file.projectId,
      file.fileName,
      file.fileUri,
      file.fileType,
      file.fileSize,
      file.uploadedAt,
    );
  }

  for (const project of snapshot.projects ?? []) {
    await recalculateProjectPayment(project.id);
  }
};
