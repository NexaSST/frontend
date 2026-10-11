import { describe, expect, it } from 'vitest';
import { filterQrRecords, qrEndpoint, qrFilename } from './data.js';
import type { QrRecord } from './types.js';

const row: QrRecord = { id: '42', name: 'João da Silva', code: 'A/1', department: 'Operação', sector: 'Campo', location: 'Área sul' };
describe('QR record filters', () => {
  it('matches names and identifiers without accents and combines exact filters', () => {
    expect(filterQrRecords([row], 'joao', 'Operação', 'Campo', '')).toEqual([row]);
    expect(filterQrRecords([row], 'area sul', '', '', 'Área sul')).toEqual([row]);
    expect(filterQrRecords([row], '', 'Manutenção', '', '')).toEqual([]);
  });
  it('uses the selected branch and safe filenames with unique IDs', () => {
    expect(qrEndpoint({ scope: { companyId: '1', branchId: '2' }, resource: 'assets' })).toBe('v1/companies/1/branches/2/assets');
    expect(qrFilename(row)).toBe('qr-a-1-42.svg');
  });
});
