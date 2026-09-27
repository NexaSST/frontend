import { describe, expect, it } from "vitest";
import { aprWizardIssues } from "./aprWizardIssues.js";
import type { AprFormValues, Template } from "./types.js";

const template: Template = { id: "1", versionId: "2", versionNo: 1, name: "Modelo", definition: {
  instructions: "", questions: [{ code: "q1", text: "Condição segura?", required: true, allowNa: true }],
} };
const complete: AprFormValues = { referenceCode: "APR-001", title: "Troca de painel", templateVersionId: "2",
  activityId: "", sector: "", location: "Sala elétrica", executionOn: "2026-09-24", analystPersonId: "3", teamText: "",
  answers: [{ code: "q1", answer: "yes", observation: "" }],
  risks: [{ taskStep: "Desligar", hazard: "Choque", consequence: "", severityCode: "", likelihoodCode: "",
    controls: [{ description: "Bloqueio" }] }], participantIds: ["3"] };

describe("aprWizardIssues", () => {
  it("accepts a complete APR", () => expect(aprWizardIssues(complete, template)).toEqual([]));
  it("points to the correct steps for incomplete draft fields", () => {
    const issues = aprWizardIssues({ ...complete, location: "", risks: [{ ...complete.risks[0]!, controls: [{ description: "" }] }],
      answers: [{ code: "q1", answer: "no", observation: "" }], participantIds: [] }, template);
    expect(issues.map((issue) => issue.step)).toEqual([1, 2, 3, 4, 4]);
  });
});
