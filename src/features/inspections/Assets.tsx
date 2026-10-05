import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, Input, Select } from "../../components/ui/index.js";
import { ArchiveButton, DataTable, FormModal, Field, ListToolbar, PagedFooter, QueryState, useAllRows, usePagedRows } from "../shared.js";
import type { Props, Asset, AssetType } from "./types.js";
import { base } from "./api.js";
export function Assets({ scope, search, setSearch }: Omit<Props, "tab">) {
  const queryClient = useQueryClient();
  const endpoint = `${base(scope)}/assets`;
  const query = usePagedRows<Asset>("assets", endpoint, search);
  const types = useAllRows<AssetType>(
    "asset-type-options",
    `${base(scope)}/asset-types`,
  );
  const selected = query.data?.rows.find((r) => r.id === search.id);
  const schema = z.object({
    assetTypeId: z.string().min(1, "Selecione o tipo."),
    code: z.string().trim().min(1),
    sector: z.string().optional(),
    location: z.string().optional(),
    expiresOn: z.string().optional(),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      assetTypeId: "",
      code: "",
      sector: "",
      location: "",
      expiresOn: "",
    },
  });
  const chosenType = types.data?.rows.find((type) => type.id === form.watch("assetTypeId"));
  useEffect(
    () =>
      form.reset({
        assetTypeId: selected?.assetTypeId ?? "",
        code: selected?.code ?? "",
        sector: selected?.sector ?? "",
        location: selected?.location ?? "",
        expiresOn: selected?.expiresOn ?? "",
      }),
    [selected, form],
  );
  const save = useMutation({
    mutationFn: (input: z.infer<typeof schema>) =>
      apiJson(selected ? `${endpoint}/${selected.id}` : endpoint, {
        method: selected ? "patch" : "post",
        json: {
          assetTypeId: input.assetTypeId,
          code: input.code,
          ...(selected || input.sector ? { sector: input.sector || null } : {}),
          ...(selected || input.location
            ? { location: input.location || null }
            : {}),
          ...(selected || input.expiresOn
            ? { expiresOn: input.expiresOn || null }
            : {}),
          ...(selected ? { expectedRowVersion: selected.rowVersion } : {}),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assets"] });
      setSearch({ id: undefined, action: undefined });
      sileo.success({ title: selected ? "Ativo atualizado" : "Ativo criado" });
    },
    onError: () => sileo.error({ title: "Não foi possível salvar o ativo" }),
  });
  const archive = useMutation({
    mutationFn: (row: Asset) =>
      apiJson(`${endpoint}/${row.id}/archive`, {
        method: "post",
        json: { expectedRowVersion: row.rowVersion },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });
  return (
    <div className={"resource-layout grid grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr]"}>
      <section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
        <ListToolbar
          value={search.q}
          onChange={(q) => setSearch({ q, page: 1 })}
          onCreate={() => setSearch({ action: "new", id: undefined })}
          createLabel="Novo ativo"
        />
        <QueryState loading={query.isLoading} error={query.isError}>
          <DataTable
            columns={[
              "Identificação",
              "Equipamento",
              "Local",
              "Próxima inspeção",
              "Validade",
            ]}
            rows={(query.data?.rows ?? []).map((r) => [
              <strong>{r.code}</strong>,
              types.data?.rows.find((t) => t.id === r.assetTypeId)?.name ??
                r.assetTypeId,
              [r.sector, r.location].filter(Boolean).join(" · ") || "—",
              r.nextInspectionDueOn ?? "—",
              r.expiresOn ?? "—",
            ])}
            keyOf={(i) => query.data!.rows[i]!.id}
            renderActions={(i) => {
              const row = query.data!.rows[i]!;
              return (
                <>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setSearch({ id: row.id, action: undefined })}
                  >
                    Editar
                  </Button>
                  <ArchiveButton
                    onConfirm={() => archive.mutate(row)}
                    busy={archive.isPending}
                  />
                </>
              );
            }}
          />
          <PagedFooter
            data={query.data}
            onPage={(page) => setSearch({ page })}
          />
        </QueryState>
      </section>
      {(search.action === "new" || selected) && (
        <FormModal
          title={selected ? "Editar ativo" : "Novo ativo"}
          description="Cadastre identificação e localização operacional."
          onClose={() => setSearch({ id: undefined, action: undefined })}
        >
          <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={form.handleSubmit((v) => {
            if (chosenType?.hasExpirationDate && !v.expiresOn) {
              form.setError("expiresOn", { message: "Informe a validade deste ativo." });
              return;
            }
            save.mutate({ ...v, expiresOn: chosenType?.hasExpirationDate ? v.expiresOn : "" });
          })}>
            <Field
              label="Equipamento"
              error={form.formState.errors.assetTypeId?.message}
            >
              <Select {...form.register("assetTypeId")}>
                <option value="">Selecione</option>
                {types.data?.rows.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Identificação">
              <Input {...form.register("code")} />
            </Field>
            <Field label="Setor">
              <Input {...form.register("sector")} />
            </Field>
            <Field label="Localização">
              <Input {...form.register("location")} />
            </Field>
            {chosenType?.hasExpirationDate && <Field label="Validade" error={form.formState.errors.expiresOn?.message}>
              <Input type="date" required {...form.register("expiresOn")} />
            </Field>}
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar ativo"}
            </Button>
          </form>
        </FormModal>
      )}
    </div>
  );
}
