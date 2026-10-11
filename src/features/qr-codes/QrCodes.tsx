import { useQuery } from '@tanstack/react-query';
import { Download, QrCode, Search } from 'lucide-react';
import { useState } from 'react';
import { Button, Checkbox, Input, Select } from '../../components/ui/index.js';
import { filterQrRecords, loadQrRecords, qrEndpoint } from './data.js';
import { downloadQrPdf, downloadQrSvg, downloadQrZip } from './download.js';
import type { QrProps, QrRecord } from './types.js';

const labels = { assets: 'Ativos', people: 'Colaboradores', 'confined-spaces': 'Espaços confinados' };
const fieldClass = 'grid gap-2 text-sm font-semibold text-muted';

export function QrCodes(props: QrProps) {
  // Scope changes remount local filters and selection, preventing cross-branch exports.
  return <QrCodesPanel key={`${props.scope.companyId}:${props.scope.branchId}:${props.resource}`} {...props} />;
}
function QrCodesPanel(props: QrProps) {
  const { resource } = props;
  const endpoint = qrEndpoint(props);
  const query = useQuery({ queryKey: ['qr-records', endpoint], queryFn: () => loadQrRecords(props) });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [sector, setSector] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const rows = query.data ?? [];
  const filtered = filterQrRecords(rows, search, department, sector, location);
  const selectedRows = filtered.filter((row) => selected.has(row.id));
  const batchRows = selectedRows.length ? selectedRows : filtered;
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 20, currentPage * 20);
  const options = (key: 'department' | 'sector' | 'location') => [...new Set(rows
    .filter((row) => key !== 'sector' || !department || row.department === department)
    .map((row) => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const update = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); setSelected(new Set()); };
  const toggle = (id: string) => setSelected((previous) => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const download = async (row?: QrRecord, format: 'pdf' | 'zip' = 'pdf') => {
    setBusy(row?.id ?? format); setError(''); setProgress(0);
    try {
      if (row) await downloadQrSvg(endpoint, row);
      else if (format === 'zip') await downloadQrZip(endpoint, batchRows, setProgress);
      else await downloadQrPdf(endpoint, batchRows, labels[resource], setProgress);
    } catch {
      setError('Não foi possível baixar os QR Codes. Confira sua conexão e permissão de acesso e tente novamente.');
    } finally { setBusy(null); }
  };
  return <section className="min-w-0 rounded-panel border border-line bg-surface" aria-labelledby="qr-title">
    <header className="flex flex-wrap items-start justify-between gap-5 border-b border-line p-6 max-[640px]:p-4">
      <div className="max-w-prose">
        <h2 id="qr-title" className="flex items-center gap-2"><QrCode size={21} aria-hidden="true" /> QR Codes de {labels[resource].toLocaleLowerCase('pt-BR')}</h2>
        <p className="mb-0 text-sm leading-relaxed text-muted">Localize os registros e baixe seus códigos. Baixe etiquetas em PDF A4 ou os SVGs individuais em ZIP.</p>
      </div>
      <div className="flex flex-wrap gap-2">
      <Button disabled={query.isPending || query.isError || !batchRows.length || busy !== null} onClick={() => void download()} leadingIcon={<Download size={17} />}>
        {busy === 'pdf' ? `Preparando ${progress}/${batchRows.length}` : `Baixar PDF (${batchRows.length})`}
      </Button>
      <Button variant="secondary" disabled={query.isPending || query.isError || !batchRows.length || busy !== null} onClick={() => void download(undefined, 'zip')} leadingIcon={<Download size={17} />}>
        {busy === 'zip' ? `Preparando ${progress}/${batchRows.length}` : `Baixar ZIP (${batchRows.length})`}
      </Button>
      </div>
    </header>
    <div className="grid grid-cols-[minmax(220px,2fr)_repeat(2,minmax(160px,1fr))] gap-4 border-b border-line p-6 max-[800px]:grid-cols-1 max-[640px]:p-4">
      <label className={fieldClass}><span>Buscar por nome ou código</span><div className="relative"><Search size={17} className="pointer-events-none absolute left-3 top-3.5" aria-hidden="true" /><Input disabled={busy !== null} className="w-full pl-10" value={search} placeholder="Digite para filtrar" onChange={(event) => update(setSearch, event.target.value)} /></div></label>
      {resource === 'people' && <label className={fieldClass}><span>Departamento</span><Select aria-label="Departamento" disabled={busy !== null} value={department} onChange={(event) => { update(setDepartment, event.target.value); setSector(''); }}><option value="">Todos os departamentos</option>{options('department').map((value) => <option key={value}>{value}</option>)}</Select></label>}
      {resource !== 'confined-spaces' && <label className={fieldClass}><span>Setor</span><Select aria-label="Setor" disabled={busy !== null} value={sector} onChange={(event) => update(setSector, event.target.value)}><option value="">Todos os setores</option>{options('sector').map((value) => <option key={value}>{value}</option>)}</Select></label>}
      {resource !== 'people' && <label className={fieldClass}><span>Localização</span><Select aria-label="Localização" disabled={busy !== null} value={location} onChange={(event) => update(setLocation, event.target.value)}><option value="">Todas as localizações</option>{options('location').map((value) => <option key={value}>{value}</option>)}</Select></label>}
    </div>
    {(busy === 'pdf' || busy === 'zip') && <p role="status" className="mx-6 text-sm text-muted">Preparando etiqueta {progress} de {batchRows.length}. Aguarde o download.</p>}
    {error && <div role="alert" className="m-4 rounded-control bg-danger-surface p-4 text-sm text-danger">{error}</div>}
    {query.isPending ? <div role="status" className="grid gap-3 p-6"><span className="text-muted">Carregando registros da filial…</span>{[1, 2, 3].map((key) => <div key={key} className="h-16 rounded-control bg-accent-soft" aria-hidden="true" />)}</div>
      : query.isError ? <div role="alert" className="p-6"><p>Não foi possível carregar os registros.</p><Button variant="secondary" onClick={() => void query.refetch()}>Tentar novamente</Button></div>
        : !filtered.length ? <div className="p-10 text-center"><h3>{rows.length ? 'Nenhum registro encontrado' : 'Nenhum registro disponível'}</h3><p className="text-muted">{rows.length ? 'Ajuste a busca ou limpe os filtros para encontrar os códigos.' : 'Os QR Codes aparecerão aqui quando houver cadastros acessíveis nesta filial.'}</p>{rows.length > 0 && <Button variant="secondary" onClick={() => { setSearch(''); setDepartment(''); setSector(''); setLocation(''); setSelected(new Set()); setPage(1); }}>Limpar filtros</Button>}</div>
          : <>
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm max-[640px]:px-4">
              <label className="flex items-center gap-2"><Checkbox disabled={busy !== null} checked={filtered.length > 0 && selectedRows.length === filtered.length} onChange={(event) => setSelected(event.target.checked ? new Set(filtered.map((row) => row.id)) : new Set())} /> Selecionar todos os {filtered.length} filtrados</label>
              <span className="text-muted" role="status">{selectedRows.length ? `${selectedRows.length} selecionados para download` : `Download dos ${filtered.length} filtrados`}</span>
            </div>
            <ul className="m-0 list-none p-0">
              {visible.map((row) => <li key={row.id} className="flex items-center gap-4 border-t border-line px-6 py-4 max-[640px]:grid max-[640px]:grid-cols-[auto_4rem_minmax(0,1fr)] max-[640px]:gap-3 max-[640px]:px-4">
                <Checkbox aria-label={`Selecionar ${row.name} ${row.code}`} disabled={busy !== null} checked={selected.has(row.id)} onChange={() => toggle(row.id)} />
                <img src={`/${endpoint}/${encodeURIComponent(row.id)}/qr.svg`} alt={`QR Code de ${row.name}`} width={64} height={64} loading="lazy" className="size-16 shrink-0 bg-white" />
                <div className="min-w-0 flex-1"><strong className="block wrap-break-word">{row.name}</strong><span className="text-sm text-muted">{[row.code, row.department, row.sector, row.location].filter(Boolean).join(' / ') || 'Sem identificação complementar'}</span></div>
                <Button className="max-[640px]:col-start-2 max-[640px]:col-span-2 max-[640px]:justify-self-start" variant="secondary" size="sm" disabled={busy !== null} aria-label={`Baixar QR Code de ${row.name} ${row.code}`} onClick={() => void download(row)} leadingIcon={<Download size={15} />}>{busy === row.id ? 'Baixando…' : 'Baixar SVG'}</Button>
              </li>)}
            </ul>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm"><span className="text-muted">Página {currentPage} de {pages} | {filtered.length} registros</span><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={currentPage === 1 || busy !== null} onClick={() => setPage(currentPage - 1)}>Anterior</Button><Button variant="secondary" size="sm" disabled={currentPage === pages || busy !== null} onClick={() => setPage(currentPage + 1)}>Próxima</Button></div></footer>
          </>}
  </section>;
}
