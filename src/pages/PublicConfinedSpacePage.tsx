import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { AlertTriangle, ArrowDown, ClipboardList, Printer, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '../components/ui/index.js';
import type { PublicConfinedSpace, PublicRescueScenario } from './PublicConfinedSpaceTypes.js';
import './public-confined-space.css';

async function loadSpace(token: string, signal: AbortSignal): Promise<PublicConfinedSpace> {
  const response = await fetch(`/v1/public/confined-spaces/${encodeURIComponent(token)}`, {
    headers: { Accept: 'application/json' }, cache: 'no-store', signal,
  });
  if (!response.ok) throw new Error(response.status === 404 ? 'not_found' : 'unavailable');
  return response.json();
}
export function PublicConfinedSpacePage() {
  const { token } = useParams({ from: '/public/confined-spaces/$token' });
  const query = useQuery({ queryKey: ['public-confined-space', token], queryFn: ({ signal }) => loadSpace(token, signal), retry: false, refetchInterval: 60_000 });
  useEffect(() => {
    const previous = document.title;
    document.title = query.data ? `${query.data.code} | Espaço confinado | NexaSST` : 'Consulta de espaço confinado | NexaSST';
    return () => { document.title = previous; };
  }, [query.data?.code]);
  return <div className="public-space">
    <header className="public-space__topbar"><a href="/" aria-label="NexaSST, página inicial"><img src="/brand/nexasst-symbol-flat.png" width={28} height={28} alt="" />NexaSST</a><span>Consulta pública</span></header>
    {query.data ? <>
      {query.isError && <p role="alert" className="public-space__refresh-error">Não foi possível atualizar esta consulta. Os dados abaixo podem estar desatualizados. <button onClick={() => void query.refetch()}>Tentar novamente</button></p>}
      <ConfinedSpaceProfile space={query.data} />
    </> : <main className="public-space__state" aria-live="polite">
      <ShieldCheck size={32} aria-hidden="true" />
      <h1>{query.isPending ? 'Carregando espaço confinado…' : query.error?.message === 'not_found' ? 'Consulta não disponível' : 'Não foi possível carregar a consulta'}</h1>
      <p>{query.isPending ? 'Buscando os dados públicos deste QR Code.' : query.error?.message === 'not_found' ? 'O código pode estar inválido, o espaço pode ter sido arquivado ou a consulta pública pode estar indisponível.' : 'Confira sua conexão e tente novamente.'}</p>
      {query.isError && query.error.message !== 'not_found' && <Button variant="secondary" onClick={() => void query.refetch()}>Tentar novamente</Button>}
    </main>}
    <footer className="public-space__footer">NexaSST | Informações do recorte público disponível no sistema.</footer>
  </div>;
}
function restriction(space: PublicConfinedSpace) {
  if (space.operationalRestriction === 'interdicted') return { label: 'Espaço interditado', tone: 'danger' };
  if (space.registrationStatus === 'inactive') return { label: 'Cadastro inativo', tone: 'danger' };
  if (space.operationalRestriction === 'maintenance') return { label: 'Em manutenção', tone: 'warning' };
  return { label: 'Sem restrição cadastral', tone: 'neutral' };
}
function RescueScenario({ scenario }: { scenario: PublicRescueScenario }) {
  const extra = [
    ['Técnicas de resgate', scenario.techniques], ['Equipamentos', scenario.equipment],
    ['Equipe', scenario.team], ['Perigos do cenário', scenario.hazards], ['Simulados', scenario.drills],
  ];
  return <article className="public-space__scenario">
    <h3>{scenario.name}</h3>
    <p className="public-space__response">{scenario.response}</p>
    {extra.some(([, value]) => value) && <dl className="public-space__scenario-data">{extra.filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
  </article>;
}
export function ConfinedSpaceProfile({ space }: { space: PublicConfinedSpace }) {
  const snapshot = space.publication.status === 'published' ? space.publication.snapshot : null;
  const plan = snapshot?.rescuePlan;
  const status = restriction(space);
  return <main className="public-space__main">
    <section className="public-space__identity" aria-labelledby="space-name">
      <p className="public-space__organization">{space.company} / {space.branch}</p>
      <h1 id="space-name">{space.name}</h1>
      <div className="public-space__identifiers"><span className="public-space__code">{space.code}</span><span className={`public-space__status public-space__status--${status.tone}`}>{status.tone !== 'neutral' && <AlertTriangle size={16} aria-hidden="true" />}{status.label}</span></div>
      {snapshot?.locationText && <p className="public-space__location">{snapshot.locationText}</p>}
    </section>
    <aside className="public-space__notice"><ShieldCheck size={20} aria-hidden="true" /><p>{space.notice}</p></aside>
    <nav className="public-space__navigation" aria-label="Nesta consulta"><a href="#resgate">Plano de resgate <ArrowDown size={15} aria-hidden="true" /></a><a href="#dados">Dados do espaço <ArrowDown size={15} aria-hidden="true" /></a><button onClick={() => window.print()}><Printer size={16} aria-hidden="true" />Imprimir</button></nav>
    <section id="resgate" className="public-space__rescue" aria-labelledby="rescue-title">
      <header className="public-space__section-heading"><div><h2 id="rescue-title"><ClipboardList size={23} aria-hidden="true" />Plano de resgate</h2><p>{plan ? 'Cenários e procedimentos do plano publicado para este espaço.' : 'Disponibilidade do plano na consulta pública.'}</p></div>{plan && <span className="public-space__published">Plano publicado</span>}</header>
      {plan?.reviewDueOn && <p className="public-space__review">Revisão prevista: <strong>{new Date(`${plan.reviewDueOn.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR')}</strong></p>}
      {plan?.scenarios?.length ? plan.scenarios.map((scenario, index) => <RescueScenario key={`${index}:${scenario.name}`} scenario={scenario} />) : <div className="public-space__unavailable"><h3>{plan ? 'Nenhum cenário disponível nesta publicação' : 'Plano de resgate não disponível nesta consulta'}</h3><p>{plan ? 'Consulte a equipe responsável para verificar os procedimentos completos.' : 'Não há um plano aprovado e publicado disponível para consulta pública. Solicite o plano vigente à equipe responsável.'}</p></div>}
    </section>
    <section id="dados" className="public-space__details" aria-labelledby="data-title"><h2 id="data-title">Dados do espaço confinado</h2>
      <dl className="public-space__data"><div><dt>Identificação</dt><dd>{space.code}</dd></div><div><dt>Filial</dt><dd>{space.branch}</dd></div><div><dt>Situação cadastral</dt><dd>{space.registrationStatus === 'active' ? 'Ativo' : 'Inativo'}</dd></div><div><dt>Restrição operacional</dt><dd>{space.operationalRestriction === 'interdicted' ? 'Interditado' : space.operationalRestriction === 'maintenance' ? 'Em manutenção' : 'Nenhuma registrada'}</dd></div>{snapshot && <><div><dt>Localização</dt><dd>{snapshot.locationText || 'Não informada na publicação'}</dd></div><div><dt>Classificação</dt><dd>{snapshot.classification || 'Não informada na publicação'}</dd></div></>}</dl>
      {snapshot?.accesses?.length ? <div className="public-space__accesses"><h3>Acessos</h3><ul>{snapshot.accesses.map((access, index) => <li key={`${index}:${access}`}>{access}</li>)}</ul></div> : <p className="public-space__muted">Os acessos não estão disponíveis neste recorte público.</p>}
    </section>
  </main>;
}
