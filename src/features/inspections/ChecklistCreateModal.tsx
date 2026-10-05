import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, Input, Select, Textarea } from "../../components/ui/index.js";
import { Field, FormModal, type Scope } from "../shared.js";
import type { Template } from "./types.js";
import { base } from "./api.js";

const checklistSchema = z.object({
  name: z.string().trim().min(2),
  questions: z.array(z.object({
    prompt: z.string().trim().min(2),
    answerType: z.enum(["conformity", "text", "number", "date"]),
  })).min(1),
});

type ChecklistForm = z.infer<typeof checklistSchema>;
export type CreatedChecklist = Pick<Template, "id" | "name">;

export function ChecklistCreateModal({ scope, onClose, onCreated }: {
  scope: Scope;
  onClose: () => void;
  onCreated?: (template: CreatedChecklist) => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<ChecklistForm>({
    resolver: zodResolver(checklistSchema),
    defaultValues: { name: "", questions: [{ prompt: "", answerType: "conformity" }] },
  });
  const questions = useFieldArray({ control: form.control, name: "questions" });
  const save = useMutation({
    mutationFn: (values: ChecklistForm) => apiJson<CreatedChecklist>(`${base(scope)}/inspection-templates`, { method: "post", json: values }),
    onSuccess: (template) => {
      onCreated?.(template);
      onClose();
      sileo.success({ title: "Checklist publicado" });
      void Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["inspection-templates"] }),
        queryClient.invalidateQueries({ queryKey: ["inspection-template-options"] }),
      ]);
    },
    onError: () => sileo.error({ title: "Não foi possível publicar o checklist" }),
  });

  return <FormModal title="Novo checklist" description="A publicação cria uma versão imutável para a filial." onClose={onClose}>
    <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={form.handleSubmit((values) => save.mutate(values))}>
      <Field label="Nome"><Input {...form.register("name")} /></Field>
      <div className={"repeat-list grid gap-3 [&_>_section]:grid [&_>_section]:gap-[0.7rem] [&_>_section]:p-[0.85rem] [&_>_section]:border [&_>_section]:border-solid [&_>_section]:border-line [&_>_section]:rounded-control [&_>_section]:bg-[#f8f8f4]"}>
        {questions.fields.map((question, index) => <section key={question.id}>
          <div className={"repeat-heading flex items-center justify-between gap-2"}>
            <strong>Questão {index + 1}</strong>
            {questions.fields.length > 1 && <Button type="button" variant="ghost" size="sm" className={"danger"}
              onClick={() => questions.remove(index)}>Remover</Button>}
          </div>
          <Field label="Pergunta"><Textarea {...form.register(`questions.${index}.prompt`)} /></Field>
          <Field label="Tipo de resposta">
            <Select {...form.register(`questions.${index}.answerType`)}>
              <option value="conformity">Conformidade</option>
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
            </Select>
          </Field>
        </section>)}
      </div>
      <Button type="button" variant="secondary" onClick={() => questions.append({
        prompt: "", answerType: "conformity",
      })}>Adicionar questão</Button>
      <Button type="submit" disabled={save.isPending}>{save.isPending ? "Publicando…" : "Publicar checklist"}</Button>
    </form>
  </FormModal>;
}
