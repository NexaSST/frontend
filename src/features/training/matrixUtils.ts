import type { Rule, Version } from './matrixTypes.js';

export const emptyRule: Rule = { name: '', courseIds: [], effect: 'require' };
export const localDateTime = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
export const formatDateTime = (value?: string) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
export const draftSnapshot = (name: string, effectiveFrom: string, rules: Rule[]) => JSON.stringify({ name, effectiveFrom, rules });
export function versionRules(version?: Version): Rule[] {
  if (!version) return [];
  return (version.groups ?? version.rules).map((rule) => ({ name: rule.name ?? 'Regra migrada', courseIds: 'courseIds' in rule ? rule.courseIds : [rule.courseId], effect: rule.effect, reason: rule.reason, departmentId: rule.departmentId, sectorId: rule.sectorId, jobFunctionId: rule.jobFunctionId, personId: rule.personId, activityId: rule.activityId, effectiveFrom: rule.effectiveFrom, effectiveUntil: rule.effectiveUntil }));
}
