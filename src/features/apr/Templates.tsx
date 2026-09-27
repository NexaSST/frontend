import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Eye } from "lucide-react";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { Button, Checkbox, CheckboxField, Input, Select, Textarea } from "../../components/ui/index.js";
import { DataTable, FormModal, Field, ListToolbar, PagedFooter, QueryState, useAllRows, usePagedRows } from "../shared.js";
import type { Props, Named, Template, CatalogItem, CatalogDetail } from "./types.js";
import { root } from "./api.js";
export function Templates({ scope, search, setSearch }: Omit<Props, "tab">) {
  const qc = useQueryClient();
  const [catalogPage, setCatalogPage] = useState(1);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const endpoint = `${root(scope)}/apr-templates`;
  const catalogEndpoint = `${root(scope)}/apr-catalog`;
  const activities = useAllRows<Named>("apr-activity-options", `${root(scope)}/apr-activities`);
  const query = usePagedRows<Template>("apr-templates", endpoint, search, search.nr ? { nr: search.nr } : undefined);
  const catalog = useQuery({ queryKey: ["apr-catalog", catalogEndpoint], queryFn: () => apiJson<CatalogItem[]>(catalogEndpoint) });
  const previewItem = catalog.data?.find((item) => item.code === previewCode);
  const preview = useQuery({
    queryKey: ["apr-catalog-detail", catalogEndpoint, previewCode],
    queryFn: () => apiJson<CatalogDetail>(`${catalogEndpoint}/${previewCode}`),
    enabled: Boolean(previewCode),
  });
  const searchWords = search.q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim().split(/\s+/).filter(Boolean);
  const catalogRows = (catalog.data ?? []).filter((item) =>
    (!search.nr || item.nr === search.nr) && searchWords.every((word) =>
      `${item.nr} ${item.name}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").includes(word)));
  const catalogPageCount = Math.max(1, Math.ceil(catalogRows.length / 12));
  const visibleCatalog = catalogRows.slice((Math.min(catalogPage, catalogPageCount) - 1) * 12,
    Math.min(catalogPage, catalogPageCount) * 12);
  const catalogNrs = [...new Set((catalog.data ?? []).map((item) => item.nr))].sort();
  const importedCount = catalog.data?.filter((item) => item.imported).length ?? 0;
  const pendingCount = catalog.data?.filter((item) => !item.upToDate).length ?? 0;
  const selected = query.data?.rows.find((r) => r.id === search.id);
  const detail = useQuery({
    queryKey: ["apr-template", endpoint, selected?.id],
    queryFn: () => apiJson<Template>(`${endpoint}/${selected!.id}`),
    enabled: Boolean(selected),
  });
  type TemplateForm = { name: string; nr: string; activityId: string; instructions: string; riskSummary: string; controlSummary: string;
    questions: Array<{ code?: string; text: string; required: boolean; allowNa: boolean }> };
  const form = useForm<TemplateForm>({
    defaultValues: { name: "", nr: "", activityId: "", instructions: "", riskSummary: "", controlSummary: "", questions: [] },
  });
  const questions = useFieldArray({ control: form.control, name: "questions" });
  useEffect(() => {
    if (detail.data)
      form.reset({
        name: detail.data.name,
        nr: detail.data.definition?.nr ?? "",
        activityId: detail.data.activityId ?? "",
        instructions: detail.data.definition?.instructions ?? "",
        riskSummary: detail.data.definition?.riskSummary ?? "",
        controlSummary: detail.data.definition?.controlSummary ?? "",
        questions: detail.data.definition?.questions ?? [],
      });
    else if (search.action === "new")
      form.reset({ name: "", nr: "", activityId: "", instructions: "", riskSummary: "", controlSummary: "", questions: [] });
  }, [detail.data, search.action, form]);
  const save = useMutation({
    mutationFn: (v: TemplateForm) =>
      apiJson(selected ? `${endpoint}/${selected.id}/versions` : endpoint, {
        method: "post",
        json: { ...v, nr: v.nr || undefined, activityId: v.activityId || undefined,
          questions: v.questions.map(({ code, ...question }) => code ? { ...question, code } : question) },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["apr-templates"] });
      setSearch({ action: undefined, id: undefined });
      sileo.success({
        title: selected ? "Nova versão publicada" : "Template publicado",
      });
    },
    onError: () =>
      sileo.error({ title: "Não foi possível publicar o template" }),
  });
  const importCatalog = useMutation({
    mutationFn: (code?: string) => apiJson(code ? `${catalogEndpoint}/${code}/import` : `${catalogEndpoint}/import-all`, { method: "post" }),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: ["apr-catalog"] }), qc.invalidateQueries({ queryKey: ["apr-templates"] }),
        qc.invalidateQueries({ queryKey: ["apr-activities"] })]);
      sileo.success({ title: "Modelos APR importados" });
    },
    onError: () => sileo.error({ title: "Não foi possível importar o catálogo APR" }),
  });
  return (
    <div className="resource-layout">
      <section className="resource-main">
        <ListToolbar
          value={search.q}
          onChange={(q) => { setCatalogPage(1); setSearch({ q, page: 1 }); }}
          onCreate={() => setSearch({ action: "new", id: undefined })}
          createLabel="Novo template"
          activeFilterCount={search.nr ? 1 : 0}
        >
          <Field label="NR"><Select aria-label="Filtrar por NR" value={search.nr ?? ""}
            onChange={(event) => { setCatalogPage(1); setSearch({ nr: event.target.value || undefined, page: 1 }); }}>
            <option value="">Todas as NR</option>
            {catalogNrs.map((nr) => <option key={nr} value={nr}>{nr}</option>)}
          </Select></Field>
        </ListToolbar>
        <section className="apr-catalog-panel">
          <div className="apr-catalog-heading">
            <div><strong>Catálogo de APR por atividade</strong>
              <p>{importedCount} de {catalog.data?.length ?? 0} modelos disponíveis nesta filial.</p></div>
            {pendingCount > 0 && <Button type="button" variant="secondary"
              disabled={importCatalog.isPending} onClick={() => importCatalog.mutate(undefined)}>
              {importCatalog.isPending ? "Atualizando…" : `Importar / atualizar ${pendingCount} modelos`}</Button>}
          </div>
          <div className="apr-catalog-list">
            {visibleCatalog.map((item) => <div className="apr-catalog-item" key={item.code}>
              <div><strong>{item.name}</strong><small>{item.nr} · {item.questionCount} perguntas · {item.upToDate ? "Na filial" : item.imported ? "Atualização disponível" : "Pendente"}</small></div>
              <div className="apr-catalog-actions">
                <Button type="button" variant="ghost" size="icon" aria-label={`Ver detalhes de ${item.name}`}
                  title="Ver detalhes" onClick={() => setPreviewCode(item.code)}><Eye size={18} aria-hidden="true" /></Button>
                {!item.upToDate && <Button type="button" variant="ghost" size="sm" disabled={importCatalog.isPending}
                  onClick={() => importCatalog.mutate(item.code)}>{item.imported ? "Atualizar" : "Importar"}</Button>}
              </div>
            </div>)}
            {!visibleCatalog.length && <p>Nenhuma atividade encontrada. Ajuste a busca ou a NR.</p>}
          </div>
          {catalogPageCount > 1 && <div className="apr-catalog-pages">
            <Button type="button" variant="ghost" size="sm" disabled={catalogPage <= 1}
              onClick={() => setCatalogPage((page) => page - 1)}>Anterior</Button>
            <span>{Math.min(catalogPage, catalogPageCount)} / {catalogPageCount}</span>
            <Button type="button" variant="ghost" size="sm" disabled={catalogPage >= catalogPageCount}
              onClick={() => setCatalogPage((page) => page + 1)}>Próxima</Button>
          </div>}
        </section>
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={["Template", "Versão"]}
            rows={(query.data?.rows ?? []).map((r) => [
              <strong>{r.name}</strong>,
              `v${r.versionNo}`,
            ])}
            empty="Nenhum template encontrado. Ajuste a busca ou a NR."
            keyOf={(i) => query.data!.rows[i]!.id}
            renderActions={(i) => (
              <Button
                variant="ghost" size="sm"
                type="button"
                onClick={() =>
                  setSearch({ id: query.data!.rows[i]!.id, action: undefined })
                }
              >
                Nova versão
              </Button>
            )}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
      </section>
      {previewCode && <FormModal
        title={previewItem?.name ?? preview.data?.name ?? "Detalhes do template"}
        description={`${previewItem?.nr ?? preview.data?.nr ?? "APR"} · Versão do catálogo ${previewItem?.versionNo ?? preview.data?.versionNo ?? "—"} · ${previewItem?.questionCount ?? preview.data?.questions.length ?? "—"} perguntas de segurança`}
        className="form-modal--apr-catalog"
        closeLabel="Fechar detalhes do template"
        onClose={() => setPreviewCode(null)}
      >
        {preview.isPending && <p role="status">Carregando detalhes do template…</p>}
        {preview.isError && <div className="apr-catalog-preview-error" role="alert">
          <p>Não foi possível carregar os detalhes deste template.</p>
          <Button type="button" variant="secondary" size="sm" onClick={() => { void preview.refetch(); }}>Tentar novamente</Button>
        </div>}
        {preview.data && <div className="apr-catalog-preview">
          {preview.data.instructions && <section><h3>Instruções</h3><p>{preview.data.instructions}</p></section>}
          <section><h3>Riscos identificados</h3><p>{preview.data.riskSummary || "Não informado."}</p></section>
          <section><h3>Medidas de controle</h3><p>{preview.data.controlSummary || "Não informado."}</p></section>
          <section><h3>Perguntas de segurança</h3>
            <ol className="apr-catalog-preview-questions">
              {preview.data.questions.map((question, index) => <li key={question.code}>
                <span className="apr-catalog-preview-number">{index + 1}</span>
                <div><p>{question.text}</p><small>{question.required ? "Obrigatória" : "Opcional"} · {question.allowNa ? "Permite N/A" : "Sem N/A"}</small></div>
              </li>)}
            </ol>
          </section>
        </div>}
      </FormModal>}
      {(search.action === "new" || selected) && (
        <FormModal
          title={selected ? "Publicar nova versão" : "Novo template"}
          description="Versões publicadas preservam a definição usada em cada APR."
          onClose={() => setSearch({ action: undefined, id: undefined })}
        >
          <form
            className="form-stack"
            onSubmit={form.handleSubmit((v) => save.mutate(v))}
          >
            <Field label="Nome">
              <Input {...form.register("name", { required: true })} />
            </Field>
            <Field label="NR de referência"><Select {...form.register("nr")}>
              <option value="">Sem NR específica</option>
              {Array.from({ length: 38 }, (_, index) => `NR-${String(index + 1).padStart(2, "0")}`)
                .map((nr) => <option key={nr} value={nr}>{nr}</option>)}
            </Select></Field>
            <Field label="Atividade"><Select {...form.register("activityId")}>
              <option value="">Selecione uma atividade</option>
              {activities.data?.rows.map((activity) => <option key={activity.id} value={activity.id}>{activity.name}</option>)}
            </Select></Field>
            <Field label="Instruções">
              <Textarea rows={6} {...form.register("instructions")} />
            </Field>
            <Field label="Riscos identificados no modelo"><Textarea rows={3} {...form.register("riskSummary")} /></Field>
            <Field label="Medidas de controle do modelo"><Textarea rows={3} {...form.register("controlSummary")} /></Field>
            <strong>Perguntas de segurança</strong>
            {questions.fields.map((field, index) => <section className="form-stack" key={field.id}>
              <div className="form-row"><strong>Pergunta {index + 1}</strong><Button type="button" variant="ghost" size="sm"
                onClick={() => questions.remove(index)}>Remover</Button></div>
              <Field label="O que verificar"><Textarea {...form.register(`questions.${index}.text`, { required: true })} /></Field>
              <CheckboxField label="Resposta obrigatória"><Checkbox {...form.register(`questions.${index}.required`)} /></CheckboxField>
              <CheckboxField label="Permitir N/A"><Checkbox {...form.register(`questions.${index}.allowNa`)} /></CheckboxField>
            </section>)}
            <Button type="button" variant="secondary" onClick={() => questions.append({
              text: "", required: true, allowNa: true })}>Adicionar pergunta</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Publicando…" : "Publicar template"}
            </Button>
          </form>
        </FormModal>
      )}
    </div>
  );
}
