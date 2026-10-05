import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MapPin, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { Pagination } from "../components/Pagination.js";
import { Badge, Button, FormField, Input, PageTitle, SectionTitle } from "../components/ui/index.js";
import {
  AccessManager,
  ContractsManager,
} from "../features/platform/CompanyAdministration.js";
import { CompanySso } from "../features/platform/CompanySso.js";
import { apiAllRows, apiJson, apiPage } from "../lib/api.js";

interface Company {
  id: string;
  name: string;
  legalName: string | null;
  taxIdentifier: string | null;
  timezone: string;
}
interface Branch {
  id: string;
  name: string;
  code: string;
  timezone: string | null;
}
const branchSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da filial."),
  code: z
    .string()
    .trim()
    .min(1, "Informe o código.")
    .max(32)
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
      "Use apenas letras, números, hífen e sublinhado.",
    ),
  timezone: z.string().trim().optional(),
});
const companySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da empresa."),
  legalName: z.string().trim().optional(),
  taxIdentifier: z.string().trim().optional(),
  timezone: z.string().trim().min(1, "Informe o fuso horário."),
});
type BranchInput = z.infer<typeof branchSchema>;
type CompanyInput = z.infer<typeof companySchema>;

function BranchRow({
  branch,
  companyId,
}: {
  branch: Branch;
  companyId: string;
}) {
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();
  const form = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: branch.name,
      code: branch.code,
      timezone: branch.timezone ?? "",
    },
  });
  const update = useMutation({
    mutationFn: (input: BranchInput) =>
      apiJson<Branch>(`v1/companies/${companyId}/branches/${branch.id}`, {
        method: "patch",
        json: input,
      }),
    onSuccess: async () => {
      setEditing(false);
      await qc.invalidateQueries({ queryKey: ["branches", companyId] });
      sileo.success({ title: "Filial atualizada" });
    },
    onError: () =>
      sileo.error({ title: "Não foi possível atualizar a filial" }),
  });
  if (!editing)
    return (
      <div className={"record-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[0.8rem] p-[1rem_0.25rem] border-t border-solid border-t-line text-ink no-underline first:border-t-0 [&:not(.static):hover_strong]:text-accent [&_>_span:last-child]:text-muted [&_>_span:last-child]:text-[0.78rem] [&_strong]:block [&_small]:block [&_small]:mt-[0.2rem] [&_small]:text-muted static"}>
        <span className={"record-icon inline-grid place-items-center w-9 h-9 rounded-[0.65rem] text-accent-strong bg-[#e5eee9]"}>
          <MapPin size={18} />
        </span>
        <span>
          <strong>{branch.name}</strong>
          <small>
            {branch.code} · {branch.timezone || "Fuso da empresa"}
          </small>
        </span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil size={15} /> Editar
        </Button>
        <Link className={"inline-flex items-center justify-center gap-[0.4rem] min-h-10 p-[0.55rem_0.75rem] border border-solid border-line rounded-control text-accent-strong bg-white text-[0.76rem] font-extrabold no-underline whitespace-nowrap [&:hover]:border-[#93aa9f] [&:hover]:bg-[#f2f7f4] max-[800px]:col-2 max-[800px]:row-1 max-[520px]:col-1 max-[520px]:row-auto max-[520px]:w-full"} to="/workspace/$companyId/$branchId" params={{ companyId, branchId: branch.id }} search={{
          periodDays: 30, categoryId: undefined, activityDomain: undefined, trainingPage: 1, inspectionsPage: 1, aprPage: 1,
        }}>Abrir dashboard <ArrowRight size={15} /></Link>
      </div>
    );
  return (
    <form
      className={"inline-edit grid gap-[0.8rem] p-[1rem_0] border-t border-solid border-t-line"}
      onSubmit={form.handleSubmit((v) => update.mutate(v))}
    >
      <div className={"inline-fields grid grid-cols-[minmax(0,1fr)_minmax(6rem,0.45fr)_minmax(9rem,0.7fr)] gap-[0.6rem] [&_label]:grid [&_label]:gap-[0.35rem] [&_label]:text-muted [&_label]:text-[0.75rem] [&_label]:font-[750] [&_input]:w-full [&_input]:min-h-[2.4rem] [&_input]:p-[0.5rem_0.6rem] [&_input]:border [&_input]:border-solid [&_input]:border-control-border [&_input]:rounded-[0.6rem] max-[800px]:grid-cols-[1fr]"}>
        <FormField label="Nome" error={form.formState.errors.name?.message}><Input {...form.register("name")} invalid={Boolean(form.formState.errors.name)} /></FormField>
        <FormField label="Código" error={form.formState.errors.code?.message}><Input {...form.register("code")} invalid={Boolean(form.formState.errors.code)} /></FormField>
        <FormField label="Fuso"><Input {...form.register("timezone")} /></FormField>
      </div>
      {(form.formState.errors.name || form.formState.errors.code) && (
        <span className={"field-error text-danger text-[0.8rem]"}>Revise os campos obrigatórios.</span>
      )}
      <div className={"form-actions flex justify-end gap-2"}>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={update.isPending}>Salvar filial</Button>
      </div>
    </form>
  );
}

