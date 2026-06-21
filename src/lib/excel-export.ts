import * as XLSX from 'xlsx';

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = 'Report'
): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
  const colWidths: { wch: number }[] = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    let maxLen = 10;
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        maxLen = Math.max(maxLen, String(cell.v).length + 2);
      }
    }
    colWidths.push({ wch: maxLen });
  }
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportLoansToExcel(loans: {
  loan_number: string;
  customer_name: string;
  mobile: string;
  loan_amount: number;
  interest_rate: number;
  loan_date: string;
  status: string;
}[]): void {
  const data = loans.map((l) => ({
    'Loan Number': l.loan_number,
    'Customer Name': l.customer_name,
    'Mobile': l.mobile,
    'Loan Amount (₹)': l.loan_amount,
    'Interest Rate (%)': l.interest_rate,
    'Loan Date': l.loan_date,
    'Status': l.status,
  }));
  exportToExcel(data, `loans-report-${new Date().toISOString().split('T')[0]}`, 'Loans');
}

export function exportPaymentsToExcel(payments: {
  receipt_number?: string;
  loan_number: string;
  customer_name: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_date: string;
}[]): void {
  const data = payments.map((p) => ({
    'Receipt #': p.receipt_number ?? '—',
    'Loan Number': p.loan_number,
    'Customer': p.customer_name,
    'Amount (₹)': p.amount,
    'Payment Type': p.payment_type,
    'Method': p.payment_method,
    'Date': p.payment_date,
  }));
  exportToExcel(data, `payments-report-${new Date().toISOString().split('T')[0]}`, 'Payments');
}

export function exportCustomersToExcel(customers: {
  full_name: string;
  mobile_number: string;
  email?: string;
  aadhaar_number?: string;
  pan_number?: string;
  city?: string;
  state?: string;
  status: string;
  created_at: string;
}[]): void {
  const data = customers.map((c) => ({
    'Full Name': c.full_name,
    'Mobile': c.mobile_number,
    'Email': c.email ?? '',
    'Aadhaar': c.aadhaar_number ?? '',
    'PAN': c.pan_number ?? '',
    'City': c.city ?? '',
    'State': c.state ?? '',
    'Status': c.status,
    'Joined': c.created_at.split('T')[0],
  }));
  exportToExcel(data, `customers-${new Date().toISOString().split('T')[0]}`, 'Customers');
}
