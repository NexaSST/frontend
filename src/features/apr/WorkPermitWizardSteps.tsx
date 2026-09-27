import { useState } from "react";
import { Search } from "lucide-react";
import { Button, Input, Select, Textarea } from "../../components/ui/index.js";
import { Field } from "../shared.js";
import type { useWorkPermitEditor } from "./useWorkPermitEditor.js";
import type { PermitIssue } from "./workPermitIssues.js";

type Editor = ReturnType<typeof useWorkPermitEditor>;

export function PermitWorkStep({ editor }: { editor: Editor }) {
  const { form, activities } = editor;
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Dados do trabalho</h3><p className="text-sm text-muted">Identifique o serviço, a atividade e o período da permissão.</p></header>
    <div className="form-stack"><div className="form-row"><Field label="Referência"><Input placeholder="Ex.: PT-2026-001" {...form.register("referenceCode")} /></Field><Field label="Título"><Input {...form.register("title")} /></Field></div>
      <Field label="Descrição do trabalho"><Textarea rows={5} {...form.register("workDescription")} /></Field>
      <Field label="Atividade"><Select {...form.register("activityId")}><option value="">Não informada</option>{activities.data?.rows.map((activity) => <option key={activity.id} value={activity.id}>{activity.name}</option>)}</Select></Field>
      <div className="form-row"><Field label="Início previsto"><Input type="datetime-local" {...form.register("startsAt")} /></Field><Field label="Fim previsto"><Input type="datetime-local" {...form.register("endsAt")} /></Field></div>
    </div>
  </section>;
}

