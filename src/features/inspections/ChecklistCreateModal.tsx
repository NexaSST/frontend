import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { sileo } from "sileo";
import { z } from "zod";
import { apiJson } from "../../lib/api.js";
import { Button, Checkbox, CheckboxField, Input, Select, Textarea } from "../../components/ui/index.js";
import { Field, FormModal, type Scope } from "../shared.js";
import type { Template } from "./types.js";
import { base } from "./api.js";

const checklistSchema = z.object({
  name: z.string().trim().min(2),
  questions: z.array(z.object({
    prompt: z.string().trim().min(2),
    answerType: z.enum(["conformity", "text", "number", "date"]),
    requiresPhotoOnFailure: z.boolean(),
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
    defaultValues: { name: "", questions: [{ prompt: "", answerType: "conformity", requiresPhotoOnFailure: true }] },
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
    <form className="form-stack" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
      <Field label="Nome"><Input {...form.register("name")} /></Field>
      <div className="repeat-list">
        {questions.fields.map((question, index) => <section key={question.id}>
          <div className="repeat-heading">
            <strong>Questão {index + 1}</strong>
            {questions.fields.length > 1 && <Button type="button" variant="ghost" size="sm" className="danger"
              onClick={() => questions.remove(index)}>Remover</Button>}
          </div>
          <Field label="Pergunta"><Textarea {...form.register(`questions.${index}.prompt`)} /></Field>
          <Field label="Tipo de resposta">
            <Select {...form.register(`questions.${index}.answerType`, {
              onChange: (event) => form.setValue(`questions.${index}.requiresPhotoOnFailure`, event.target.value === "conformity"),
            })}>
              <option value="conformity">Conformidade</option>
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
            </Select>
          </Field>
          {form.watch(`questions.${index}.answerType`) === "conformity" &&
            <CheckboxField label="Exigir foto na não conformidade">
              <Checkbox {...form.register(`questions.${index}.requiresPhotoOnFailure`)} />
            </CheckboxField>}
        </section>)}
      </div>
      <Button type="button" variant="secondary" onClick={() => questions.append({
        prompt: "", answerType: "conformity", requiresPhotoOnFailure: true,
      })}>Adicionar questão</Button>
      <Button type="submit" disabled={save.isPending}>{save.isPending ? "Publicando…" : "Publicar checklist"}</Button>
    </form>
  </FormModal>;
}
