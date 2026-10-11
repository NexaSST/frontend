import { svgZip } from "./zip.js";
import { apiResponse } from '../../lib/api.js';
import { qrFilename } from './data.js';
import type { QrRecord } from './types.js';

async function qrSvg(endpoint: string, row: QrRecord) {
  return (await apiResponse(`${endpoint}/${encodeURIComponent(row.id)}/qr.svg`)).text();
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadQrSvg(endpoint: string, row: QrRecord) {
  downloadBlob(new Blob([await qrSvg(endpoint, row)], { type: 'image/svg+xml' }), qrFilename(row));
}
export async function downloadQrZip(endpoint: string, rows: QrRecord[], onProgress: (done: number) => void) {
  if (!rows.length) return;
  const entries = [];
  for (const row of rows) {
    entries.push({ name: qrFilename(row), content: await qrSvg(endpoint, row) });
    onProgress(entries.length);
  }
  downloadBlob(new Blob([svgZip(entries)], { type: 'application/zip' }), `nexasst-qr-${endpoint.split('/').at(-1)}.zip`);
}
async function svgPng(svg: string): Promise<string> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a imagem do QR Code.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 1024, 1024);
    context.drawImage(image, 0, 0, 1024, 1024);
    return canvas.toDataURL('image/png');
  } finally { URL.revokeObjectURL(url); }
}
export async function downloadQrPdf(endpoint: string, rows: QrRecord[], title: string, onProgress: (done: number) => void) {
  if (!rows.length) return;
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  for (let index = 0; index < rows.length; index++) {
    if (index > 0 && index % 12 === 0) pdf.addPage();
    if (index % 12 === 0) {
      pdf.setFontSize(12);
      pdf.text(`NexaSST | ${title}`, 12, 13);
      pdf.setFontSize(8);
      pdf.text(`Página ${Math.floor(index / 12) + 1} | ${rows.length} etiquetas`, 12, 19);
    }
    const row = rows[index]!;
    const x = 12 + (index % 3) * 63;
    const y = 25 + Math.floor((index % 12) / 3) * 65;
    const png = await svgPng(await qrSvg(endpoint, row));
    // White padding adds a print-safe quiet zone beyond the backend SVG margin.
    pdf.addImage(png, 'PNG', x + 7, y, 46, 46);
    pdf.setFontSize(9);
    pdf.text(pdf.splitTextToSize(row.code ? `${row.code} | ${row.name}` : row.name, 58).slice(0, 2), x + 30, y + 49, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text(pdf.splitTextToSize([row.department, row.sector, row.location].filter(Boolean).join(' / '), 58).slice(0, 2), x + 30, y + 58, { align: 'center' });
    onProgress(index + 1);
  }
  // No partial document is saved when a QR request fails.
  pdf.save(`nexasst-qr-${endpoint.split('/').at(-1)}.pdf`);
}
