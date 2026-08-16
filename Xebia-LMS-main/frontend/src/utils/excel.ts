import * as XLSX from 'xlsx';

export interface ExcelExportData {
  'Student Name': string;
  'Email ID': string;
  'Assignment/Quiz Name': string;
  'Subject': string;
  'Batch': string;
  'Marks Obtained': string | number;
  'Total Marks': number;
  'Percentage': string;
  'Submission Date & Time': string;
  'Submission Status': string;
}

export const exportToExcel = (data: ExcelExportData[], filename: string) => {
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  if (data.length > 0) {
    const keys = Object.keys(data[0]) as (keyof ExcelExportData)[];
    const colWidths = keys.map(key => {
      // Find the maximum length of content in this column
      const maxLen = Math.max(
        String(key).length,
        ...data.map(row => String(row[key] ?? '').length)
      );
      // Give some padding
      return { wch: Math.min(50, Math.max(12, maxLen + 3)) };
    });
    worksheet['!cols'] = colWidths;
  }

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');

  // Generate buffer and trigger download
  XLSX.writeFile(workbook, filename);
};
