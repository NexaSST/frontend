import { expect, test } from '@playwright/test';

test('captures people and training navigation at review viewports', async ({ page }) => {
  const departmentPosts: Array<{ name: string; sectors?: string[] }> = [];
  await page.route('**/v1/auth/me', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    kind: 'company', email: 'gestor@example.test', companyId: '1', accountId: '2', identity: { id: '2', email: 'gestor@example.test', name: 'Gestor' },
    context: { type: 'company', company: { id: '1', name: 'Empresa Teste', timezone: 'America/Sao_Paulo' }, roles: [], branches: [{ id: '3', name: 'Matriz', code: 'MTZ', timezone: null,
      foundationPermissions: ['person.manage'], modules: [{ code: 'training', name: 'Treinamentos', permissions: ['training.manage', 'training.matrix.publish'] }] }] },
  }) }));
  await page.route('**/v1/companies/1/branches/3/**', (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'POST' && url.pathname.endsWith('/departments')) departmentPosts.push(route.request().postDataJSON());
    if (route.request().method() !== 'GET') return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: '1' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'X-Page': '1', 'X-Page-Size': '25', 'X-Total-Count': '0', 'X-Total-Pages': '0' }, body: '[]' });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/workspace/1/3/training?tab=courses&page=1&q=&action=new');
  await expect(page.getByRole('heading', { name: 'Novo curso' })).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/training-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Navegação' })).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/training-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/workspace/1/3/people?tab=jobs&page=1&q=');
  await expect(page.getByRole('button', { name: 'Novo cargo' })).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/people-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const activeTab = page.getByRole('button', { name: 'Cargos' });
  await expect(activeTab).toBeInViewport();
  await expect.poll(async () => {
    const box = await activeTab.boundingBox();
    return box ? box.x >= 0 && box.x + box.width <= 390 : false;
  }).toBe(true);
  await page.screenshot({ path: '.impeccable/review/people-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/workspace/1/3/people?tab=departments&page=1&q=&action=new');
  await expect(page.getByRole('heading', { name: 'Novo departamento' })).toBeVisible();
  await expect(page.getByText('Setores do departamento')).toBeVisible();
  await page.getByLabel('Nome do novo setor').fill('Produção');
  await page.getByRole('button', { name: 'Adicionar setor' }).click();
  await expect(page.getByLabel('Setores que serão criados')).toContainText('Produção');
  await page.screenshot({ path: '.impeccable/review/department-sectors-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText('Setores do departamento')).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/department-sectors-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Remover setor Produção' }).click();
  await page.getByLabel('Nome do departamento').fill('Administrativo');
  await page.getByRole('button', { name: 'Salvar departamento' }).click();
  await expect.poll(() => departmentPosts.length).toBe(1);
  expect(departmentPosts[0]).toEqual({ name: 'Administrativo' });
  await page.goto('/workspace/1/3/people?tab=departments&page=1&q=&action=new');
  await page.getByLabel('Nome do departamento').fill('Operação');
  await page.getByLabel('Nome do novo setor').fill('Produção');
  await page.getByRole('button', { name: 'Adicionar setor' }).click();
  await page.getByRole('button', { name: 'Salvar departamento e setores' }).click();
  await expect.poll(() => departmentPosts.length).toBe(2);
  expect(departmentPosts[1]).toEqual({ name: 'Operação', sectors: ['Produção'] });
  await page.goto('/workspace/1/3/people?tab=overview&page=1&q=');
  await expect(page.getByRole('button', { name: 'Visão geral' })).toHaveAttribute('aria-current', 'page');
  await page.screenshot({ path: '.impeccable/review/people-overview-tabs-mobile.png', fullPage: true });
});
