import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { sileo } from "sileo";
import { Badge, Button, Checkbox, CheckboxField, FormField, Input, SectionTitle, Select, Textarea, labelForStatus, toneForStatus } from "../../components/ui/index.js";
import { apiJson } from "../../lib/api.js";
import { QueryState } from "../shared.js";
import type { PricingTier, CommercialModule, ComboOffer, CommercialCatalog } from "./commercialTypes.js";
import { brl, priceToCents } from "./commercialFormat.js";

export const commercialCatalogQuery = {
  queryKey: ["commercial-catalog"] as const,
  queryFn: () => apiJson<CommercialCatalog>("v1/platform/commercial-catalog"),
};

function TierEditor({ tier }: { tier: PricingTier }) {
  const qc = useQueryClient();
  const [name, setName] = useState(tier.name);
  const [price, setPrice] = useState(String(tier.monthlyPriceCents / 100));
  const [quotaLimit, setQuotaLimit] = useState(tier.quotaLimit === null ? "" : String(tier.quotaLimit));
  const [description, setDescription] = useState(tier.includedDescription);
  const [status, setStatus] = useState(tier.status);
  const save = useMutation({
    mutationFn: () => apiJson<CommercialCatalog>(`v1/platform/pricing-tiers/${tier.id}`, { method: "patch", json: {
      name, monthlyPriceCents: priceToCents(price), includedDescription: description, status,
      quotaLimit: quotaLimit ? Number(quotaLimit) : null, quotaMetric: quotaLimit ? (tier.quotaMetric ?? "units") : null,
    } }),
    onSuccess: async (data) => { qc.setQueryData(commercialCatalogQuery.queryKey, data); sileo.success({ title: "Faixa de preço atualizada" }); },
    onError: () => sileo.error({ title: "Não foi possível atualizar a faixa" }),
  });
  return <form className="pricing-row" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
    <FormField label="Plano"><Input value={name} onChange={(event) => setName(event.target.value)} required /></FormField>
    <FormField label="Mensalidade (R$)"><Input type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /></FormField>
    <FormField label="Limite"><Input type="number" min="1" value={quotaLimit} onChange={(event) => setQuotaLimit(event.target.value)} placeholder="Sem limite" /></FormField>
    <FormField label="O que inclui"><Input value={description} onChange={(event) => setDescription(event.target.value)} required /></FormField>
    <FormField label="Situação"><Select value={status} onChange={(event) => setStatus(event.target.value as PricingTier["status"])}><option value="active">Ativo</option><option value="inactive">Inativo</option></Select></FormField>
    <Button type="submit" size="sm" loading={save.isPending}>Salvar</Button>
  </form>;
}