export function PlatformCompanyPage() {
  const { companyId } = useParams({
    from: "/_authenticated/platform/companies/$companyId",
  });
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const company = useQuery({
    queryKey: ["platform-company", companyId],
    queryFn: () => apiJson<Company>(`v1/platform/companies/${companyId}`),
  });
  const branches = useQuery({
    queryKey: ["branches", companyId, page],
    queryFn: () =>
      apiPage<Branch>(`v1/companies/${companyId}/branches`, {
        searchParams: { page, pageSize: 25 },
      }),
  });
  const branchOptions = useQuery({
    queryKey: ["branches", companyId, "options"],
    queryFn: () => apiAllRows<Branch>(`v1/companies/${companyId}/branches`),
  });
  const createForm = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: { timezone: "America/Sao_Paulo" },
  });
  const companyForm = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
  });
  useEffect(() => {
    if (company.data)
      companyForm.reset({
        name: company.data.name,
        legalName: company.data.legalName ?? "",
        taxIdentifier: company.data.taxIdentifier ?? "",
        timezone: company.data.timezone,
      });
  }, [company.data, companyForm]);
  const createBranch = useMutation({
    mutationFn: (input: BranchInput) =>
      apiJson<Branch>(`v1/companies/${companyId}/branches`, {
        method: "post",
        json: input,
      }),
    onSuccess: async () => {
      createForm.reset({ timezone: "America/Sao_Paulo" });
      await qc.invalidateQueries({ queryKey: ["branches", companyId] });
      sileo.success({ title: "Filial criada" });
    },
    onError: () => sileo.error({ title: "Não foi possível criar a filial" }),
  });
  const updateCompany = useMutation({
    mutationFn: (input: CompanyInput) =>
      apiJson<Company>(`v1/platform/companies/${companyId}`, {
        method: "patch",
        json: {
          ...input,
          legalName: input.legalName || null,
          taxIdentifier: input.taxIdentifier || null,
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["platform-company", companyId] }),
        qc.invalidateQueries({ queryKey: ["platform-companies"] }),
      ]);
      sileo.success({ title: "Empresa atualizada" });
    },
    onError: () =>
      sileo.error({ title: "Não foi possível atualizar a empresa" }),
  });
  const branchRows = branches.data?.rows ?? [];
  return (
    <div className={"workspace w-[min(92vw,82rem)] m-[0_auto] p-[3.5rem_0_5rem] max-[520px]:w-[min(92vw,82rem)] max-[520px]:pt-8"}>
      <Link className={"back-link inline-flex items-center gap-[0.4rem] mb-8 text-accent-strong font-[720] underline-offset-[0.22em]"} to="/platform">
        <ArrowLeft size={17} /> Voltar ao dashboard Master
      </Link>
      <PageTitle title={company.data?.name ?? `Empresa ${companyId}`} description="Empresas, filiais, contratos e acessos em um único contexto administrativo." meta={<Badge tone="info">Contexto administrativo</Badge>} />
      <div className={"grid gap-5"}>
        <section className={"border border-solid border-line rounded-panel bg-surface shadow-panel min-w-0 p-6 max-[520px]:p-[1.1rem]"}>
          <SectionTitle title="Filiais" description="Listagem paginada; cada unidade pode ser atualizada no próprio contexto." />
          {branches.isLoading && (
            <p className={"empty-state p-[1.5rem_0] text-muted"}>Carregando filiais…</p>
          )}
          {branches.isError && (
            <p className={"error-state text-danger text-[0.8rem]"}>Não foi possível carregar as filiais.</p>
          )}
          <div className={"record-list grid"}>
            {branchRows.map((branch) => (
              <BranchRow
                branch={branch}
                companyId={companyId}
                key={branch.id}
              />
            ))}
          </div>
          {branches.data && (
            <Pagination
              page={branches.data.page}
              totalPages={branches.data.totalPages}
              total={branches.data.total}
              onPageChange={setPage}
            />
          )}
        </section>
        <aside className={"side-section [&_p]:max-w-[68ch] [&_p]:mb-0 [&_p]:text-muted [&_p]:leading-[1.6] border border-solid border-line rounded-panel bg-surface shadow-panel grid gap-6 p-6 [&_svg]:text-accent max-[520px]:p-[1.1rem] grid-cols-2 [&_.side-block]:p-0 [&_.side-block]:border-0 [&_.side-block+.side-block]:ps-6 [&_.side-block+.side-block]:border-s [&_.side-block+.side-block]:border-solid [&_.side-block+.side-block]:border-s-line max-[800px]:grid-cols-[1fr] max-[800px]:[&_.side-block+.side-block]:pbs-6 max-[800px]:[&_.side-block+.side-block]:ps-0 max-[800px]:[&_.side-block+.side-block]:[border-block-start:1px_solid_var(--color-line)] max-[800px]:[&_.side-block+.side-block]:border-s-0"}>
          <section className={"side-block grid gap-[1.2rem] pb-6 border-b border-solid border-b-line last:pb-0 last:border-b-0 [&_>_div_>_svg]:mb-[0.8rem]"}>
            <div>
              <Pencil size={20} />
              <h2>Dados da empresa</h2>
              <p>Alterações administrativas ficam registradas na auditoria.</p>
            </div>
            <form
              className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"}
              onSubmit={companyForm.handleSubmit((v) =>
                updateCompany.mutate(v),
              )}
            >
              <FormField label="Nome"><Input {...companyForm.register("name")} /></FormField>
              <FormField label="Razão social"><Input {...companyForm.register("legalName")} /></FormField>
              <FormField label="Documento"><Input {...companyForm.register("taxIdentifier")} /></FormField>
              <FormField label="Fuso horário"><Input {...companyForm.register("timezone")} /></FormField>
              <Button type="submit" loading={updateCompany.isPending}>Salvar empresa</Button>
            </form>
          </section>
          <section className={"side-block grid gap-[1.2rem] pb-6 border-b border-solid border-b-line last:pb-0 last:border-b-0 [&_>_div_>_svg]:mb-[0.8rem]"}>
            <div>
              <Plus size={20} />
              <h2>Nova filial</h2>
              <p>Cadastre a unidade antes de liberar módulos e usuários.</p>
            </div>
            <form
              className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"}
              onSubmit={createForm.handleSubmit((v) => createBranch.mutate(v))}
            >
              <FormField label="Nome" error={createForm.formState.errors.name?.message}><Input {...createForm.register("name")} invalid={Boolean(createForm.formState.errors.name)} /></FormField>
              <FormField label="Código" error={createForm.formState.errors.code?.message}><Input {...createForm.register("code")} invalid={Boolean(createForm.formState.errors.code)} /></FormField>
              <FormField label="Fuso horário"><Input {...createForm.register("timezone")} /></FormField>
              <Button type="submit" loading={createBranch.isPending}>Criar filial</Button>
            </form>
          </section>
        </aside>
      </div>
      {branches.data && (
        <>
          <CompanySso companyId={companyId} />
          <ContractsManager companyId={companyId} branches={branchOptions.data ?? branchRows} />
          <AccessManager companyId={companyId} branches={branchOptions.data ?? branchRows} />
        </>
      )}
    </div>
  );
}
