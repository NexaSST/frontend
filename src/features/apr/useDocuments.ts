import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { useAllRows, usePagedRows } from "../shared.js";
import { root } from "./api.js";
import { riskDefault } from "./schemas.js";
import type { Props, AprRow, AprDetail, AprRevision, Template, Person, AprFormValues } from "./types.js";

const emptyValues = (): AprFormValues => ({ referenceCode: "", title: "", templateVersionId: "", activityId: "",
  sector: "", location: "", executionOn: "", analystPersonId: "", teamText: "", answers: [],
  risks: [{ ...riskDefault, controls: [{ description: "" }] }], participantIds: [] });

export function useDocuments({ scope, search, setSearch, permissions }: Omit<Props, "tab" | "area">) {
  const qc = useQueryClient();
  const [templateNr, setTemplateNr] = useState("");
  const [step, setStep] = useState(1);
  const draftRef = useRef<AprDetail | null>(null);
  const endpoint = `${root(scope)}/aprs`;
  const query = usePagedRows<AprRow>("aprs", endpoint, search);
  const selected = query.data?.rows.find((r) => r.id === search.id);
  const detail = useQuery({
    queryKey: ["apr-detail", endpoint, search.id],
    queryFn: () => apiJson<AprDetail>(`${endpoint}/${search.id}`),
    enabled: Boolean(search.id),
  });
  const templates = useAllRows<Template>(
    "apr-template-options",
    `${root(scope)}/apr-templates`,
  );
  const templateNrs = [...new Set((templates.data?.rows ?? []).map((item) => item.nr).filter((nr): nr is string => Boolean(nr)))].sort();
  const people = useAllRows<Person>(
    "apr-people-options",
    `${root(scope)}/apr-people-options`,
  );
  const form = useForm<AprFormValues>({ defaultValues: emptyValues() });
  const selectedTemplateVersionId = form.watch("templateVersionId") as string;
  const answers = form.watch("answers") as Array<{ code: string; answer: string; observation: string }>;
  const templateOptions = (templates.data?.rows ?? []).filter((item) =>
    item.versionId === selectedTemplateVersionId || !templateNr || item.nr === templateNr);
  const selectTemplate = async (versionId: string) => {
    const option = templates.data?.rows.find((item) => item.versionId === versionId);
    if (!option) return;
    try {
      const model = await apiJson<Template>(`${root(scope)}/apr-templates/${option.id}`);
      if (form.getValues("templateVersionId") !== versionId) return;
      form.setValue("title", model.name);
      form.setValue("activityId", model.activityId ?? "");
      if (model.definition?.riskSummary || model.definition?.controlSummary) form.setValue("risks", [{
        ...riskDefault, taskStep: model.name, hazard: model.definition.riskSummary ?? "",
        controls: [{ description: model.definition.controlSummary ?? "" }],
      }]);
      form.setValue("answers", model.definition?.questions?.map((question) => ({
        code: question.code, answer: "", observation: "",
      })) ?? []);
    } catch {
      sileo.error({ title: "Não foi possível carregar o template" });
    }
  };
  const templateOption = templates.data?.rows.find((item) => item.versionId === selectedTemplateVersionId);
  const templateDetail = useQuery({
    queryKey: ["apr-template-document", scope.companyId, scope.branchId, templateOption?.id],
    queryFn: () => apiJson<Template>(`${root(scope)}/apr-templates/${templateOption!.id}`),
    enabled: Boolean(templateOption),
  });
  const risks = useFieldArray({ control: form.control, name: "risks" });
  useEffect(() => {
    const definition = templateDetail.data?.definition;
    if (!definition?.questions || templateDetail.data?.versionId !== selectedTemplateVersionId) return;
    const previous = new Map((form.getValues("answers") as Array<{ code: string; answer: string; observation: string }> | undefined)
      ?.map((answer) => [answer.code, answer]) ?? []);
    form.setValue("answers", definition.questions.map((question) => previous.get(question.code) ??
      { code: question.code, answer: "", observation: "" }));
  }, [templateDetail.data, selectedTemplateVersionId, form]);
  useEffect(() => {
    if (detail.data?.status === "draft") {
      if (draftRef.current?.id === detail.data.id && draftRef.current.draft.version > detail.data.draft.version) return;
      draftRef.current = detail.data;
      setStep(detail.data.draft.wizardStep ?? 1);
      form.reset({
        referenceCode: detail.data.referenceCode,
        title: detail.data.title,
        templateVersionId: detail.data.draft.templateVersionId,
        activityId: detail.data.activityId ?? "",
        sector: detail.data.sector ?? "",
        location: detail.data.location ?? "",
        executionOn: detail.data.executionOn?.slice(0, 10) ?? "",
        analystPersonId: detail.data.analystPersonId ?? "",
        teamText: detail.data.draft.teamText ?? detail.data.teamText ?? "",
        answers: detail.data.draft.answers ?? [],
        risks: detail.data.draft.risks.length
          ? detail.data.draft.risks
          : [riskDefault],
        participantIds: detail.data.draft.participants.map((participant) => participant.personId),
      });
    } else if (search.action === "new" && !search.id) {
      draftRef.current = null;
      setStep(1);
      form.reset(emptyValues());
    }
  }, [detail.data, search.action, form]);
  const save = useMutation({
    mutationFn: ({ values: v, nextStep }: { values: AprFormValues; nextStep: number }) => {
      const current = draftRef.current;
      const payload = {
        referenceCode: v.referenceCode,
        title: v.title,
        templateVersionId: v.templateVersionId,
        ...((templateOption?.activityId ?? templateDetail.data?.activityId ?? v.activityId)
          ? { activityId: templateOption?.activityId ?? templateDetail.data?.activityId ?? v.activityId } : {}),
        sector: v.sector ?? "",
        location: v.location ?? "",
        ...(v.executionOn ? { executionOn: v.executionOn } : {}),
        ...(v.analystPersonId ? { analystPersonId: v.analystPersonId } : {}),
        teamText: v.teamText ?? "",
        wizardStep: nextStep,
        answers: (v.answers ?? []).filter((answer: { answer: string }) => Boolean(answer.answer)),
        risks: v.risks,
        participants: (v.participantIds ?? []).map((personId: string) => ({ personId,
          roleLabel: current?.draft.participants.find((person) => person.personId === personId)?.roleLabel ?? "" })),
        ...(current ? { expectedVersion: current.draft.version } : {}),
      };
      return apiJson<AprDetail>(
        current ? `${endpoint}/${current.id}/draft` : endpoint,
        { method: current ? "put" : "post", json: payload },
      );
    },
    onSuccess: (saved) => {
      draftRef.current = saved;
      qc.setQueryData(["apr-detail", endpoint, saved.id], { ...saved, revisions: detail.data?.revisions ?? [] });
      void qc.invalidateQueries({ queryKey: ["aprs"] });
      setSearch({ action: undefined, id: saved.id });
      form.reset(form.getValues());
    },
    onError: () => sileo.error({ title: "Não foi possível salvar a APR" }),
  });
  const finalize = useMutation({
    mutationFn: () =>
      apiJson(`${endpoint}/${draftRef.current!.id}/finalize`, {
        method: "post",
        json: { expectedVersion: draftRef.current!.draft.version },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["aprs"] });
      await qc.invalidateQueries({ queryKey: ["apr-detail"] });
      setSearch({ id: undefined });
      sileo.success({ title: "APR finalizada" });
    },
    onError: () =>
      sileo.error({
        title: "Revise riscos, controles e participante antes de finalizar",
      }),
  });
  const latestRevisionId = detail.data?.revisions.at(-1)?.id;
  const revision = useQuery({
    queryKey: ["apr-revision", endpoint, latestRevisionId],
    queryFn: () => apiJson<AprRevision>(`${root(scope)}/apr-revisions/${latestRevisionId}`),
    enabled: Boolean(selected && detail.data?.status !== "draft" && latestRevisionId),
  });
  const downloadPdf = useMutation({
    mutationFn: async () => {
      const pdfEndpoint = `${root(scope)}/apr-revisions/${latestRevisionId}/pdf`;
      if (permissions.includes("apr.finalize")) await apiJson(pdfEndpoint, { method: "post" });
      const file = await apiJson<{ download: { url: string } }>(pdfEndpoint);
      window.location.assign(file.download.url);
    },
    onError: () => sileo.error({ title: "PDF indisponível. Verifique o armazenamento de arquivos." }),
  });
  const editing =
    search.action === "new" || (Boolean(search.id) && detail.data?.status === "draft");
  return { templateNr, setTemplateNr, selectTemplate, query, selected, detail, templates, templateNrs, people, form, answers, templateOptions, templateOption, templateDetail, risks, save, finalize, latestRevisionId, revision, downloadPdf, editing, step, setStep };
}
