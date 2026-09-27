import { Button, Checkbox, CheckboxField, Input, Select, Textarea } from "../../components/ui/index.js";
import { Field } from "../shared.js";
import { AprTemplatePicker } from "./AprTemplatePicker.js";
import { riskDefault } from "./schemas.js";
import type { useDocuments } from "./useDocuments.js";
import type { WizardIssue } from "./aprWizardIssues.js";

type Context = ReturnType<typeof useDocuments>;

export function AprContextStep({ data }: { data: Context }) {
  const { form, templateNr, setTemplateNr, templateNrs, templateOptions, templateOption, selectTemplate, people } = data;
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Dados da APR</h3><p className="text-sm text-muted">Identifique a atividade, o local e a pessoa responsável pela análise.</p></header>
    <div className="form-stack"><div className="form-row"><Field label="Referência"><Input placeholder="Ex.: APR-2026-001" {...form.register("referenceCode")} /></Field><Field label="Título"><Input {...form.register("title")} /></Field></div>
      <AprTemplatePicker nr={templateNr} nrs={templateNrs} templates={templateOptions} selectedVersionId={form.watch("templateVersionId")}
        onNrChange={setTemplateNr} onVersionChange={(versionId) => {
          form.setValue("templateVersionId", versionId, { shouldDirty: true });
          form.setValue("activityId", templateOptions.find((item) => item.versionId === versionId)?.activityId ?? "", { shouldDirty: true });
        }} onVersionSelect={(versionId) => { void selectTemplate(versionId); }} />
      <Field label="Atividade do template"><Input value={templateOption?.name ?? ""} placeholder="Selecione um template" disabled readOnly /></Field>
      <div className="form-row"><Field label="Setor"><Input {...form.register("sector")} /></Field><Field label="Localização"><Input {...form.register("location")} /></Field></div>
      <div className="form-row"><Field label="Data da atividade"><Input type="date" {...form.register("executionOn")} /></Field><Field label="Responsável pela análise"><Select {...form.register("analystPersonId")}><option value="">Selecione</option>{people.data?.rows.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}</Select></Field></div>
      <Field label="Equipe envolvida"><Input placeholder="Nomes ou descrição da equipe" {...form.register("teamText")} /></Field>
    </div>
  </section>;
}

export function AprRisksStep({ data }: { data: Context }) {
  const { form, risks } = data;
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Etapas, riscos e controles</h3><p className="text-sm text-muted">Descreva cada etapa da tarefa, o perigo e a medida de controle correspondente.</p></header>
    <div className="space-y-4">{risks.fields.map((field, i) => <section key={field.id} className="rounded-2xl border border-slate-200 p-5 space-y-4"><div className="flex items-center justify-between gap-4"><strong>Risco {i + 1}</strong><Button type="button" variant="ghost" size="sm" className="danger" onClick={() => risks.remove(i)}>Remover</Button></div>
      <Field label="Etapa da tarefa"><Input {...form.register(`risks.${i}.taskStep`)} /></Field>
      <Field label="Perigo"><Input {...form.register(`risks.${i}.hazard`)} /></Field>
      <Field label="Consequência"><Input {...form.register(`risks.${i}.consequence`)} /></Field>
      <div className="form-row"><Field label="Severidade"><Input {...form.register(`risks.${i}.severityCode`)} /></Field><Field label="Probabilidade"><Input {...form.register(`risks.${i}.likelihoodCode`)} /></Field></div>
      {form.watch(`risks.${i}.controls`)?.map((_, controlIndex) => <div key={controlIndex} className="flex items-end gap-2"><div className="min-w-0 flex-1"><Field label={`Medida de controle ${controlIndex + 1}`}><Textarea rows={2} {...form.register(`risks.${i}.controls.${controlIndex}.description`)} /></Field></div><Button type="button" variant="ghost" size="sm" onClick={() => {
        const current = form.getValues(`risks.${i}.controls`); form.setValue(`risks.${i}.controls`, current.filter((__, index) => index !== controlIndex), { shouldDirty: true });
      }}>Remover</Button></div>)}
      <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue(`risks.${i}.controls`, [...form.getValues(`risks.${i}.controls`), { description: "" }], { shouldDirty: true })}>Adicionar controle</Button>
    </section>)}</div>
    <Button type="button" variant="secondary" onClick={() => risks.append({ ...riskDefault, controls: [{ description: "" }] })}>Adicionar risco</Button>
  </section>;
}

