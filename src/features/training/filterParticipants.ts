import type { Person } from "./types.js";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export function filterParticipants(people: Person[], search: string): Person[] {
  const terms = normalize(search.trim()).split(/\s+/).filter(Boolean);
  if (!terms.length) return people;
  return people.filter((person) => {
    const fields = [person.fullName, person.externalCode, person.jobName, person.departmentName]
      .filter((value): value is string => Boolean(value));
    const text = normalize(fields.join(" "));
    return terms.every((term) => text.includes(term));
  });
}
