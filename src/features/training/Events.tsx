import { frequencyLabel } from './config.js';
import type { Frequency } from './types.js';
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { Archive, ArrowRight, CalendarCheck2, ChevronLeft, ChevronRight, FileCheck2, UsersRound } from "lucide-react";
import { apiJson } from "../../lib/api.js";
import { Badge, Button, ConfirmDialog, Input, Select } from "../../components/ui/index.js";
import { DataTable, Field, ListToolbar, PagedFooter, QueryState, WorkflowModal, WorkflowStepper, useAllRows, usePagedRows } from "../shared.js";
import type { Props, Event, Course, Person } from "./types.js";
import { root, uploadTrainingEvidence } from "./api.js";
import { trainingTypes, modalities, eventSteps, expirationDate } from "./config.js";
import { ParticipantSelector } from "./ParticipantSelector.js";
import { ArchivedDraftsModal } from './ArchivedDraftsModal.js';
export function Events({ scope, search, setSearch }: Omit<Props, "tab">) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [collectiveFiles, setCollectiveFiles] = useState<File[]>([]);
  const [individualFiles, setIndividualFiles] = useState<Record<string, File | undefined>>({});
  const [abandoning, setAbandoning] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const endpoint = `${root(scope)}/training-events`;
  const query = usePagedRows<Event>("training-events", endpoint, search);
  const drafts = useAllRows<Event>('training-event-drafts', `${endpoint}/drafts`);
  const archivedDrafts = useAllRows<Event>('training-event-archived-drafts', `${endpoint}/archived-drafts`, archivedOpen);
  const courses = useAllRows<Course>(
    "course-options",
    `${root(scope)}/training-courses`,
  );
  const frequencies = useAllRows<Frequency>('event-frequency-options', `${root(scope)}/training-frequencies`);
  const people = useAllRows<Person>('event-participants', `${endpoint}/participants`, search.action === 'new' && step >= 2);
  const schema = z.object({
    modality: z.string().min(1),
    courseId: z.string().min(1),
    trainingOn: z.string().min(1),
    title: z.string().optional(),
    instructorName: z.string().optional(),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      modality: "",
      courseId: "",
      trainingOn: new Date().toISOString().slice(0, 10),
      title: "",
      instructorName: "",
    },
  });
  const startDraft = useMutation({ mutationFn: (v: z.infer<typeof schema>) => apiJson<{ id: string }>(draftId ? `${endpoint}/${draftId}/draft` : `${endpoint}/drafts`, { method: draftId ? 'patch' : 'post', json: { ...(draftId ? { step: 2, participants: participantIds.map((personId) => ({ personId })) } : {}), modality: v.modality, courseId: v.courseId, trainingOn: v.trainingOn,
    ...(draftId ? { title: v.title?.trim() || null, instructorName: v.instructorName?.trim() || null } : { ...(v.title ? { title: v.title } : {}), ...(v.instructorName ? { instructorName: v.instructorName } : {}) }) } }),
    onSuccess: ({ id }) => { setDraftId(id); setStep(2); void qc.invalidateQueries({ queryKey: ['training-event-drafts'] }); }, onError: () => sileo.error({ title: 'Não foi possível salvar o rascunho' }) });
  const persistDraft = useMutation({ mutationFn: async (nextStep: number) => {
    if (!draftId) throw new Error('Rascunho não encontrado');
    await apiJson(`${endpoint}/${draftId}/draft`, { method: 'patch', json: { step: nextStep, participants: participantIds.map((personId) => ({ personId })) } });
    return nextStep;
  }, onSuccess: (nextStep) => setStep(nextStep), onError: (error: Error) => sileo.error({ title: 'Não foi possível salvar esta etapa', description: error.message }) });
  const conclude = useMutation({ mutationFn: async () => {
    if (!draftId) throw new Error('Rascunho não encontrado');
    const collectiveEvidenceFileIds = await Promise.all(collectiveFiles.map((file) => uploadTrainingEvidence(scope, file)));
    const participants = await Promise.all(participantIds.map(async (personId) => ({ personId,
      evidenceFileIds: individualFiles[personId] ? [await uploadTrainingEvidence(scope, individualFiles[personId]!)] : [] })));
    return apiJson(`${endpoint}/${draftId}/complete`, { method: 'post', json: { participants, collectiveEvidenceFileIds } });
  }, onSuccess: async () => { await Promise.all([qc.invalidateQueries({ queryKey: ['training-events'] }), qc.invalidateQueries({ queryKey: ['training-event-drafts'] })]); setSearch({ action: undefined }); setDraftId(null); setStep(1); setParticipantIds([]); setCollectiveFiles([]); setIndividualFiles({}); form.reset(); sileo.success({ title: 'Turma concluída com evidências' }); },
  onError: (error: Error) => sileo.error({ title: 'Não foi possível concluir a turma', description: error.message }) });
  const saveCurrentDraft = async () => {
    if (!draftId) return;
    const values = form.getValues();
    await apiJson(`${endpoint}/${draftId}/draft`, { method: 'patch', json: { ...values, title: values.title?.trim() || null,
      instructorName: values.instructorName?.trim() || null, step, participants: participantIds.map((personId) => ({ personId })) } });
  };
  const closeDraft = useMutation({ mutationFn: saveCurrentDraft, onSuccess: async () => {
    await qc.invalidateQueries({ queryKey: ['training-event-drafts'] });
    setSearch({ action: undefined });
    if (collectiveFiles.length || Object.values(individualFiles).some(Boolean)) sileo.info({ title: 'Rascunho salvo', description: 'Ao retomar, anexe novamente os arquivos de evidência selecionados.' });
  }, onError: (error: Error) => sileo.error({ title: 'Não foi possível salvar o rascunho', description: error.message }) });
  const abandon = useMutation({ mutationFn: async () => {
    if (!draftId) throw new Error('Rascunho não encontrado');
    await saveCurrentDraft();
    return apiJson(`${endpoint}/${draftId}`, { method: 'delete' });
  }, onSuccess: async () => {
    await Promise.all([qc.invalidateQueries({ queryKey: ['training-event-drafts'] }), qc.invalidateQueries({ queryKey: ['training-event-archived-drafts'] })]);
    setAbandoning(false); setDraftId(null); setStep(1); setParticipantIds([]); setCollectiveFiles([]); setIndividualFiles({}); setSearch({ action: undefined }); sileo.success({ title: 'Rascunho arquivado' });
  }, onError: (error: Error) => sileo.error({ title: 'Não foi possível arquivar o rascunho', description: error.message }) });
  const selectedCourse = courses.data?.rows.find((course) => course.id === form.watch('courseId'));
  const selectedDate = form.watch('trainingOn');
  const evidenceReady = Boolean(participantIds.length) && (Boolean(collectiveFiles.length) || participantIds.every((personId) => Boolean(individualFiles[personId])));
  const beginEvent = () => {
    setDraftId(null); setStep(1); setParticipantIds([]); setCollectiveFiles([]); setIndividualFiles({});
    form.reset({ modality: '', courseId: '', trainingOn: new Date().toISOString().slice(0, 10), title: '', instructorName: '' });
    setSearch({ action: 'new' });
  };
  const resumeDraft = (draft: Event) => { setDraftId(draft.id); setStep(draft.modality ? Math.min(draft.draft?.step ?? 2, 3) : 1); setParticipantIds(draft.draft?.participants?.map((item) => item.personId) ?? []); setCollectiveFiles([]); setIndividualFiles({});
    form.reset({ modality: draft.modality ?? '', courseId: draft.courseId, trainingOn: draft.trainingOn, title: draft.title ?? '', instructorName: draft.instructorName ?? '' }); setSearch({ action: 'new' }); };
  const restore = useMutation({ mutationFn: (draft: Event) => apiJson<Event>(`${endpoint}/${draft.id}/restore`, { method: 'post' }), onSuccess: async (draft) => {
    await Promise.all([qc.invalidateQueries({ queryKey: ['training-event-drafts'] }), qc.invalidateQueries({ queryKey: ['training-event-archived-drafts'] })]);
    setArchivedOpen(false); resumeDraft(draft); sileo.success({ title: 'Rascunho restaurado' });
  }, onError: (error: Error) => sileo.error({ title: 'Não foi possível restaurar o rascunho', description: error.message }) });
  const editorFooter = step === 1
    ? <><span className="workflow-modal__progress">Etapa 1 de 4</span><Button type="submit" form="training-event-form" loading={startDraft.isPending} trailingIcon={<ChevronRight size={17} />}>Continuar para participantes</Button></>
    : step === 2
      ? <><Button variant="ghost" onClick={() => setStep(1)} leadingIcon={<ChevronLeft size={17} />}>Voltar</Button><Button disabled={!participantIds.length || persistDraft.isPending} loading={persistDraft.isPending} onClick={() => persistDraft.mutate(3)} trailingIcon={<ChevronRight size={17} />}>Continuar para evidências</Button></>
      : step === 3
        ? <><Button variant="ghost" onClick={() => setStep(2)} leadingIcon={<ChevronLeft size={17} />}>Voltar</Button><Button disabled={!evidenceReady || persistDraft.isPending} loading={persistDraft.isPending} onClick={() => persistDraft.mutate(4)} trailingIcon={<ChevronRight size={17} />}>Revisar turma</Button></>
        : <><Button variant="ghost" onClick={() => setStep(3)} leadingIcon={<ChevronLeft size={17} />}>Voltar às evidências</Button><Button disabled={!participantIds.length || !evidenceReady} loading={conclude.isPending} onClick={() => conclude.mutate()} leadingIcon={<FileCheck2 size={17} />}>Concluir e validar evidências</Button></>;
  return (
    <div className="training-resource training-events-page">
      <section className="resource-main">
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={beginEvent}
          createLabel="Nova turma"
          actions={<Button variant="secondary" size="sm" leadingIcon={<Archive size={16} aria-hidden="true" />} onClick={() => setArchivedOpen(true)}>Arquivados</Button>}
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["Turma", "Curso", "Data", "Modalidade", "Instrutor"]}
            rows={(query.data?.rows ?? []).map((r) => [
              <strong>{r.title ?? "Turma sem título"}</strong>,
              courses.data?.rows.find((c) => c.id === r.courseId)?.name ??
                r.courseId,
              r.trainingOn,
              modalities[r.modality ?? ""] ?? "Não informado",
              r.instructorName ?? "—",
            ])}
            keyOf={(i) => query.data!.rows[i]!.id}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
        {Boolean(drafts.data?.rows.length) && <section className="training-drafts" aria-labelledby="training-drafts-title"><header><div><span className="training-drafts__icon"><CalendarCheck2 size={18} /></span><div><h3 id="training-drafts-title">Rascunhos em andamento</h3><p>Retome um registro sem perder o que já foi preenchido.</p></div></div><Badge tone="warning">{drafts.data!.rows.length} {drafts.data!.rows.length === 1 ? 'rascunho' : 'rascunhos'}</Badge></header><div className="training-drafts__list">{drafts.data!.rows.map((draft) => { const draftStep = Math.min(draft.draft?.step ?? 1, 4); const course = courses.data?.rows.find((item) => item.id === draft.courseId); return <article className="training-draft-row" key={draft.id}><div className="training-draft-row__content"><strong>{draft.title ?? course?.name ?? 'Turma sem título'}</strong><p>{course?.name ?? draft.courseId} · {draft.trainingOn}</p><small>Etapa {draftStep} de 4 · {eventSteps[draftStep - 1]}</small></div><Button variant="secondary" size="sm" onClick={() => resumeDraft(draft)} trailingIcon={<ArrowRight size={16} />}>Continuar</Button></article>; })}</div></section>}
      </section>
      {archivedOpen && <ArchivedDraftsModal drafts={archivedDrafts.data?.rows} courses={courses.data?.rows ?? []}
        loading={archivedDrafts.isLoading} error={archivedDrafts.isError} restoringId={restore.isPending ? restore.variables?.id ?? null : null}
        onClose={() => setArchivedOpen(false)} onRetry={() => void archivedDrafts.refetch()} onRestore={(draft) => restore.mutate(draft)} />}
      {search.action === "new" && (
        <WorkflowModal
          title="Registrar turma realizada"
          description="O rascunho fica salvo no servidor. As conclusões só são criadas depois das evidências."
          focusKey={step}
          onClose={() => draftId ? closeDraft.mutate() : setSearch({ action: undefined })}
          footer={<>{draftId && <Button variant="ghost" size="sm" leadingIcon={<Archive size={16} />} onClick={() => setAbandoning(true)}>Arquivar rascunho</Button>}{editorFooter}</>}
        >
          <WorkflowStepper steps={eventSteps} current={step} onStep={setStep} />
          {step === 1 && <section className="training-event-step"><header className="training-event-step__heading"><span><CalendarCheck2 size={21} /></span><div><h3>Dados do treinamento</h3><p>Identifique o curso realizado e os dados desta turma.</p></div></header><form id="training-event-form" className="training-event-setup" onSubmit={form.handleSubmit((v) => startDraft.mutate(v))}><div className="form-stack training-event-fields"><Field label="Curso"><Select aria-label="Curso" {...form.register("courseId")}><option value="">Selecione o curso</option>{courses.data?.rows.map((r) => <option key={r.id} value={r.id}>{r.code} · {r.name}</option>)}</Select></Field><div className="training-event-field-row"><Field label="Data realizada"><Input aria-label="Data realizada" required type="date" max={new Date().toISOString().slice(0, 10)} {...form.register("trainingOn")} /></Field><Field label="Modalidade"><Select aria-label="Modalidade" required {...form.register('modality')}><option value="">Selecione a modalidade</option>{Object.entries(modalities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field></div><Field label="Título"><Input placeholder="Como esta turma será identificada" {...form.register("title")} /></Field><Field label="Instrutor"><Input placeholder="Nome do responsável pelo treinamento" {...form.register("instructorName")} /></Field></div><aside className="review-card training-event-course-card"><span className="workspace-eyebrow">Resumo do curso</span><dl><div><dt>Tipo</dt><dd>{selectedCourse ? trainingTypes[selectedCourse.type ?? ''] ?? 'Não informado' : 'Selecione o curso'}</dd></div><div><dt>Frequência</dt><dd>{selectedCourse ? frequencies.data?.rows.find((f) => f.id === selectedCourse.frequencyId)?.name ? frequencyLabel(frequencies.data.rows.find((f) => f.id === selectedCourse.frequencyId)!) : selectedCourse.validityDays === null ? 'Sem frequência' : `${selectedCourse.validityDays} dias` : 'Selecione o curso'}</dd></div><div><dt>Vencimento previsto</dt><dd>{selectedCourse ? expirationDate(selectedDate, selectedCourse.validityDays) : 'Selecione o curso'}</dd></div></dl></aside></form></section>}
          {step === 2 && <section className="training-event-step"><header className="training-event-step__heading"><span><UsersRound size={21} /></span><div><h3>Selecione os participantes</h3><p>Marque todas as pessoas que concluíram esta turma.</p></div><Badge tone={participantIds.length ? 'info' : 'neutral'}>{participantIds.length} selecionados</Badge></header><ParticipantSelector people={people.data?.rows} loading={people.isLoading} error={people.isError} selectedIds={participantIds} onSelectionChange={setParticipantIds} onRetry={() => void people.refetch()} /></section>}
          {step === 3 && <section className="training-event-step"><header className="training-event-step__heading"><span><FileCheck2 size={21} /></span><div><h3>Anexe as evidências</h3><p>Use uma evidência coletiva ou um certificado individual para cada participante.</p></div><Badge tone={evidenceReady ? 'success' : 'warning'}>{evidenceReady ? 'Pronto para revisar' : 'Evidências pendentes'}</Badge></header><div className="training-evidence-grid"><div className="training-evidence-card"><Field label="Evidência coletiva (PDF, JPEG ou PNG)"><Input type="file" accept="application/pdf,image/jpeg,image/png" multiple onChange={(event) => setCollectiveFiles(Array.from(event.target.files ?? []))} /></Field><p>Um único arquivo pode comprovar a participação de toda a turma.</p></div><div className="individual-evidence-list"><strong>Certificados individuais</strong><p>Opcional quando houver uma evidência coletiva.</p>{participantIds.map((personId) => { const person = people.data?.rows.find((item) => item.id === personId); return <Field key={personId} label={person?.fullName ?? personId}><Input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setIndividualFiles((current) => ({ ...current, [personId]: event.target.files?.[0] }))} /></Field>; })}</div></div></section>}
          {step === 4 && <section className="training-event-step training-event-review"><header className="training-event-step__heading"><span><FileCheck2 size={21} /></span><div><h3>Revise antes de concluir</h3><p>Esta ação cria as conclusões e registra as evidências para os participantes.</p></div></header><div className="review-card"><dl><div><dt>Curso</dt><dd>{courses.data?.rows.find((course) => course.id === form.getValues('courseId'))?.name}</dd></div><div><dt>Data</dt><dd>{form.getValues('trainingOn')}</dd></div><div><dt>Modalidade</dt><dd>{modalities[form.getValues('modality')]}</dd></div><div><dt>Vencimento previsto</dt><dd>{expirationDate(selectedDate, selectedCourse?.validityDays)}</dd></div><div><dt>Participantes</dt><dd>{participantIds.length}</dd></div><div><dt>Evidências</dt><dd>{collectiveFiles.length + Object.values(individualFiles).filter(Boolean).length}</dd></div></dl></div></section>}
        </WorkflowModal>
      )}
      <ConfirmDialog open={abandoning} title="Arquivar este rascunho?" description="Ele sairá da lista em andamento e poderá ser retomado em Arquivados. Arquivos de evidência selecionados precisarão ser anexados novamente." busy={abandon.isPending} onCancel={() => setAbandoning(false)} onConfirm={() => abandon.mutate()} />
    </div>
  );
}
