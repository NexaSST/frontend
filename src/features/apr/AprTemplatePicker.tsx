import { Combobox, Select } from "../../components/ui/index.js";
import { Field } from "../shared.js";
import type { Template } from "./types.js";

interface Props {
  nr: string;
  nrs: string[];
  templates: Template[];
  selectedVersionId: string;
  onNrChange: (nr: string) => void;
  onVersionChange: (versionId: string) => void;
  onVersionSelect: (versionId: string) => void;
  invalid?: boolean;
}

export function AprTemplatePicker({ nr, nrs, templates, selectedVersionId, onNrChange, onVersionChange, onVersionSelect, invalid }: Props) {
  return <div className={"grid grid-cols-[minmax(0,1fr)_10rem] gap-[.65rem] max-[640px]:grid-cols-[1fr]"}>
    <Field label={`Template · ${templates.length} disponíveis`} error={invalid ? "Selecione um template" : undefined}>
      <Combobox label="Template" value={selectedVersionId}
        options={templates.map((template) => ({
          value: template.versionId,
          label: `${template.nr ? `${template.nr} · ` : ""}${template.name} · v${template.versionNo}`,
        }))}
        onChange={onVersionChange} onSelect={onVersionSelect}
        placeholder="Busque pela atividade ou NR" invalid={invalid} />
    </Field>
    <Field label="Filtrar por NR">
      <Select value={nr} onChange={(event) => onNrChange(event.target.value)}>
        <option value="">Todas</option>
        {nrs.map((option) => <option key={option} value={option}>{option}</option>)}
      </Select>
    </Field>
  </div>;
}
