import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import { Button, Input } from "../../components/ui/index.js";
import type { Person } from "./types.js";
import { filterParticipants } from "./filterParticipants.js";

interface Props {
  people: Person[] | undefined;
  loading: boolean;
  error: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRetry: () => void;
}

export function ParticipantSelector({ people, loading, error, selectedIds, onSelectionChange, onRetry }: Props) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => filterParticipants(people ?? [], search), [people, search]);

  const toggle = (id: string, checked: boolean) => {
    onSelectionChange(checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id));
  };

  return <div className="mx-auto w-full max-w-3xl space-y-3">
    <div className="relative">
      <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
      <Input aria-label="Buscar colaboradores" placeholder="Buscar por nome, identificação, cargo ou departamento" value={search}
        onChange={(event) => setSearch(event.target.value)} className="pl-10!" />
    </div>
    {!loading && !error && Boolean(people?.length) &&
      <p className="m-0 text-sm text-muted" aria-live="polite">{filtered.length} {filtered.length === 1 ? "colaborador encontrado" : "colaboradores encontrados"}</p>}

    {loading ? <div className="space-y-2" aria-label="Carregando colaboradores">
      {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-accent-soft" />)}
    </div> : error ? <div role="alert" className="rounded-xl border border-line bg-surface p-5 text-center">
      <p className="m-0 text-sm text-ink">Não foi possível carregar os colaboradores desta filial.</p>
      <Button type="button" variant="secondary" size="sm" onClick={onRetry} className="mt-3">Tentar novamente</Button>
    </div> : !people?.length ? <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center">
      <UsersRound size={24} aria-hidden="true" className="mx-auto mb-2 text-muted" />
      <strong className="block text-sm">Nenhum colaborador ativo nesta filial</strong>
      <p className="mt-1 mb-0 text-sm text-muted">Cadastre ou vincule colaboradores à filial para adicioná-los à turma.</p>
    </div> : !filtered.length ? <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center">
      <strong className="block text-sm">Nenhum colaborador encontrado</strong>
      <p className="mt-1 mb-3 text-sm text-muted">Tente outro nome, identificação, cargo ou departamento.</p>
      <Button type="button" variant="secondary" size="sm" onClick={() => setSearch("")}>Limpar busca</Button>
    </div> : <fieldset className="m-0 max-h-[26rem] space-y-1 overflow-y-auto rounded-xl border border-line bg-surface p-2">
      <legend className="sr-only">Colaboradores participantes</legend>
      {filtered.map((person) => <label key={person.id}
        className="flex min-h-16 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent-soft focus-within:outline-2 focus-within:outline-accent">
        <input type="checkbox" className="size-4 shrink-0 accent-accent" checked={selectedIds.includes(person.id)}
          onChange={(event) => toggle(person.id, event.target.checked)} />
        <span className="min-w-0"><strong className="block break-words text-sm text-ink">{person.fullName}</strong>
          <small className="block text-sm text-muted">{[person.externalCode, person.jobName, person.departmentName].filter(Boolean).join(" · ") || "Cargo não informado"}</small></span>
      </label>)}
    </fieldset>}
  </div>;
}
