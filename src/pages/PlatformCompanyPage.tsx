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
      <div className="record-row static">
        <span className="record-icon">
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
        <Link className="branch-enter-link" to="/workspace/$companyId/$branchId" params={{ companyId, branchId: branch.id }} search={{
          periodDays: 30, categoryId: undefined, activityDomain: undefined, trainingPage: 1, inspectionsPage: 1, aprPage: 1,
        }}>Abrir dashboard <ArrowRight size={15} /></Link>
      </div>
    );
  return (
    <form
      className="inline-edit"
      onSubmit={form.handleSubmit((v) => update.mutate(v))}
    >
      <div className="inline-fields">
        <FormField label="Nome" error={form.formState.errors.name?.message}><Input {...form.register("name")} invalid={Boolean(form.formState.errors.name)} /></FormField>
        <FormField label="Código" error={form.formState.errors.code?.message}><Input {...form.register("code")} invalid={Boolean(form.formState.errors.code)} /></FormField>
        <FormField label="Fuso"><Input {...form.register("timezone")} /></FormField>
      </div>
      {(form.formState.errors.name || form.formState.errors.code) && (
        <span className="field-error">Revise os campos obrigatórios.</span>
      )}
      <div className="form-actions">
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
    <div className="workspace">
      <Link className="back-link" to="/platform">
        <ArrowLeft size={17} /> Voltar ao dashboard Master
      </Link>
      <PageTitle title={company.data?.name ?? `Empresa ${companyId}`} description="Empresas, filiais, contratos e acessos em um único contexto administrativo." meta={<Badge tone="info">Contexto administrativo</Badge>} />
      <div className="company-management-flow">
        <section className="content-section">
          <SectionTitle title="Filiais" description="Listagem paginada; cada unidade pode ser atualizada no próprio contexto." />
          {branches.isLoading && (
            <p className="empty-state">Carregando filiais…</p>
          )}
          {branches.isError && (
            <p className="error-state">Não foi possível carregar as filiais.</p>
          )}
          <div className="record-list">
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
        <aside className="side-section company-detail-panel">
          <section className="side-block">
            <div>
              <Pencil size={20} />
              <h2>Dados da empresa</h2>
              <p>Alterações administrativas ficam registradas na auditoria.</p>
            </div>
            <form
              className="form-stack"
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
          <section className="side-block">
            <div>
              <Plus size={20} />
              <h2>Nova filial</h2>
              <p>Cadastre a unidade antes de liberar módulos e usuários.</p>
            </div>
            <form
              className="form-stack"
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
