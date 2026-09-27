type CellValue = string | number | boolean | Date;
export interface ExportSheet { name: string; headers: string[]; rows: CellValue[][]; widths?: number[] }
export interface PdfSection { title: string; headers: string[]; rows: Array<Array<string | number>> }

export async function exportXlsx(filename: string, sheets: ExportSheet[]): Promise<void> {
  const excel = await import('write-excel-file/browser');
  const header = (labels: string[]) => labels.map((value) => ({ value, fontWeight: 'bold' as const, backgroundColor: 'DCEDE7' }));
  await excel.default(sheets.map((sheet) => ({ data: [header(sheet.headers), ...sheet.rows], sheet: sheet.name,
    columns: sheet.widths?.map((width) => ({ width })), stickyRowsCount: 1 }))).toFile(filename);
}

export async function exportPdf(filename: string, title: string, subtitle: string, summary: string, sections: PdfSection[]): Promise<void> {
  const [jspdf, autoTable] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const document = new jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  sections.forEach((section, index) => {
    if (index > 0) document.addPage();
    document.setFontSize(16); document.text(title, 14, 16);
    document.setFontSize(9); document.text(subtitle, 14, 22); document.text(summary, 14, 28);
    document.setFontSize(12); document.text(section.title, 14, 36);
    autoTable.default(document, { startY: 40, head: [section.headers], body: section.rows,
      styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [20, 84, 66] } });
  });
  document.save(filename);
}
