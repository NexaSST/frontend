import { useState } from 'react';
import { CheckCircle2, ClipboardCheck, AlertCircle, Clock3 } from 'lucide-react';
import { Pagination } from '../components/Pagination.js';
import { date, trainingStatus, type PublicPerson } from './PublicProfilePage.js';

const PAGE_SIZE = 5;

export function PublicTrainingSection({ assignment, trainings, matrix, multipleBranches }: {
  assignment: PublicPerson['assignments'][number]; trainings: PublicPerson['trainings'];
  matrix?: PublicPerson['matrices'][number]; multipleBranches: boolean;
}) {
  const [page, setPage] = useState(1);
  const pending = trainings.filter((item) => item.status === 'not_completed');
  const expired = trainings.filter((item) => item.status === 'expired');
  const approaching = trainings.filter((item) => ['due_30', 'attention_90'].includes(item.status));
  const unknown = trainings.some((item) => !['up_to_date', 'due_30', 'attention_90', 'expired', 'not_completed', 'waived'].includes(item.status));
  const compliant = Boolean(matrix && trainings.length && !pending.length && !expired.length && !unknown);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(trainings.length / PAGE_SIZE)));
  const visible = trainings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return <section className="public-profile__training-section" aria-label={`Treinamentos de ${assignment.branch}`}>
    <header className="public-profile__training-title"><h2>Treinamentos</h2>{multipleBranches && <p>{assignment.branch}</p>}</header>
    {trainings.length ? <>
      <div className="public-profile__training-list">{visible.map((training) => {
        const status = trainingStatus(training.status);
        return <div className="public-profile__training" key={training.courseCode}><span className="public-profile__training-icon"><ClipboardCheck size={18} aria-hidden="true" /></span><div><strong>{training.courseName}</strong><small>{training.courseCode}{training.expiresOn ? ` · Vencimento ${date(training.expiresOn)}` : ''}</small></div><span className={`public-profile__tag public-profile__tag--${status.tone}`}>{status.label}</span></div>;
      })}</div>
      <Pagination page={currentPage} totalPages={Math.ceil(trainings.length / PAGE_SIZE)} total={trainings.length} onPageChange={setPage} />
    </> : <p className="public-profile__empty">Nenhum treinamento exigido aparece nesta consulta.</p>}
    <section className="public-profile__matrix" aria-label="Situação da matriz de treinamentos">
      <h3>Matriz de treinamentos</h3>
      {matrix ? <>
        <p className="public-profile__matrix-name">{matrix.name} · versão {matrix.version}<span>Vigência desde {date(matrix.effectiveFrom)}</span></p>
        <div className={`public-profile__matrix-status ${compliant ? 'public-profile__signal--success' : pending.length || expired.length ? 'public-profile__signal--danger' : ''}`}>
          {compliant ? <CheckCircle2 size={21} aria-hidden="true" /> : pending.length || expired.length ? <AlertCircle size={21} aria-hidden="true" /> : <Clock3 size={21} aria-hidden="true" />}
          <strong>{compliant ? 'De acordo com a matriz' : pending.length || expired.length ? 'Há exigências não atendidas' : 'Sem avaliação conclusiva'}</strong>
        </div>
        {pending.length > 0 && <p>{pending.length} {pending.length === 1 ? 'treinamento ainda não realizado' : 'treinamentos ainda não realizados'}: {pending.map((item) => item.courseName).join('; ')}.</p>}
        {expired.length > 0 && <p>{expired.length} {expired.length === 1 ? 'treinamento vencido' : 'treinamentos vencidos'}: {expired.map((item) => item.courseName).join('; ')}.</p>}
        {compliant && <p>Todos os treinamentos exigidos nesta consulta estão válidos.{approaching.length ? ` ${approaching.length} ${approaching.length === 1 ? 'treinamento está próximo do vencimento' : 'treinamentos estão próximos do vencimento'}.` : ''}</p>}
        {!trainings.length && <p>Nenhuma exigência de treinamento aparece para este colaborador nesta consulta.</p>}
        {unknown && <p>Há situações que precisam ser verificadas antes de concluir a avaliação.</p>}
      </> : <p>Nenhuma matriz publicada está disponível nesta consulta.</p>}
    </section>
  </section>;
}
