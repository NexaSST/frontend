import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sileo } from 'sileo';
import { apiJson } from '../../lib/api.js';
import { exportPdf, exportXlsx } from '../../lib/report-export.js';
import type { AprMonthlyReport } from './types.js';
import { useMonthlyAprReport } from './useMonthlyAprReport.js';

vi.mock('../../lib/api.js', () => ({ apiJson: vi.fn() }));
vi.mock('../../lib/report-export.js', () => ({ exportPdf: vi.fn(), exportXlsx: vi.fn() }));
vi.mock('sileo', () => ({ sileo: { success: vi.fn(), error: vi.fn() } }));

const scope = { companyId: 'company', branchId: 'branch' };
const report: AprMonthlyReport = {
  month: '2026-09', company: { name: 'Empresa' }, branch: { name: 'Filial Centro' },
  summary: { aprRevisions: 1, workPermits: 1, authorizedPermits: 0, cancelledPermits: 1 },
  aprs: [{ revisionId: 'revision', referenceCode: 'APR-1', title: 'Análise', revisionNo: 2, sha256: 'hash', finalizedAt: null }],
  workPermits: [{ id: 'permit', referenceCode: 'PT-1', title: 'Trabalho', status: 'cancelled', startsAt: null,
    endsAt: null, authorizedAt: null, cancelledAt: null, cancellationRequestedByName: 'Responsável', publicPath: "/public/pt-1" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiJson).mockResolvedValue(report);
});

describe('monthly APR/PT report exports', () => {
  it('exports only APR revisions for the selected month and branch', async () => {
    const { result } = renderHook(() => useMonthlyAprReport({ scope, area: 'apr' }));
    act(() => result.current.setReportMonth('2026-09'));
    await act(() => result.current.runExport('xlsx'));
    expect(apiJson).toHaveBeenCalledWith('v1/companies/company/branches/branch/apr-reports/monthly', {
      searchParams: { month: '2026-09' },
    });
    expect(exportXlsx).toHaveBeenCalledWith('apr-filial-centro-2026-09.xlsx', [
      expect.objectContaining({ name: 'Resumo', rows: [['Revisões APR', 1]] }),
      expect.objectContaining({ name: 'APRs', rows: [['APR-1', 'Análise', 2, '—', 'hash']] }),
    ]);
    expect(exportPdf).not.toHaveBeenCalled();
  });

  it('exports PT status and cancellation requester in the PDF', async () => {
    const { result } = renderHook(() => useMonthlyAprReport({ scope, area: 'pt' }));
    act(() => result.current.setReportMonth('2026-09'));
    await act(() => result.current.runExport('pdf'));
    expect(exportPdf).toHaveBeenCalledWith('pt-filial-centro-2026-09.pdf', 'Relatório mensal de PT',
      'Empresa · Filial Centro · 2026-09', 'PTs: 1 | Autorizadas: 0 | Canceladas: 1', [
        expect.objectContaining({ title: 'Permissões de Trabalho', rows: [['PT-1', 'Trabalho', 'cancelled', '—', '—', '—', 'Responsável']] }),
      ]);
    expect(exportXlsx).not.toHaveBeenCalled();
  });

  it('allows retry after a failed export without reporting success', async () => {
    vi.mocked(apiJson).mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useMonthlyAprReport({ scope, area: 'pt' }));
    await act(() => result.current.runExport('pdf'));
    expect(result.current.exporting).toBeNull();
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Não foi possível gerar o relatório' });
    expect(sileo.success).not.toHaveBeenCalled();
    await act(() => result.current.runExport('pdf'));
    expect(exportPdf).toHaveBeenCalledTimes(1);
    expect(sileo.success).toHaveBeenCalledWith({ title: 'PDF gerado' });
  });
});
