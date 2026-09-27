import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { Toaster } from 'sileo';
import { AuthenticatedLayout } from './components/AuthenticatedLayout.js';
import { AccountPage } from './pages/AccountPage.js';
import { sessionQueryOptions } from './lib/session.js';
import { CompanyHomePage } from './pages/CompanyHomePage.js';
import { BranchHomePage } from './pages/BranchHomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ActivatePage, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage, MicrosoftAccountPage } from './pages/AuthFlowPages.js';
import { LandingPageV0 } from './pages/LandingPageV0.js';
import { ModulePage } from './pages/ModulePage.js';
import { PeopleStructurePage } from './pages/PeopleStructurePage.js';
import { PlatformCompanyPage } from './pages/PlatformCompanyPage.js';
import { PlatformPage } from './pages/PlatformPage.js';
import { PublicAssetPage, PublicPersonPage } from './pages/PublicProfilePage.js';

interface RouterContext { queryClient: QueryClient }

const rootRoute = createRootRouteWithContext<RouterContext>()({ component: () => <><Toaster position="top-center" theme="dark" options={{ fill: '#111a17', roundness: 12 }} /><Outlet /></> });
const landingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPageV0 });
const legacyLandingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/apresentacao', beforeLoad: () => { throw redirect({ to: '/' }); } });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', validateSearch: (input: Record<string, unknown>) => ({
  redirect: typeof input.redirect === 'string' && input.redirect.startsWith('/') && !input.redirect.startsWith('//') ? input.redirect : undefined,
}), component: LoginPage });
const activateRoute = createRoute({ getParentRoute: () => rootRoute, path: '/activate', component: ActivatePage });
const verifyEmailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/verify-email', component: VerifyEmailPage });
const forgotPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: '/forgot-password', component: ForgotPasswordPage });
const resetPasswordRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reset-password', component: ResetPasswordPage });
const publicAssetRoute = createRoute({ getParentRoute: () => rootRoute, path: '/public/assets/$token', component: PublicAssetPage });
const publicPersonRoute = createRoute({ getParentRoute: () => rootRoute, path: '/public/people/$token', component: PublicPersonPage });
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  beforeLoad: async ({ context, location }) => {
    try { return { session: await context.queryClient.ensureQueryData(sessionQueryOptions) }; }
    catch { throw redirect({ to: '/login', search: { redirect: location.href } }); }
  },
  component: AuthenticatedLayout,
});
const indexRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/app', validateSearch: (input: Record<string, unknown>) => ({
  branchId: typeof input.branchId === 'string' ? input.branchId : undefined,
  periodDays: [30, 90, 180, 365].includes(Number(input.periodDays)) ? Number(input.periodDays) as 30 | 90 | 180 | 365 : undefined,
}), beforeLoad: ({ context }) => {
  if (context.session.kind === 'platform') throw redirect({ to: '/platform' });
}, component: CompanyHomePage });
const platformRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/platform', beforeLoad: ({ context }) => {
  if (context.session.kind !== 'platform') throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
}, component: PlatformPage });
const platformCompanyRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/platform/companies/$companyId', beforeLoad: ({ context }) => {
  if (context.session.kind !== 'platform') throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
}, component: PlatformCompanyPage });
const accountRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/account', component: AccountPage });
const microsoftAccountRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/account/microsoft', beforeLoad: ({ context }) => {
  if (context.session.kind !== 'company') throw redirect({ to: '/platform' });
}, component: MicrosoftAccountPage });
export const branchRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/workspace/$companyId/$branchId',
  validateSearch: (input: Record<string, unknown>) => ({
    periodDays: [30, 90, 180, 365].includes(Number(input.periodDays)) ? Number(input.periodDays) as 30 | 90 | 180 | 365 : 30,
    categoryId: typeof input.categoryId === 'string' ? input.categoryId : undefined,
    activityDomain: ['training', 'inspections', 'apr'].includes(String(input.activityDomain)) ? input.activityDomain as 'training' | 'inspections' | 'apr' : undefined,
    trainingPage: typeof input.trainingPage === 'number' && input.trainingPage > 0 ? input.trainingPage : 1,
    inspectionsPage: typeof input.inspectionsPage === 'number' && input.inspectionsPage > 0 ? input.inspectionsPage : 1,
    aprPage: typeof input.aprPage === 'number' && input.aprPage > 0 ? input.aprPage : 1,
  }),
  beforeLoad: ({ context, params }) => {
    if (context.session.kind === 'platform') return;
    if (context.session.companyId !== params.companyId) throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
    if (!context.session.context.branches.some((item) => item.id === params.branchId)) throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
  }, component: BranchHomePage });
