import { describe, expect, it } from "vitest";
import { filterParticipants } from "./filterParticipants.js";
import type { Person } from "./types.js";

const people: Person[] = [
  { id: "1", fullName: "João da Silva", publicPath: "", externalCode: "MAT-042", jobName: "Técnico de Segurança", departmentName: "Operações" },
  { id: "2", fullName: "Maria Souza", publicPath: "", externalCode: "MAT-105", jobName: "Enfermeira", departmentName: "Saúde" },
];

describe("filterParticipants", () => {
  it("encontra nomes com ou sem acento e combina termos", () => {
    expect(filterParticipants(people, "joao seguranca").map((person) => person.id)).toEqual(["1"]);
  });

  it("busca identificação, cargo e departamento sem exigir texto exato", () => {
    expect(filterParticipants(people, "042").map((person) => person.id)).toEqual(["1"]);
    expect(filterParticipants(people, "saude enfer").map((person) => person.id)).toEqual(["2"]);
  });
});