function NewTierForm({ moduleCode }: { moduleCode: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quotaMetric, setQuotaMetric] = useState("");
  const [quotaLimit, setQuotaLimit] = useState("");
  const [description, setDescription] = useState("");
  const create = useMutation({
    mutationFn: () => apiJson<CommercialCatalog>(`v1/platform/modules/${moduleCode}/pricing-tiers`, { method: "post", json: {
      code, name, monthlyPriceCents: priceToCents(price), includedDescription: description,
      quotaMetric: quotaLimit ? (quotaMetric || "units") : null, quotaLimit: quotaLimit ? Number(quotaLimit) : null,
    } }),
    onSuccess: (data) => { qc.setQueryData(commercialCatalogQuery.queryKey, data); setOpen(false); setCode(""); setName(""); setPrice(""); setQuotaMetric(""); setQuotaLimit(""); setDescription(""); sileo.success({ title: "Faixa de preço criada" }); },
    onError: () => sileo.error({ title: "Não foi possível criar a faixa" }),
  });
  if (!open) return <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Adicionar faixa</Button>;
  return <form className="new-tier-form" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
    <FormField label="Código"><Input value={code} onChange={(event) => setCode(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="ex.: enterprise" required /></FormField>
    <FormField label="Nome"><Input value={name} onChange={(event) => setName(event.target.value)} required /></FormField>
    <FormField label="Mensalidade (R$)"><Input type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /></FormField>
    <FormField label="Métrica"><Input value={quotaMetric} onChange={(event) => setQuotaMetric(event.target.value)} placeholder="ex.: collaborators" /></FormField>
    <FormField label="Limite"><Input type="number" min="1" value={quotaLimit} onChange={(event) => setQuotaLimit(event.target.value)} /></FormField>
    <FormField label="O que inclui"><Input value={description} onChange={(event) => setDescription(event.target.value)} required /></FormField>
    <div className="form-actions"><Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" size="sm" loading={create.isPending}>Criar faixa</Button></div>
  </form>;
}

function ModuleCatalogCard({ module }: { module: CommercialModule }) {
  const qc = useQueryClient();
  const [name, setName] = useState(module.name);
  const [description, setDescription] = useState(module.description ?? "");
  const [commercialStatus, setCommercialStatus] = useState(module.commercialStatus);
  const save = useMutation({
    mutationFn: () => apiJson<CommercialCatalog>(`v1/platform/modules/${module.code}`, { method: "patch", json: { name, description, commercialStatus } }),
    onSuccess: (data) => { qc.setQueryData(commercialCatalogQuery.queryKey, data); sileo.success({ title: "Módulo atualizado" }); },
    onError: () => sileo.error({ title: "Não foi possível atualizar o módulo" }),
  });
  return <article className="commercial-card">
    <header><div><h3>{module.name}</h3><code>{module.code}</code></div><Badge tone={toneForStatus(module.commercialStatus)}>{labelForStatus(module.commercialStatus)}</Badge></header>
    <form className="catalog-settings" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
      <FormField label="Nome comercial"><Input value={name} onChange={(event) => setName(event.target.value)} /></FormField>
      <FormField label="Disponibilidade"><Select value={commercialStatus} onChange={(event) => setCommercialStatus(event.target.value as CommercialModule["commercialStatus"])}><option value="available">Disponível</option><option value="inactive">Inativo</option><option value="future">Futuro</option></Select></FormField>
      <FormField label="Descrição"><Textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
      <Button type="submit" variant="secondary" size="sm" loading={save.isPending}>Salvar módulo</Button>
    </form>
    <div className="pricing-list"><h4>Faixas de preço</h4>{module.pricingTiers.map((tier) => <TierEditor key={tier.id} tier={tier} />)}{!module.pricingTiers.length && <p className="empty-state">Nenhuma faixa cadastrada.</p>}<NewTierForm moduleCode={module.code} /></div>
  </article>;
}

function ComboEditor({ combo, modules }: { combo: ComboOffer; modules: CommercialModule[] }) {
  const qc = useQueryClient();
  const [name, setName] = useState(combo.name);
  const [description, setDescription] = useState(combo.description);
  const [listPrice, setListPrice] = useState(String(combo.listPriceCents / 100));
  const [price, setPrice] = useState(String(combo.monthlyPriceCents / 100));
  const [status, setStatus] = useState(combo.status);
  const [moduleCodes, setModuleCodes] = useState(combo.moduleCodes);
  const save = useMutation({
    mutationFn: () => apiJson<CommercialCatalog>(`v1/platform/combos/${combo.id}`, { method: "patch", json: { name, description, listPriceCents: priceToCents(listPrice), monthlyPriceCents: priceToCents(price), status, moduleCodes } }),
    onSuccess: (data) => { qc.setQueryData(commercialCatalogQuery.queryKey, data); sileo.success({ title: "Combo atualizado" }); },
    onError: () => sileo.error({ title: "Não foi possível atualizar o combo" }),
  });
  const submit = (event: FormEvent) => { event.preventDefault(); save.mutate(); };
  return <form className="combo-card" onSubmit={submit}>
    <header><div><h3>{combo.name}</h3><strong>{brl(combo.monthlyPriceCents)}/mês</strong></div><Badge tone={toneForStatus(combo.status)}>{labelForStatus(combo.status)}</Badge></header>
    <FormField label="Nome"><Input value={name} onChange={(event) => setName(event.target.value)} /></FormField>
    <FormField label="Soma avulsa (R$)"><Input type="number" min="0.01" step="0.01" value={listPrice} onChange={(event) => setListPrice(event.target.value)} /></FormField>
    <FormField label="Mensalidade (R$)"><Input type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /></FormField>
    <FormField label="Descrição"><Textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
    <FormField label="Situação"><Select value={status} onChange={(event) => setStatus(event.target.value as ComboOffer["status"])}><option value="active">Ativo</option><option value="inactive">Inativo</option></Select></FormField>
    <fieldset className="combo-modules"><legend>Módulos incluídos</legend>{modules.filter((module) => module.commercialStatus !== "future").map((module) => <CheckboxField key={module.code} label={module.name}><Checkbox checked={moduleCodes.includes(module.code)} onChange={(event) => setModuleCodes((current) => event.target.checked ? [...current, module.code] : current.filter((code) => code !== module.code))} /></CheckboxField>)}</fieldset>
    <Button type="submit" size="sm" loading={save.isPending}>Salvar combo</Button>
  </form>;
}

export function CommercialCatalogManager() {
  const query = useQuery(commercialCatalogQuery);
  return <section className="admin-section commercial-catalog">
    <SectionTitle title="Catálogo comercial" description="Controle a disponibilidade dos módulos, suas faixas de uso e os combos oferecidos. Alterações não concedem permissões automaticamente." />
    <QueryState loading={query.isLoading} error={query.isError}>
      <div className="commercial-module-list">{query.data?.modules.map((module) => <ModuleCatalogCard key={module.code} module={module} />)}</div>
      <div className="combo-section"><h3>Combos do ecossistema</h3><div className="combo-grid">{query.data?.combos.map((combo) => <ComboEditor key={combo.id} combo={combo} modules={query.data!.modules} />)}</div></div>
    </QueryState>
  </section>;
}
