import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export type ModuleStart = { label: string; description: string; tab: string; permission: string; action?: 'new' };
export function moduleStart(domain: 'training' | 'inspections' | 'apr', summary: object, filtered: boolean): ModuleStart | null {
  const values = summary as Record<string, number>;
  if (domain === 'inspections' && !filtered && values.registeredAssets === 0) return {
    label: 'Cadastre seu primeiro ativo', description: 'Cadastre um ativo da filial para acompanhar seus prazos e organizar as inspeções.',
    tab: 'assets', permission: 'asset.manage', action: 'new',
  };
  if (domain === 'apr' && ['draftAprs', 'finalizedAprs', 'draftWorkPermits', 'authorizedWorkPermits'].every((key) => values[key] === 0)) return {
    label: 'Crie sua primeira APR', description: 'Identifique os riscos de uma atividade e defina as medidas de prevenção antes do trabalho.',
    tab: 'documents', permission: 'apr.manage', action: 'new',
  };
  if (domain === 'training' && values.applicable === 0) return {
    label: 'Configurar treinamentos', description: 'Revise os cursos e a matriz da filial para definir quais treinamentos cada colaborador precisa.',
    tab: 'courses', permission: 'training.manage',
  };
  return null;
}

export function BranchModuleStart({ start, companyId, branchId, domain }: {
  start: ModuleStart; companyId: string; branchId: string; domain: string;
}) {
  return <div className={"branch-dashboard__empty grid place-items-center gap-[.35rem] min-h-60 text-muted text-center [&.compact]:min-h-28 [&.compact]:p-4 [&_strong]:text-inherit [&_strong]:text-[.84rem] [&_span]:max-w-[45ch] [&_span]:text-[.72rem] max-[520px]:[&_span]:text-[.875rem] compact"}>
    <strong>{domain === 'training' ? 'Defina as obrigações de treinamento' : domain === 'apr' ? 'Comece a prevenção por uma atividade' : 'Comece pelo inventário da filial'}</strong>
    <span>{start.description}</span>
    <Link className={"ui-button inline-flex items-center justify-center gap-2 rounded-control font-[inherit] font-[750] cursor-pointer [transition:background_140ms_ease,border-color_140ms_ease,color_140ms_ease,transform_140ms_ease] [&:active:not(:disabled)]:transform-[translateY(1px)] disabled:cursor-not-allowed disabled:opacity-50 [&.danger]:text-danger border border-solid border-accent text-white bg-accent [&:hover:not(:disabled)]:border-accent-strong [&:hover:not(:disabled)]:bg-accent-strong min-h-[2.8rem] p-[0.65rem_1rem]"} to="/workspace/$companyId/$branchId/$moduleCode"
      params={{ companyId, branchId, moduleCode: domain }}
      search={{ tab: start.tab, page: 1, q: '', action: start.action, id: undefined, periodDays: 30 }}>
      {start.label}<ArrowRight size={16} />
    </Link>
  </div>;
}
