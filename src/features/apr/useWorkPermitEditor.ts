import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { useAllRows, usePagedRows } from "../shared.js";
import { root } from "./api.js";
import type { AprDetail, AprRow, Named, Person, Props, WorkPermitDetail, WorkPermitRow } from "./types.js";
import type { WorkPermitForm } from "./workPermitSchema.js";

const blank = (): WorkPermitForm => ({ referenceCode: "", title: "", workDescription: "", activityId: "",
  startsAt: "", endsAt: "", participantIds: [], aprDocumentIds: [] });

export function useWorkPermitEditor({ scope, search, setSearch, statusFilter }: Omit<Props, "tab" | "area" | "permissions"> & { statusFilter: string }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const draftRef = useRef<WorkPermitDetail | null>(null);
  const aprSelectionRef = useRef(0);
  const endpoint = `${root(scope)}/work-permits`;
  const query = usePagedRows<WorkPermitRow>("work-permits", endpoint, search, statusFilter === "all" ? undefined : { status: statusFilter });
  const detail = useQuery({ queryKey: ["work-permit-detail", endpoint, search.id],
    queryFn: () => apiJson<WorkPermitDetail>(`${endpoint}/${search.id}`), enabled: Boolean(search.id) });
  const people = useAllRows<Person>("work-permit-people", `${root(scope)}/apr-people-options`);
  const activities = useAllRows<Named>("work-permit-activities", `${root(scope)}/apr-activities`);
  const aprs = useAllRows<AprRow>("work-permit-aprs", `${root(scope)}/aprs`);
  const form = useForm<WorkPermitForm>({ defaultValues: blank() });

  useEffect(() => {
    if (detail.data?.status === "draft") {
      if (draftRef.current?.id === detail.data.id && draftRef.current.version > detail.data.version) return;
      draftRef.current = detail.data;
      setStep(detail.data.wizardStep || 1);
      form.reset({ referenceCode: detail.data.referenceCode, title: detail.data.title,
        workDescription: detail.data.workDescription, activityId: detail.data.activityId ?? "",
        startsAt: detail.data.startsAt?.slice(0, 16) ?? "", endsAt: detail.data.endsAt?.slice(0, 16) ?? "",
        participantIds: detail.data.participants.map((person) => person.personId),
        aprDocumentIds: detail.data.aprs.map((apr) => apr.documentId) });
    } else if (search.action === "new" && !search.id) {
      draftRef.current = null;
      setStep(1);
      form.reset(blank());
    }
  }, [detail.data, form, search.action, search.id]);

  const save = useMutation({
    mutationFn: ({ values, nextStep }: { values: WorkPermitForm; nextStep: number }) => {
      const current = draftRef.current;
      const payload = { referenceCode: values.referenceCode.trim(), title: values.title.trim(),
        workDescription: values.workDescription.trim(),
        ...(values.activityId ? { activityId: values.activityId } : {}),
        ...(values.startsAt ? { startsAt: new Date(values.startsAt).toISOString() } : {}),
        ...(values.endsAt ? { endsAt: new Date(values.endsAt).toISOString() } : {}),
        participants: values.participantIds.map((personId) => ({ personId,
          roleLabel: current?.participants.find((person) => person.personId === personId)?.roleLabel ?? "" })),
        aprDocumentIds: values.aprDocumentIds, wizardStep: nextStep,
        ...(current ? { expectedVersion: current.version } : {}) };
      return apiJson<WorkPermitDetail>(current ? `${endpoint}/${current.id}/draft` : endpoint,
        { method: current ? "put" : "post", json: payload });
    },
    onSuccess: (saved) => {
      draftRef.current = saved;
      qc.setQueryData(["work-permit-detail", endpoint, saved.id], saved);
      void qc.invalidateQueries({ queryKey: ["work-permits"] });
      setSearch({ id: saved.id, action: undefined });
      form.reset(form.getValues());
    },
    onError: () => sileo.error({ title: "Não foi possível salvar a PT" }),
  });
  const authorize = useMutation({
    mutationFn: () => apiJson(`${endpoint}/${draftRef.current!.id}/authorize`, { method: "post",
      json: { expectedVersion: draftRef.current!.version } }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["work-permits"] });
      void qc.invalidateQueries({ queryKey: ["work-permit-detail"] });
      setSearch({ id: undefined });
      sileo.success({ title: "PT autorizada" }); },
    onError: () => sileo.error({ title: "A PT não pode ser autorizada",
      description: "Revise participantes e treinamentos obrigatórios antes de tentar novamente." }),
  });
  const selectAprs = async (ids: string[]) => {
    const selection = ++aprSelectionRef.current;
    const added = ids.filter((id) => !form.getValues("aprDocumentIds").includes(id));
    form.setValue("aprDocumentIds", ids, { shouldDirty: true });
    if (!added.length) return;
    try {
      const selected = await Promise.all(added.map((id) => apiJson<AprDetail>(`${root(scope)}/aprs/${id}`)));
      if (selection !== aprSelectionRef.current) return;
      const merged = [...new Set([...form.getValues("participantIds"),
        ...selected.filter((apr) => form.getValues("aprDocumentIds").includes(apr.id))
          .flatMap((apr) => apr.draft.participants.map((person) => person.personId))])];
      form.setValue("participantIds", merged, { shouldDirty: true });
    } catch { sileo.error({ title: "APR vinculada, mas não foi possível sugerir seus participantes" }); }
  };
  const editing = search.action === "new" || (Boolean(search.id) && detail.data?.status === "draft");
  return { endpoint, query, detail, people, activities, aprs, form, save, authorize, editing, step, setStep, selectAprs };
}
