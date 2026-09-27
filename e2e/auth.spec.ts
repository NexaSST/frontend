import { expect, test, type Page } from "@playwright/test";

async function chooseOption(page: Page, label: string, option: string, useLast = false) {
  const trigger = page.getByRole("combobox", { name: label });
  await (useLast ? trigger.last() : trigger.first()).click();
  const listbox = page.getByRole("listbox", { name: label });
  await expect(listbox).toBeVisible();
  expect(await listbox.evaluate((element) => element.closest(".table-scroll"))).toBeNull();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("company admin sees the dashboard and enters a branch", async ({ page }, testInfo) => {
  await page.route("**/v1/auth/company/web/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        expiresAt: new Date().toISOString(),
        refreshExpiresAt: new Date().toISOString(),
      }),
    }),
  );
  await page.route("**/v1/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "company",
        email: "gestor@example.test",
        companyId: "1",
        accountId: "2",
        identity: { id: "2", email: "gestor@example.test", name: "Gestor" },
        context: {
          type: "company",
          company: {
            id: "1",
            name: "Empresa Teste",
            timezone: "America/Sao_Paulo",
          },
          roles: [],
          branches: [
            {
              id: "3",
              name: "Matriz",
              code: "MTZ",
              timezone: null,
              foundationPermissions: ["branch.manage", "person.manage"],
              modules: [
                {
                  code: "inspections",
                  name: "Inspeções",
                  permissions: ["asset.manage"],
                },
              ],
            },
          ],
        },
      }),
    }),
  );
  await page.route("**/v1/companies/1/dashboard**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      generatedAt: "2026-09-16T12:00:00.000Z",
      periodDays: 30,
      scope: { companyId: "1", branchId: null },
      snapshot: {
        activePeople: 66,
        training: { applicable: 100, compliant: 82, expiring: 8, expired: 10, missing: 8, peopleWithoutMatrix: 3, assignmentIssues: 0, compliancePercent: 82 },
        inspections: { monitoredAssets: 420, planned: 400, compliant: 370, overdue: 30, missingSchedule: 12, expiredAssets: 4, missingValidity: 2, compliancePercent: 92.5 },
      },
      period: { inspectionsCompleted: 48, nonconformantFindings: 7 },
      activity: [
        { start: "2026-08-18", end: "2026-08-22", label: "18/08", inspectionsCompleted: 5, nonconformantFindings: 1 },
        { start: "2026-08-23", end: "2026-08-27", label: "23/08", inspectionsCompleted: 8, nonconformantFindings: 0 },
        { start: "2026-08-28", end: "2026-09-01", label: "28/08", inspectionsCompleted: 7, nonconformantFindings: 2 },
        { start: "2026-09-02", end: "2026-09-06", label: "02/09", inspectionsCompleted: 9, nonconformantFindings: 1 },
        { start: "2026-09-07", end: "2026-09-11", label: "07/09", inspectionsCompleted: 11, nonconformantFindings: 2 },
        { start: "2026-09-12", end: "2026-09-16", label: "12/09", inspectionsCompleted: 8, nonconformantFindings: 1 },
      ],
      branches: [{ id: "3", name: "Matriz", code: "MTZ", timezone: null, activePeople: 66,
        training: { applicable: 100, compliant: 82, expiring: 8, expired: 10, missing: 8, peopleWithoutMatrix: 3, assignmentIssues: 0, compliancePercent: 82 },
        inspections: { monitoredAssets: 420, planned: 400, compliant: 370, overdue: 30, missingSchedule: 12, expiredAssets: 4, missingValidity: 2, compliancePercent: 92.5 },
        period: { inspectionsCompleted: 48, nonconformantFindings: 7 }, attentionCount: 76 }],
      alerts: [
        { code: "TRAINING_GAPS", severity: "danger", branchId: "3", branchName: "Matriz", title: "Treinamentos obrigatórios pendentes", description: "Matriz possui obrigações vencidas ou ainda não concluídas.", count: 18 },
        { code: "OVERDUE_INSPECTIONS", severity: "danger", branchId: "3", branchName: "Matriz", title: "Inspeções atrasadas", description: "Matriz possui ativos cuja próxima inspeção já passou.", count: 30 },
        { code: "MISSING_SCHEDULE", severity: "warning", branchId: "3", branchName: "Matriz", title: "Ativos sem próxima inspeção", description: "Matriz possui ativos periódicos sem uma próxima data calculada.", count: 12 },
      ],
    }),
  }));
  await page.route("**/v1/companies/1/branches/3/dashboard**", (route) => {
    if (new URL(route.request().url()).pathname.endsWith("/priorities")) return route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify({
        domain: "inspections", page: 1, pageSize: 5, total: 1, totalPages: 1,
        items: [{ id: "inspection_overdue:10", domain: "inspections", kind: "inspection_overdue", severity: "danger", title: "EXT-001", detail: "Extintor · inspeção atrasada", date: "2026-09-10", entityId: "10" }],
      }),
    });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      generatedAt: "2026-09-16T12:00:00.000Z", asOf: "2026-09-16", timezone: "America/Sao_Paulo", periodDays: 30,
      scope: { companyId: "1", branchId: "3", categoryId: null }, branch: { id: "3", name: "Matriz", code: "MTZ" },
      contractedModules: ["inspections"], categories: [{ id: "7", name: "Combate a incêndio" }],
      snapshot: { activePeople: 66, inspections: { registeredAssets: 420, monitoredAssets: 420, periodicAssets: 400, planned: 400, compliant: 370, overdue: 30, missingSchedule: 12, expiredAssets: 4, missingValidity: 2, compliancePercent: 92.5 } },
      period: { inspectionsCompleted: 48, nonconformantFindings: 7 },
      activity: [
        { start: "2026-08-18", end: "2026-08-22", label: "18/08", trainingCompleted: 0, inspectionsCompleted: 5, nonconformantFindings: 1, aprRevisionsFinalized: 0, workPermitsAuthorized: 0 },
        { start: "2026-08-23", end: "2026-08-27", label: "23/08", trainingCompleted: 0, inspectionsCompleted: 8, nonconformantFindings: 0, aprRevisionsFinalized: 0, workPermitsAuthorized: 0 },
        { start: "2026-08-28", end: "2026-09-01", label: "28/08", trainingCompleted: 0, inspectionsCompleted: 7, nonconformantFindings: 2, aprRevisionsFinalized: 0, workPermitsAuthorized: 0 },
        { start: "2026-09-02", end: "2026-09-06", label: "02/09", trainingCompleted: 0, inspectionsCompleted: 9, nonconformantFindings: 1, aprRevisionsFinalized: 0, workPermitsAuthorized: 0 },
        { start: "2026-09-07", end: "2026-09-11", label: "07/09", trainingCompleted: 0, inspectionsCompleted: 11, nonconformantFindings: 2, aprRevisionsFinalized: 0, workPermitsAuthorized: 0 },
        { start: "2026-09-12", end: "2026-09-16", label: "12/09", trainingCompleted: 0, inspectionsCompleted: 8, nonconformantFindings: 1, aprRevisionsFinalized: 0, workPermitsAuthorized: 0 },
      ],
      priorities: [{ id: "inspection_overdue:10", domain: "inspections", kind: "inspection_overdue", severity: "danger", title: "EXT-001", detail: "Extintor · inspeção atrasada", date: "2026-09-10", entityId: "10" }],
      modules: { inspections: { registeredAssets: 420, monitoredAssets: 420, periodicAssets: 400, planned: 400, compliant: 370, overdue: 30, missingSchedule: 12, expiredAssets: 4, missingValidity: 2, compliancePercent: 92.5, inspectionsCompleted: 48, nonconformantFindings: 7 } },
    }) });
  });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("gestor@example.test");
  await page.getByLabel("Senha").fill("senha-segura");
  await page.getByRole("button", { name: /^Entrar/ }).click();
  await expect(page.getByRole("heading", { name: "Visão geral da empresa" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Indicadores atuais" }).getByText("92,5%", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Entrar na filial/ })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("company-dashboard-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("company-dashboard-mobile.png"), fullPage: true });
  await page.getByRole("link", { name: /Entrar na filial/ }).click();
  await expect(page.getByRole("heading", { name: "Matriz" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Indicadores atuais" }).getByText("420", { exact: true })).toBeVisible();
  await chooseOption(page, "Período", "Últimos 90 dias");
  await expect(page).toHaveURL(/periodDays=90/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole("heading", { name: "Acessos rápidos" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("branch-dashboard-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("branch-dashboard-mobile.png"), fullPage: true });
  await page.getByRole("link", { name: /Abrir operação e cadastros do módulo/ }).click();
  await expect(page.getByRole("heading", { name: "Ativos e inspeções", exact: true })).toBeVisible();
});

test("inspection workspace is usable on desktop and mobile", async ({
  page,
}, testInfo) => {
  const session = {
    kind: "company",
    email: "gestor@example.test",
    companyId: "1",
    accountId: "2",
    identity: { id: "2", email: "gestor@example.test", name: "Gestor" },
    context: {
      type: "company",
      company: {
        id: "1",
        name: "Empresa Teste",
        timezone: "America/Sao_Paulo",
      },
      roles: [],
      branches: [
        {
          id: "3",
          name: "Matriz",
          code: "MTZ",
          timezone: null,
          foundationPermissions: [],
          modules: [
            {
              code: "inspections",
              name: "Inspeções",
              permissions: ["asset.manage"],
            },
          ],
        },
      ],
    },
  };
  await page.route("**/v1/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(session),
    }),
  );
  await page.route("**/v1/companies/1/branches/3/assets**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "X-Page": "1",
        "X-Page-Size": "25",
        "X-Total-Count": "2",
        "X-Total-Pages": "1",
      },
      body: JSON.stringify([
        {
          id: "10",
          code: "EXT-001",
          assetTypeId: "4",
          sector: "Produção",
          location: "Linha A",
          expiresOn: "2027-01-10",
          nextInspectionDueOn: "2026-10-10",
          rowVersion: "1",
        },
        {
          id: "11",
          code: "EPI-042",
          assetTypeId: "5",
          sector: "Manutenção",
          location: "Oficina",
          expiresOn: null,
          nextInspectionDueOn: null,
          rowVersion: "1",
        },
      ]),
    }),
  );
  await page.route("**/v1/companies/1/branches/3/asset-types**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "X-Page": "1",
        "X-Page-Size": "25",
        "X-Total-Count": "2",
        "X-Total-Pages": "1",
      },
      body: JSON.stringify([
        {
          id: "4",
          name: "Extintor",
          categoryId: "1",
          inspectionIntervalDays: 30,
          hasExpirationDate: true,
          defaultTemplateId: null,
          rowVersion: "1",
        },
        {
          id: "5",
          name: "Capacete",
          categoryId: "2",
          inspectionIntervalDays: null,
          hasExpirationDate: false,
          defaultTemplateId: null,
          rowVersion: "1",
        },
      ]),
    }),
  );
  await page.goto("/workspace/1/3/inspections?tab=assets&page=1&q=");
  await expect(
    page.getByRole("heading", { name: "Ativos e inspeções" }),
  ).toBeVisible();
  await expect(page.getByText("EXT-001")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("workspace-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: /Novo ativo/ })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("workspace-mobile.png"),
    fullPage: true,
  });
});