export function AprQuestionsStep({ data }: { data: Context }) {
  const { form, answers, templateDetail } = data;
  const questions = templateDetail.data?.definition?.questions ?? [];
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Perguntas de segurança</h3><p className="text-sm text-muted">Responda às perguntas do template. Para “Não” ou “N/A”, explique a resposta.</p></header>
    <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950">{answers.filter((answer) => Boolean(answer.answer)).length} de {questions.length} respondidas</p>
    {questions.length ? <div className="space-y-4">{questions.map((question, index) => <section key={question.code} className="rounded-2xl border border-slate-200 p-5 space-y-3"><strong>{index + 1}. {question.text} {question.required && <span className="text-red-700">*</span>}</strong>
      <input type="hidden" {...form.register(`answers.${index}.code`)} value={question.code} />
      <Field label="Resposta"><Select {...form.register(`answers.${index}.answer`)}><option value="">Pendente</option><option value="yes">Sim</option><option value="no">Não</option>{question.allowNa && <option value="na">N/A</option>}</Select></Field>
      <Field label={answers[index]?.answer === "na" ? "Justificativa para N/A" : "Observação"}><Textarea rows={2} placeholder={answers[index]?.answer === "no" ? "Descreva a condição encontrada" : "Registre detalhes, se necessário"} {...form.register(`answers.${index}.observation`)} /></Field>
    </section>)}</div> : <p className="rounded-xl border border-slate-200 p-5 text-sm text-muted">Este template não possui perguntas de segurança.</p>}
  </section>;
}

export function AprParticipantsStep({ data }: { data: Context }) {
  const { form, people } = data;
  const selected = form.watch("participantIds") ?? [];
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Participantes</h3><p className="text-sm text-muted">Selecione quem participará e assinará esta APR. Inclua o responsável pela análise.</p></header>
    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950">{selected.length} {selected.length === 1 ? "selecionado" : "selecionados"}</div>
    <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-semibold">Colaboradores da filial</legend>
      {people.isLoading ? <p>Carregando colaboradores…</p> : people.isError ? <div><p>Não foi possível carregar os colaboradores.</p><Button type="button" variant="secondary" size="sm" onClick={() => void people.refetch()}>Tentar novamente</Button></div> : people.data?.rows.length ? people.data.rows.map((person) => <CheckboxField key={person.id} label={person.fullName}><Checkbox value={person.id} {...form.register("participantIds")} /></CheckboxField>) : <p className="text-sm text-muted">Nenhum colaborador ativo nesta filial. Cadastre participantes para finalizar a APR.</p>}
    </fieldset>
  </section>;
}

export function AprReviewStep({ data, issues, onGoTo }: { data: Context; issues: WizardIssue[]; onGoTo: (step: number) => void }) {
  const values = data.form.getValues();
  const steps = ["Dados da APR", "Etapas, riscos e controles", "Perguntas de segurança", "Participantes"];
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Revisão e finalização</h3><p className="text-sm text-muted">Confira os dados antes de gerar a revisão final da APR.</p></header>
    <div className="rounded-2xl border border-slate-200 p-5"><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-muted">APR</dt><dd className="font-semibold">{values.referenceCode} · {values.title}</dd></div><div><dt className="text-sm text-muted">Template</dt><dd className="font-semibold">{data.templateOption?.name ?? "Não selecionado"}</dd></div><div><dt className="text-sm text-muted">Local e data</dt><dd className="font-semibold">{values.location || "Pendente"} · {values.executionOn || "Pendente"}</dd></div><div><dt className="text-sm text-muted">Riscos e participantes</dt><dd className="font-semibold">{values.risks.length} riscos · {values.participantIds.length} participantes</dd></div></dl></div>
    {issues.length ? <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5"><h4 className="font-bold text-amber-950">Pendências para finalizar</h4><ul className="mt-3 space-y-2">{issues.map((issue, index) => <li key={`${issue.step}-${index}`} className="flex items-start justify-between gap-3 text-sm"><span>{issue.message}</span><button type="button" className="shrink-0 font-semibold text-emerald-900 underline" onClick={() => onGoTo(issue.step)}>Ir para {steps[issue.step - 1]}</button></li>)}</ul></section> : <p className="rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-950">Tudo pronto para finalizar a APR.</p>}
  </section>;
}
