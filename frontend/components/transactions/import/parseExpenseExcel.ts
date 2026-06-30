import * as XLSX from 'xlsx';
import {
  Transaction,
  emptyTransaction,
} from '@/components/transactions/consts';

export interface ImportDraftTransaction extends Transaction {
  _rowIndex: number; // original row index in the spreadsheet, useful for debugging/dedup later
}

export interface ParseResult {
  transactions: ImportDraftTransaction[];
  personOptions: string[]; // detected person column names
  errors: string[]; // rows that were skipped due to parsing issues
}

const FIXED_COLUMNS = ['Date', 'Description', 'Category', 'Cost', 'Currency'];

/**
 * Detects the list of person column names from the header row.
 * Person columns are everything after the 5 fixed columns.
 */
export function getPersonColumns(headerRow: string[]): string[] {
  return headerRow.slice(FIXED_COLUMNS.length).filter(Boolean);
}

/**
 * Parses an Excel date value (string in DD/MM/YYYY format, or Excel serial number)
 * into an ISO8601 string. Returns null if unparseable.
 */
function parseExcelDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;

  // Excel serial date number
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const date = new Date(parsed.y, parsed.m - 1, parsed.d);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  // String in DD/MM/YYYY format
  if (typeof value === 'string') {
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map((p) => parseInt(p, 10));
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

/**
 * Parses a raw cell value into a number. Handles empty cells, strings, etc.
 * Returns null if the cell is empty/not a number.
 */
function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? null : num;
}

export interface ParseExpenseExcelOptions {
  selectedPerson: string;
  fromDate: string | null; // ISO8601 string, inclusive. null = no filter
  account: string; // defaults to 'Import' if blank, handled by caller
}

/**
 * Parses an uploaded expense-splitting Excel file into draft Transactions
 * for the selected person, including only rows where they owe money
 * (negative value in their column) on or after the given date.
 */
export function parseExpenseExcel(
  buffer: ArrayBuffer,
  options: ParseExpenseExcelOptions,
): ParseResult {
  const { selectedPerson, fromDate, account } = options;
  const errors: string[] = [];

  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: '',
  });

  const headerIndex = findHeaderRowIndex(rows);
  if (headerIndex === -1) {
    return {
      transactions: [],
      personOptions: [],
      errors: ['Could not find header row.'],
    };
  }

  const headerRow = rows[headerIndex].map((cell) => String(cell ?? '').trim());
  const personColumns = getPersonColumns(headerRow);

  const personColIndex = headerRow.indexOf(selectedPerson);
  if (personColIndex === -1) {
    return {
      transactions: [],
      personOptions: personColumns,
      errors: [`Could not find column for "${selectedPerson}".`],
    };
  }

  const fromDateMs = fromDate ? new Date(fromDate).getTime() : null;

  const transactions: ImportDraftTransaction[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((cell) => cell === '' || cell === undefined)) {
      continue; // skip blank rows
    }

    const category = String(row[2] ?? '').trim();
    const description = String(row[1] ?? '').trim();

    if (category === 'Payment' || description === 'Total balance') {
      continue; // skip payment settlements and balance summary rows
    }

    const rawDate = row[0];
    const currency = String(row[4] ?? '').trim();

    const isoDate = parseExcelDate(rawDate);
    if (!isoDate) {
      errors.push(`Row ${i + 1}: could not parse date "${rawDate}".`);
      continue;
    }

    if (fromDateMs !== null && new Date(isoDate).getTime() < fromDateMs) {
      continue; // before the filter date
    }

    const personAmount = parseAmount(row[personColIndex]);
    if (personAmount === null || personAmount >= 0) {
      continue; // not owed by this person, or empty/zero
    }

    // find merchant: first person column with a positive value
    let merchant: string | null = null;
    for (const personName of personColumns) {
      const colIndex = headerRow.indexOf(personName);
      const value = parseAmount(row[colIndex]);
      if (value !== null && value > 0) {
        merchant = personName;
        break;
      }
    }

    if (!merchant) {
      errors.push(
        `Row ${i + 1}: could not determine merchant (no positive payer found).`,
      );
      continue;
    }

    if (!currency) {
      errors.push(`Row ${i + 1}: missing currency.`);
      continue;
    }

    transactions.push({
      ...emptyTransaction,
      merchant: description ? `${description} - ${merchant}` : merchant,
      amount: Math.abs(personAmount),
      currency,
      account: account || 'Import',
      category: 'others', // placeholder, user assigns in review screen
      datetime: isoDate,
      type: 'expense',
      _rowIndex: i,
    });
  }

  return { transactions, personOptions: personColumns, errors };
}

/**
 * Quickly reads just the header row of an uploaded Excel file to extract
 * the list of person columns, without parsing all transaction rows.
 * Used to populate the "Which person are you?" dropdown immediately after upload.
 */
export function getPersonOptionsFromExcel(buffer: ArrayBuffer): string[] {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: '',
  });

  const headerIndex = findHeaderRowIndex(rows);
  if (headerIndex === -1) return [];

  const headerRow = rows[headerIndex].map((cell) => String(cell ?? '').trim());
  return getPersonColumns(headerRow);
}

/**
 * Finds the header row index by scanning for a row that starts with "Date"
 * in column A. Returns -1 if not found.
 */
function findHeaderRowIndex(rows: unknown[][]): number {
  for (let i = 0; i < rows.length; i++) {
    const firstCell = String(rows[i]?.[0] ?? '')
      .trim()
      .toLowerCase();
    if (firstCell === 'date') {
      return i;
    }
  }
  return -1;
}
