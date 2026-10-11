import { apiAllRows } from '../../lib/api.js';
import type { QrProps, QrRecord, QrSourceRow } from './types.js';

export function qrEndpoint({ scope, resource }: QrProps) {
  return `v1/companies/${scope.companyId}/branches/${scope.branchId}/${resource}`;
}
export async function loadQrRecords(props: QrProps): Promise<QrRecord[]> {
  const endpoint = qrEndpoint(props);
  const [rows, types] = await Promise.all([
    apiAllRows<QrSourceRow>(endpoint),
    props.resource === 'assets'
      ? apiAllRows<{ id: string; name: string }>(endpoint.replace(/assets$/, 'asset-types'))
      : Promise.resolve([]),
  ]);
  const names = new Map(types.map((item) => [item.id, item.name]));
  return [...new Map(rows.map((row) => [row.id, {
    id: row.id,
    name: row.fullName ?? row.name ?? names.get(row.assetTypeId ?? '') ?? 'Ativo',
    code: row.code ?? row.externalCode ?? '',
    department: row.departmentName ?? '',
    sector: row.sectorName ?? row.sector ?? '',
    location: row.locationText ?? row.location ?? '',
  }])).values()];
}
const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
export function filterQrRecords(rows: QrRecord[], search: string, department: string, sector: string, location: string) {
  const term = normalized(search.trim());
  return rows.filter((row) => (!department || row.department === department)
    && (!sector || row.sector === sector) && (!location || row.location === location)
    && normalized([row.name, row.code, row.department, row.sector, row.location].join(' ')).includes(term));
}
export function qrFilename(row: QrRecord) {
  const label = normalized(row.code || row.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
  return `qr-${label || 'registro'}-${row.id.replace(/[^a-zA-Z0-9_-]/g, '')}.svg`;
}
