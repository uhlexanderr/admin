import * as XLSX from 'xlsx'; // Import all functions and objects from the 'xlsx' library

export function exportToXLSX(data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const xlsxBlob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'blob' })]);
  return xlsxBlob;
}