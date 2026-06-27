import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { Project, LedgerFile, Payment, Analytics } from '../data/types';
import { currency, displayDate, nowISO } from '../utils/format';
import { saveFileToDevice } from './fileService';

const pdfDirectory = `${FileSystem.documentDirectory}project-tracker-pdfs/`;

const ensurePdfDir = async () => {
  await FileSystem.makeDirectoryAsync(pdfDirectory, { intermediates: true }).catch(() => {});
};

const styles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #161a23; padding: 28px; }
    h1 { color: #283f9d; margin-bottom: 4px; }
    h2 { color: #111827; margin-top: 26px; border-bottom: 1px solid #dde4ee; padding-bottom: 8px; }
    .muted { color: #717887; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 18px 0; }
    .card { border: 1px solid #dde4ee; border-radius: 14px; padding: 12px; background: #f8fafc; }
    .label { color: #717887; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
    .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border-bottom: 1px solid #dde4ee; text-align: left; padding: 8px; vertical-align: top; }
    th { background: #eef3f8; color: #111827; }
    .pill { display: inline-block; border-radius: 999px; padding: 4px 8px; background: #dff8ef; color: #0f7b5d; font-size: 11px; font-weight: 700; }
  </style>
`;

const savePdfLocally = async (tempUri: string, fileName: string): Promise<string> => {
  await ensurePdfDir();
  const destination = `${pdfDirectory}${fileName}`;
  await FileSystem.moveAsync({ from: tempUri, to: destination });
  return destination;
};

export const exportProjectPdf = async (
  project: Project,
  payments: Payment[],
  files: LedgerFile[],
) => {
  const html = `
    <html><head>${styles}</head><body>
      <h1>${escapeHtml(project.title)}</h1>
      <div class="muted">Project Tracker report generated ${displayDate(nowISO())}</div>
      <div class="grid">
        ${metric('Client/Student', project.studentName)}
        ${metric('Subject', project.subject)}
        ${metric('Deadline', displayDate(project.deadline))}
        ${metric('Status', project.status)}
        ${metric('Priority', project.priority)}
        ${metric('Payment', project.paymentStatus)}
        ${metric('Total', currency(project.totalAmount))}
        ${metric('Paid', currency(project.paidAmount))}
        ${metric('Remaining', currency(project.remainingAmount))}
      </div>

      <h2>Client Details</h2>
      <p><strong>Phone:</strong> ${escapeHtml(project.studentPhone || '-')}</p>
      <p><strong>Email:</strong> ${escapeHtml(project.studentEmail || '-')}</p>
      <p><strong>Institution:</strong> ${escapeHtml(project.institution || '-')}</p>

      <h2>Notes</h2>
      <p>${escapeHtml(project.notes || 'No notes added.')}</p>

      <h2>Payment History</h2>
      ${paymentsTable(payments)}

      <h2>Attached Files</h2>
      ${
        files.length
          ? `<ul>${files.map((file) => `<li>${escapeHtml(file.fileName)}</li>`).join('')}</ul>`
          : '<p class="muted">No attached files.</p>'
      }

      <h2>Record Dates</h2>
      <p><strong>Created:</strong> ${displayDate(project.createdAt)} &nbsp; <strong>Updated:</strong> ${displayDate(project.updatedAt)}</p>
    </body></html>
  `;
  const file = await Print.printToFileAsync({ html });
  const safeName = project.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const name = `${safeName}-${Date.now()}.pdf`;
  const localUri = await savePdfLocally(file.uri, name);
  await saveFileToDevice(localUri, name, 'application/pdf');
  return localUri;
};

export const exportFullRecordsPdf = async (
  analytics: Analytics,
  projects: Project[],
  payments: Payment[],
) => {
  const html = `
    <html><head>${styles}</head><body>
      <h1>Project Tracker</h1>
      <div class="muted">Full records report generated ${displayDate(nowISO())}</div>
      <div class="grid">
        ${metric('Total Projects', analytics.totalProjects)}
        ${metric('Active', analytics.activeProjects)}
        ${metric('Completed', analytics.completedProjects)}
        ${metric('Overdue', analytics.overdueProjects)}
        ${metric('Total Received', currency(analytics.totalReceived))}
        ${metric('Total Remaining', currency(analytics.totalRemaining))}
      </div>

      <h2>Projects</h2>
      <table>
        <thead><tr><th>Title</th><th>Student</th><th>Subject</th><th>Deadline</th><th>Status</th><th>Total</th><th>Paid</th><th>Remaining</th></tr></thead>
        <tbody>
          ${projects
            .map(
              (item) => `
                <tr>
                  <td>${escapeHtml(item.title)}</td>
                  <td>${escapeHtml(item.studentName)}</td>
                  <td>${escapeHtml(item.subject)}</td>
                  <td>${displayDate(item.deadline)}</td>
                  <td><span class="pill">${item.status}</span></td>
                  <td>${currency(item.totalAmount)}</td>
                  <td>${currency(item.paidAmount)}</td>
                  <td>${currency(item.remainingAmount)}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>

      <h2>Payments</h2>
      ${paymentsTable(payments)}
    </body></html>
  `;
  const file = await Print.printToFileAsync({ html });
  const name = `full-report-${Date.now()}.pdf`;
  const localUri = await savePdfLocally(file.uri, name);
  await saveFileToDevice(localUri, name, 'application/pdf');
  return localUri;
};

const metric = (label: string, value: string | number) => `
  <div class="card">
    <div class="label">${escapeHtml(label)}</div>
    <div class="value">${escapeHtml(String(value))}</div>
  </div>
`;

const paymentsTable = (payments: Payment[]) => {
  if (!payments.length) {
    return '<p class="muted">No payments recorded.</p>';
  }
  return `
    <table>
      <thead><tr><th>Date</th><th>Project</th><th>Student</th><th>Amount</th><th>Method</th><th>Note</th></tr></thead>
      <tbody>
        ${payments
          .map(
            (payment) => `
              <tr>
                <td>${displayDate(payment.paymentDate)}</td>
                <td>${escapeHtml(payment.projectTitle ?? '')}</td>
                <td>${escapeHtml(payment.studentName ?? '')}</td>
                <td>${currency(payment.amount)}</td>
                <td>${payment.paymentMethod}</td>
                <td>${escapeHtml(payment.note || '')}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