export function PermitAprStep({ editor }: { editor: Editor }) {
  const [search, setSearch] = useState("");
  const { form, aprs, selectAprs } = editor;
  const selected = form.watch("aprDocumentIds");
  const available = (aprs.data?.rows ?? []).filter((apr) => apr.status === "finalized");
  const filtered = available.filter((apr) => `${apr.referenceCode} ${apr.title}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">APR vinculada</h3><p className="text-sm text-muted">Vincule uma APR finalizada, se houver. A PT guardará a revisão escolhida ao salvar.</p></header>
    <p className="rounded-xl border border-line bg-accent-soft px-4 py-3 text-sm text-ink">A análise de riscos e as perguntas de segurança são feitas na APR. Não é preciso respondê-las novamente nesta PT.</p>
    <div className="relative"><Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" /><Input aria-label="Buscar APR finalizada" placeholder="Buscar por referência ou título" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10!" /></div>
    {aprs.isLoading ? <p className="text-sm text-muted">Carregando APRs…</p> : aprs.isError ? <div role="alert" className="rounded-xl border border-line p-5"><p>Não foi possível carregar as APRs.</p><Button type="button" variant="secondary" size="sm" onClick={() => void aprs.refetch()}>Tentar novamente</Button></div> : !available.length ? <p className="rounded-xl border border-line p-5 text-sm text-muted">Ainda não há APR finalizada nesta filial. Você pode continuar e vinculá-la depois.</p> : <fieldset className="max-h-[24rem] space-y-1 overflow-y-auto rounded-xl border border-line p-2"><legend className="sr-only">APRs finalizadas disponíveis</legend>{filtered.length ? filtered.map((apr) => <label key={apr.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent-soft focus-within:outline-2 focus-within:outline-accent"><input type="checkbox" className="size-4 shrink-0 accent-accent" checked={selected.includes(apr.id)} onChange={(event) => void selectAprs(event.target.checked ? [...selected, apr.id] : selected.filter((id) => id !== apr.id))} /><span className="min-w-0"><strong className="block break-words text-sm text-ink">{apr.referenceCode}</strong><small className="block break-words text-sm text-muted">{apr.title}</small></span></label>) : <p className="p-3 text-sm text-muted">Nenhuma APR encontrada para esta busca.</p>}</fieldset>}
    <p className="text-sm text-muted">{selected.length} {selected.length === 1 ? "APR vinculada" : "APRs vinculadas"}. Participantes da APR selecionada serão sugeridos na próxima etapa.</p>
  </section>;
}

export function PermitPeopleStep({ editor }: { editor: Editor }) {
  const [search, setSearch] = useState("");
  const { form, people } = editor;
  const selected = form.watch("participantIds");
  const filtered = (people.data?.rows ?? []).filter((person) => person.fullName.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));
  const toggle = (id: string, checked: boolean) => form.setValue("participantIds", checked ? [...selected, id] : selected.filter((item) => item !== id), { shouldDirty: true });
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Participantes da PT</h3><p className="text-sm text-muted">Confirme quem participará deste trabalho. A equipe pode ser diferente da APR.</p></header>
    <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">{selected.length} {selected.length === 1 ? "selecionado" : "selecionados"}</p>
    <div className="relative"><Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" /><Input aria-label="Buscar colaboradores" placeholder="Buscar colaborador por nome" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10!" /></div>
    {people.isLoading ? <p className="text-sm text-muted">Carregando colaboradores…</p> : people.isError ? <div role="alert" className="rounded-xl border border-line p-5"><p>Não foi possível carregar os colaboradores.</p><Button type="button" variant="secondary" size="sm" onClick={() => void people.refetch()}>Tentar novamente</Button></div> : !people.data?.rows.length ? <p className="rounded-xl border border-line p-5 text-sm text-muted">Nenhum colaborador ativo nesta filial. Cadastre ou vincule colaboradores antes de autorizar a PT.</p> : <fieldset className="max-h-[24rem] space-y-1 overflow-y-auto rounded-xl border border-line p-2"><legend className="sr-only">Colaboradores participantes</legend>{filtered.length ? filtered.map((person) => <label key={person.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent-soft focus-within:outline-2 focus-within:outline-accent"><input type="checkbox" className="size-4 shrink-0 accent-accent" checked={selected.includes(person.id)} onChange={(event) => toggle(person.id, event.target.checked)} /><span className="break-words text-sm font-semibold text-ink">{person.fullName}</span></label>) : <p className="p-3 text-sm text-muted">Nenhum colaborador encontrado.</p>}</fieldset>}
  </section>;
}

export function PermitReviewStep({ editor, issues, onGoTo }: { editor: Editor; issues: PermitIssue[]; onGoTo: (step: number) => void }) {
  const values = editor.form.getValues();
  const stepNames = ["Dados do trabalho", "APR vinculada", "Participantes"];
  return <section className="space-y-5"><header><h3 className="text-xl font-bold">Revisão e autorização</h3><p className="text-sm text-muted">Confira a PT antes de autorizar a execução do trabalho.</p></header>
    <div className="rounded-2xl border border-line p-5"><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-muted">Permissão</dt><dd className="font-semibold">{values.referenceCode} · {values.title}</dd></div><div><dt className="text-sm text-muted">Atividade</dt><dd className="font-semibold">{editor.activities.data?.rows.find((item) => item.id === values.activityId)?.name ?? "Não informada"}</dd></div><div><dt className="text-sm text-muted">Período</dt><dd className="font-semibold">{values.startsAt || "Sem início"} — {values.endsAt || "Sem fim"}</dd></div><div><dt className="text-sm text-muted">Vínculos</dt><dd className="font-semibold">{values.aprDocumentIds.length} APR · {values.participantIds.length} participantes</dd></div></dl></div>
    {issues.length ? <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5"><h4 className="font-bold text-amber-950">Pendências para autorizar</h4><ul className="mt-3 space-y-2">{issues.map((issue, index) => <li key={`${issue.step}-${index}`} className="flex items-start justify-between gap-3 text-sm"><span>{issue.message}</span><button type="button" className="shrink-0 font-semibold text-emerald-900 underline" onClick={() => onGoTo(issue.step)}>Ir para {stepNames[issue.step - 1]}</button></li>)}</ul></section> : <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">Dados prontos para autorização. Os treinamentos aplicáveis serão verificados ao autorizar.</p>}
  </section>;
}