export const moduleRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/workspace/$companyId/$branchId/$moduleCode',
  validateSearch: (input: Record<string, unknown>) => ({
    ...(input.area === 'pt' || input.area === 'apr' ? { area: input.area as 'apr' | 'pt' } : {}),
    tab: typeof input.tab === 'string' ? input.tab : undefined,
    page: typeof input.page === 'number' && input.page > 0 ? input.page : 1,
    q: typeof input.q === 'string' ? input.q : '',
    ...(typeof input.nr === 'string' && /^NR-\d{2}$/.test(input.nr) ? { nr: input.nr } : {}),
    action: input.action === 'new' || input.action === 'edit' ? input.action as 'new' | 'edit' : undefined,
    id: typeof input.id === 'string' ? input.id : undefined,
    periodDays: [30, 90, 180, 365].includes(Number(input.periodDays)) ? Number(input.periodDays) as 30 | 90 | 180 | 365 : 30,
    ...(['course', 'department', 'jobFunction', 'activity', 'status'].includes(String(input.analyticsGroupBy))
      ? { analyticsGroupBy: input.analyticsGroupBy as 'course' | 'department' | 'jobFunction' | 'activity' | 'status' } : {}),
  }), beforeLoad: ({ context, params }) => {
  if (context.session.kind !== 'company' || context.session.companyId !== params.companyId) throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
  const branch = context.session.context.branches.find((item) => item.id === params.branchId);
  if (!branch?.modules.some((module) => module.code === params.moduleCode)) throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
}, component: ModulePage });

export const peopleRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/workspace/$companyId/$branchId/people',
  validateSearch: (input: Record<string, unknown>) => ({
    tab: typeof input.tab === 'string' ? input.tab : undefined,
    page: typeof input.page === 'number' && input.page > 0 ? input.page : 1,
    q: typeof input.q === 'string' ? input.q : '',
    action: input.action === 'new' || input.action === 'edit' ? input.action as 'new' | 'edit' : undefined,
    id: typeof input.id === 'string' ? input.id : undefined,
    periodDays: [30, 90, 180, 365].includes(Number(input.periodDays)) ? Number(input.periodDays) as 30 | 90 | 180 | 365 : 30,
  }), beforeLoad: ({ context, params }) => {
  if (context.session.kind !== 'company' || context.session.companyId !== params.companyId) throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
  const branch = context.session.context.branches.find((item) => item.id === params.branchId);
  if (!branch?.foundationPermissions.some((permission) => permission === 'person.manage' || permission === 'analytics.view')) throw redirect({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
}, component: PeopleStructurePage });

const routeTree = rootRoute.addChildren([landingRoute, legacyLandingRoute, loginRoute, activateRoute, verifyEmailRoute, forgotPasswordRoute, resetPasswordRoute, publicAssetRoute, publicPersonRoute,
  authenticatedRoute.addChildren([indexRoute, platformRoute, platformCompanyRoute, accountRoute, microsoftAccountRoute, branchRoute, moduleRoute, peopleRoute])]);
export const router = createRouter({ routeTree, context: { queryClient: undefined! }, defaultPreload: 'intent' });

declare module '@tanstack/react-router' { interface Register { router: typeof router } }
