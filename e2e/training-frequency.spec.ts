import { expect, test } from '@playwright/test';
test('frequency, realization and grouped matrix workflows', async ({ page }) => {
  const writes: any[] = [];
  const courses = [{ id: '11', code: 'CUR-000011', name: 'Segurança em altura', type: 'legal', frequencyId: '4', validityDays: 365, workloadHours: 8 }, { id: '12', code: 'CUR-000012', name: 'Integração de segurança', type: 'internal', frequencyId: '1', validityDays: null, workloadHours: 2 }];
  const frequencies = [{ id: '1', name: 'Sem frequência', days: null }, { id: '4', name: 'Anual', days: 365 }, { id: '6', name: 'Trienal', days: 1095 }];
  await page.route('**/v1/auth/me', (route) => route.fulfill({ json: { kind: 'company', email: 'gestor@example.test', companyId: '1', accountId: '2', identity: { id: '2', email: 'gestor@example.test', name: 'Gestor' }, context: { type: 'company', company: { id: '1', name: 'Empresa Teste', timezone: 'America/Sao_Paulo' }, roles: [], branches: [{ id: '3', name: 'Matriz', code: 'MTZ', timezone: null, foundationPermissions: ['person.manage'], modules: [{ code: 'training', name: 'Treinamentos', permissions: ['training.manage', 'training.matrix.publish'] }] }] } } }));
  await page.route('**/v1/companies/1/branches/3/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET') { writes.push({ path, body: route.request().postDataJSON() }); return route.fulfill({ status: 200, json: { id: '7' } }); }
    if (path.endsWith('/training-frequencies/access')) return route.fulfill({ json: { canManage: true } });
    const rows = path.endsWith('/training-frequencies') ? frequencies : path.endsWith('/training-courses') ? courses : [];
    return route.fulfill({ json: rows, headers: { 'X-Page': '1', 'X-Page-Size': '100', 'X-Total-Count': String(rows.length), 'X-Total-Pages': '1' } });
  });
  const capture = async (name: string) => {
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: `.impeccable/review/${name}-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 }); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/${name}-mobile.png`, fullPage: true }); await page.setViewportSize({ width: 1440, height: 1000 });
  };
  await page.goto('/workspace/1/3/training?tab=courses&page=1&q=&action=new');
  await page.getByLabel('Tipo do curso').click(); await page.getByRole('option', { name: 'Legal', exact: true }).click(); await page.getByLabel('Frequência do curso').click(); await page.getByRole('option', { name: 'Trienal · 1095 dias', exact: true }).click(); await capture('training-course-frequency');
  await page.goto('/workspace/1/3/training?tab=frequencies&page=1&q=');
  await page.getByRole('button', { name: 'Nova frequência' }).click(); await page.getByLabel('Nome da frequência').fill('A cada 45 dias'); await page.getByLabel('Intervalo em dias').fill('45'); await capture('training-frequency-catalog');
  await page.getByRole('button', { name: 'Salvar frequência' }).click(); await expect.poll(() => writes.some((w) => w.body?.days === 45)).toBe(true);
  await page.goto('/workspace/1/3/training?tab=events&page=1&q=&action=new');
  await page.getByRole('combobox', { name: 'Curso', exact: true }).click(); await page.getByRole('option', { name: /CUR-000011/ }).click(); await page.getByLabel('Data realizada').fill('2026-01-01'); await page.getByLabel('Modalidade', { exact: true }).click(); await page.getByRole('option', { name: 'Periódico', exact: true }).click();
  await expect(page.getByText('01/01/2027', { exact: true })).toBeVisible(); await capture('training-realization');
  await page.getByRole('button', { name: 'Continuar para participantes' }).click(); await expect.poll(() => writes.some((w) => w.body?.modality === 'periodic')).toBe(true);
  await page.goto('/workspace/1/3/training?tab=matrices&page=1&q='); await page.getByRole('button', { name: /Criar matriz/ }).click();
  await page.getByRole('button', { name: 'Salvar e configurar regras' }).click(); await page.getByLabel('Nome da regra').fill('Integração operacional'); await page.getByRole('button', { name: 'Criar regra e vincular cursos' }).click();
  await expect(page.getByRole('button', { name: 'Salvar regras e revisar' })).toBeDisabled();
  await page.getByRole('checkbox', { name: /Segurança em altura/ }).check(); await page.getByRole('checkbox', { name: /Integração de segurança/ }).check(); await capture('training-matrix-groups');
  await page.getByRole('button', { name: 'Salvar regras e revisar' }).click(); await expect.poll(() => writes.some((w) => w.body?.rules?.[0]?.courseIds.length === 2)).toBe(true);
  await page.getByRole('button', { name: 'Continuar para publicação' }).click(); await page.getByRole('button', { name: 'Publicar matriz' }).click(); await expect.poll(() => writes.some((w) => w.path.endsWith('/draft/publish'))).toBe(true);
});
