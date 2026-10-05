import { ArrowRight, ArchiveRestore, CalendarDays } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { FormModal } from '../shared.js';
import type { Course, Event } from './types.js';

interface Props {
  drafts: Event[] | undefined;
  courses: Course[];
  loading: boolean;
  error: boolean;
  restoringId: string | null;
  onClose: () => void;
  onRetry: () => void;
  onRestore: (draft: Event) => void;
}

export function ArchivedDraftsModal({ drafts, courses, loading, error, restoringId, onClose, onRetry, onRestore }: Props) {
  return <FormModal title="Rascunhos arquivados" description="Selecione uma turma para restaurá-la. Arquivos de evidência precisarão ser anexados novamente." onClose={onClose}>
    {loading ? <div className={"space-y-3"} aria-label="Carregando rascunhos arquivados">
      {[0, 1, 2].map((index) => <div key={index} className={"h-20 animate-pulse rounded-xl bg-accent-soft"} />)}
    </div> : error ? <div role="alert" className={"rounded-xl border border-line p-6 text-center"}>
      <p className={"m-0 text-sm text-ink"}>Não foi possível carregar os rascunhos arquivados.</p>
      <Button variant="secondary" size="sm" className={"mt-3"} onClick={onRetry}>Tentar novamente</Button>
    </div> : !drafts?.length ? <div className={"rounded-xl border border-line p-8 text-center"}>
      <ArchiveRestore size={26} aria-hidden="true" className={"mx-auto mb-3 text-muted"} />
      <strong className={"block text-sm"}>Nenhum rascunho arquivado</strong>
      <p className={"mt-1 mb-0 text-sm text-muted"}>As turmas arquivadas aparecerão aqui para você retomá-las.</p>
    </div> : <ul className={"m-0 grid list-none gap-2 p-0"}>
      {drafts.map((draft) => {
        const course = courses.find((item) => item.id === draft.courseId);
        return <li key={draft.id}>
          <button type="button" disabled={restoringId !== null} aria-busy={restoringId === draft.id || undefined}
            onClick={() => onRestore(draft)}
            className={"flex min-h-20 w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-left text-ink transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"}>
            <CalendarDays size={20} aria-hidden="true" className={"shrink-0 text-accent-strong"} />
            <span className={"min-w-0 flex-1"}><strong className={"block break-words text-sm"}>{draft.title || course?.name || `Turma ${draft.id}`}</strong>
              <small className={"mt-1 block text-xs text-muted"}>{course?.name || 'Curso indisponível'} · {draft.trainingOn.split('-').reverse().join('/')}</small></span>
            <ArrowRight size={18} aria-hidden="true" className={"shrink-0 text-accent-strong"} />
          </button>
        </li>;
      })}
    </ul>}
  </FormModal>;
}
