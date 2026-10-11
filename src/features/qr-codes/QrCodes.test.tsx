import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadQrRecords } from './data.js';
import { downloadQrPdf, downloadQrSvg, downloadQrZip } from './download.js';
import { QrCodes } from './QrCodes.js';
import type { QrRecord } from './types.js';

vi.mock('./data.js', async (original) => ({ ...await original<object>(), loadQrRecords: vi.fn() }));
vi.mock('./download.js', () => ({ downloadQrPdf: vi.fn(), downloadQrSvg: vi.fn(), downloadQrZip: vi.fn() }));
const records: QrRecord[] = Array.from({ length: 25 }, (_, index) => ({
  id: String(index + 1), name: `Colaborador ${index + 1}`, code: `C-${index + 1}`,
  department: index < 20 ? 'Operação' : 'Manutenção', sector: 'Campo', location: '',
}));
function mount() {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <QrCodes scope={{ companyId: 'company', branchId: 'branch' }} resource="people" />
  </QueryClientProvider>);
}
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); vi.mocked(loadQrRecords).mockResolvedValue(records); });

describe('QR Code downloads', () => {
  it('downloads all filtered records across pages, then only the selected record', async () => {
    mount();
    const batch = await screen.findByRole('button', { name: 'Baixar PDF (25)' });
    await waitFor(() => expect(batch).toBeEnabled());
    fireEvent.click(batch);
    await waitFor(() => expect(downloadQrPdf).toHaveBeenCalled());
    expect(vi.mocked(downloadQrPdf).mock.calls[0]![1]).toHaveLength(25);
    await waitFor(() => expect(batch).toBeEnabled());
    fireEvent.click(screen.getByLabelText('Selecionar Colaborador 1 C-1'));
    fireEvent.click(screen.getByRole('button', { name: 'Baixar PDF (1)' }));
    await waitFor(() => expect(downloadQrPdf).toHaveBeenCalledTimes(2));
    expect(vi.mocked(downloadQrPdf).mock.calls[1]![1]).toEqual([records[0]]);
  });

  it('filters department, resets selection and downloads the individual SVG', async () => {
    mount();
    await screen.findByLabelText('Selecionar Colaborador 1 C-1');
    fireEvent.click(screen.getByLabelText('Selecionar Colaborador 1 C-1'));
    fireEvent.click(screen.getByRole('combobox', { name: 'Departamento' }));
    fireEvent.click(screen.getByRole('option', { name: 'Manutenção' }));
    expect(screen.getByRole('button', { name: 'Baixar PDF (5)' })).toBeEnabled();
    expect(screen.queryByLabelText('Selecionar Colaborador 1 C-1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Baixar QR Code de Colaborador 21 C-21' }));
    await waitFor(() => expect(downloadQrSvg).toHaveBeenCalledWith('v1/companies/company/branches/branch/people', records[20]));
  });

  it('exports the same selection as individual SVG files in ZIP', async () => {
    mount();
    await screen.findByLabelText('Selecionar Colaborador 1 C-1');
    fireEvent.click(screen.getByLabelText('Selecionar Colaborador 1 C-1'));
    fireEvent.click(screen.getByRole('button', { name: 'Baixar ZIP (1)' }));
    await waitFor(() => expect(downloadQrZip).toHaveBeenCalled());
    expect(vi.mocked(downloadQrZip).mock.calls[0]!.slice(0, 2)).toEqual(['v1/companies/company/branches/branch/people', [records[0]]]);
  });

  it('reports download failure and leaves controls available for retry', async () => {
    vi.mocked(downloadQrPdf).mockRejectedValueOnce(new Error('Forbidden'));
    mount();
    const batch = await screen.findByRole('button', { name: 'Baixar PDF (25)' });
    await waitFor(() => expect(batch).toBeEnabled());
    fireEvent.click(batch);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível baixar');
    expect(batch).toBeEnabled();
  });
});