test("master opens company contracts and access administration", async ({ page }, testInfo) => {
  let contractCreated = false;
  let roleUpdated = false;
  await page.route("**/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ kind: "platform", email: "master@example.test", platformAccountId: "1", identity: { id: "1", email: "master@example.test", name: "Master" }, context: { type: "platform", capabilities: { canManageCompanies: true, canManageBranches: true, canManageEntitlements: true, canSelectCompanyAndBranch: true } } }) }));
  await page.route("**/v1/platform/companies/1", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "1", name: "Empresa Teste", legalName: null, taxIdentifier: null, timezone: "America/Sao_Paulo" }) }));
  await page.route("**/v1/companies/1/branches**", (route) => route.fulfill({ status: 200, contentType: "application/json", headers: { "X-Page": "1", "X-Page-Size": "100", "X-Total-Count": "1", "X-Total-Pages": "1" }, body: JSON.stringify([{ id: "3", name: "Matriz", code: "MTZ", timezone: null }]) }));
  await page.route("**/v1/platform/commercial-catalog", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ modules: [{ code: "inspections", name: "Ativos e inspeções", description: "Gestão de inspeções", commercialStatus: "available", sortOrder: 10, pricingTiers: [{ id: "11", code: "standard", name: "Inspeções Digitais", monthlyPriceCents: 49000, quotaMetric: "inspectors", quotaLimit: 2, includedDescription: "2 inspetores e checklists ilimitados", status: "active", sortOrder: 10 }] }], combos: [] }) }));
  await page.route("**/v1/platform/companies/1/modules**", (route) => {
    if (route.request().method() === "POST") {
      contractCreated = true;
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "9", companyId: "1", branchId: null, moduleCode: "inspections", pricingTierId: "11", contractedMonthlyPriceCents: 49000, startsAt: new Date().toISOString(), endsAt: null, status: "active" }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "X-Page": "1", "X-Page-Size": "25", "X-Total-Count": "1", "X-Total-Pages": "1" }, body: JSON.stringify([{ id: "8", companyId: "1", branchId: null, moduleCode: "inspections", pricingTierId: "11", contractedMonthlyPriceCents: 49000, startsAt: "2026-01-01T00:00:00.000Z", endsAt: null, status: "active" }]) });
  });
  await page.route("**/v1/companies/1/accounts**", (route) => {
    if (route.request().method() === "PATCH") {
      roleUpdated = true;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "7", roleCode: "manager", branchId: "3", grantedAt: "2026-01-01T00:00:00.000Z" }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", headers: { "X-Page": "1", "X-Page-Size": "25", "X-Total-Count": "1", "X-Total-Pages": "1" }, body: JSON.stringify([{ id: "2", fullName: "Gestor", email: "gestor@example.test", status: "active", invitationExpiresAt: null, roles: [{ id: "7", roleCode: "company_admin", branchId: null, grantedAt: "2026-01-01T00:00:00.000Z" }] }]) });
  });
  await page.goto("/platform/companies/1");
  await expect(page.getByRole("heading", { name: "Empresa Teste" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contratos de módulos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Convites e funções" })).toBeVisible();
  await expect(page.getByText("gestor@example.test")).toBeVisible();
  await chooseOption(page, "Módulo", "Ativos e inspeções");
  await chooseOption(page, "Plano e faixa de uso", "Inspeções Digitais · R$ 490,00 · 2 inspetores e checklists ilimitados");
  await page.getByRole("button", { name: "Criar contrato" }).click();
  await expect.poll(() => contractCreated).toBe(true);
  const actionsTrigger = page.getByRole("button", { name: "Ações" }).last();
  await actionsTrigger.click();
  const actionsMenu = page.getByRole("menu");
  await expect(actionsMenu).toBeVisible();
  expect(await actionsMenu.evaluate((element) => element.closest(".table-scroll"))).toBeNull();
  const [triggerBox, menuBox] = await Promise.all([actionsTrigger.boundingBox(), actionsMenu.boundingBox()]);
  expect(triggerBox).not.toBeNull();
  expect(menuBox).not.toBeNull();
  expect(Math.abs((menuBox!.x + menuBox!.width) - (triggerBox!.x + triggerBox!.width))).toBeLessThanOrEqual(2);
  await page.screenshot({ path: testInfo.outputPath("master-actions-dropdown.png"), fullPage: true });
  await page.getByRole("menuitem", { name: "Alterar função ou escopo" }).click();
  await expect(page.getByRole("heading", { name: "Alterar função ou escopo" })).toBeVisible();
  await chooseOption(page, "Nova função", "Gestor");
  await chooseOption(page, "Escopo de acesso", "Somente filial: Matriz", true);
  await page.screenshot({ path: testInfo.outputPath("master-company-access-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect.poll(() => roleUpdated).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("master-company-access-mobile.png"), fullPage: true });
});

test("master manages module pricing and ecosystem combos", async ({ page }, testInfo) => {
  await page.route("**/v1/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ kind: "platform", email: "master@example.test", platformAccountId: "1", context: { type: "platform", canManageCompanies: true, canManageBranches: true, canManageEntitlements: true, canSelectCompanyAndBranch: true, operationalAccessMode: "administrative" } }) }));
  await page.route("**/v1/platform/companies**", (route) => route.fulfill({ status: 200, contentType: "application/json", headers: { "X-Page": "1", "X-Page-Size": "25", "X-Total-Count": "1", "X-Total-Pages": "1" }, body: JSON.stringify([{ id: "1", name: "Empresa Teste", timezone: "America/Sao_Paulo" }]) }));
  await page.route("**/v1/platform/commercial-catalog", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ modules: [
    { code: "training", name: "Gestão de Treinamentos", description: "Gestão de capacitações", commercialStatus: "available", sortOrder: 10, pricingTiers: [
      { id: "1", code: "starter-50", name: "Starter", monthlyPriceCents: 69000, quotaMetric: "collaborators", quotaLimit: 50, includedDescription: "Até 50 colaboradores", status: "active", sortOrder: 10 },
      { id: "2", code: "growth-150", name: "Growth", monthlyPriceCents: 219000, quotaMetric: "collaborators", quotaLimit: 150, includedDescription: "Até 150 colaboradores", status: "active", sortOrder: 20 },
      { id: "3", code: "scale-500", name: "Scale", monthlyPriceCents: 699000, quotaMetric: "collaborators", quotaLimit: 500, includedDescription: "Até 500 colaboradores", status: "active", sortOrder: 30 },
    ] },
    { code: "inspections", name: "Inspeções Digitais & Checklists", description: "Inspeções digitais", commercialStatus: "available", sortOrder: 20, pricingTiers: [{ id: "4", code: "level-1", name: "Nível 1", monthlyPriceCents: 49000, quotaMetric: "inspectors", quotaLimit: 2, includedDescription: "Até 2 inspetores e até 100 ativos", status: "active", sortOrder: 10 }] },
    { code: "apr", name: "APR + Permissão de Trabalho (PT)", description: "Gestão integrada de APRs e Permissões de Trabalho", commercialStatus: "available", sortOrder: 30, pricingTiers: [{ id: "5", code: "level-1", name: "Nível 1", monthlyPriceCents: 69000, quotaMetric: "monthly-issues", quotaLimit: 50, includedDescription: "Até 50 emissões de APR/PT por mês", status: "active", sortOrder: 10 }] },
  ], combos: [{ id: "1", code: "scale", name: "Combo Scale", description: "Operação industrial", listPriceCents: 1286000, monthlyPriceCents: 964500, status: "active", sortOrder: 30, moduleCodes: ["training", "inspections", "apr", "ergonomics"] }] }) }));
  await page.goto("/platform");
  await expect(page.getByRole("heading", { name: "Catálogo comercial" })).toBeVisible();
  await expect(page.locator('input[value="Até 500 colaboradores"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Combo Scale" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("master-catalog-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("master-catalog-mobile.png"), fullPage: true });
});

test("APR/PT creates a work permit on desktop and mobile", async ({ page }, testInfo) => {
  let workPermitCreated = false;
  const paginated = (body: unknown[]) => ({
    status: 200,
    contentType: "application/json",
    headers: {
      "X-Page": "1",
      "X-Page-Size": "100",
      "X-Total-Count": String(body.length),
      "X-Total-Pages": "1",
    },
    body: JSON.stringify(body),
  });

  await page.route("**/v1/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      kind: "company",
      email: "gestor@example.test",
      companyId: "1",
      accountId: "2",
      identity: { id: "2", email: "gestor@example.test", name: "Gestor" },
      context: {
        type: "company",
        company: { id: "1", name: "Empresa Teste", timezone: "America/Sao_Paulo" },
        roles: [],
        branches: [{
          id: "3",
          name: "Matriz",
          code: "MTZ",
          timezone: null,
          foundationPermissions: [],
          modules: [{
            code: "apr",
            name: "APR / PT",
            permissions: ["apr.manage", "apr.finalize", "template.manage", "template.publish"],
          }],
        }],
      },
    }),
  }));
  await page.route("**/v1/companies/1/branches/3/work-permits**", (route) => {
    if (route.request().method() === "POST") {
      workPermitCreated = true;
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "51", referenceCode: "PT-051", title: "Troca de painel", status: "draft", version: 1 }),
      });
    }
    return route.fulfill(paginated([]));
  });
  await page.route("**/v1/companies/1/branches/3/apr-people-options**", (route) =>
    route.fulfill(paginated([{ id: "21", fullName: "Ana Técnica" }])),
  );
  await page.route("**/v1/companies/1/branches/3/apr-activities**", (route) =>
    route.fulfill(paginated([{ id: "31", name: "Manutenção elétrica" }])),
  );
  await page.route("**/v1/companies/1/branches/3/aprs**", (route) =>
    route.fulfill(paginated([{ id: "41", referenceCode: "APR-041", title: "Troca de painel", status: "finalized" }])),
  );

  await page.goto("/workspace/1/3/apr?tab=work-permits&page=1");
  await expect(page.getByRole("heading", { name: "APR / PT" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Permissões de Trabalho" })).toBeVisible();
  await page.getByRole("button", { name: "Nova PT" }).click();
  await page.getByLabel("Referência").fill("PT-051");
  await page.getByLabel("Título").fill("Troca de painel");
  await page.getByLabel("Descrição do trabalho").fill("Substituição preventiva do painel elétrico.");
  await chooseOption(page, "Atividade", "Manutenção elétrica");
  await page.getByRole("checkbox", { name: "Ana Técnica" }).check();
  await page.getByRole("checkbox", { name: /APR-041/ }).check();
  await page.screenshot({ path: testInfo.outputPath("apr-pt-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Salvar rascunho" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("apr-pt-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Salvar rascunho" }).click();
  await expect.poll(() => workPermitCreated).toBe(true);
});
