import ky, { HTTPError, type KyResponse, type Options } from 'ky';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function readCookie(name: string, source = document.cookie): string | undefined {
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = source.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
}

const transport = ky.create({
  prefix: '/',
  credentials: 'include',
  timeout: 20_000,
  retry: 0,
  hooks: {
    beforeRequest: [({ request }) => {
      if (!unsafeMethods.has(request.method)) return;
      const csrfToken = readCookie('nexasst_csrf');
      if (csrfToken) request.headers.set('X-CSRF-Token', csrfToken);
    }],
  },
});

let refreshPromise: Promise<void> | undefined;

async function refreshSession(): Promise<void> {
  refreshPromise ??= transport.post('v1/auth/refresh').then(() => undefined).finally(() => { refreshPromise = undefined; });
  return refreshPromise;
}

function returnToLogin(): void {
  if (typeof window === 'undefined' || window.location.pathname === '/login') return;
  const redirect = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
}

export async function apiResponse<T = unknown>(input: string, options?: Options, retryAfterRefresh = true): Promise<KyResponse<T>> {
  try {
    return await transport<T>(input, options);
  } catch (error) {
    const cannotRefresh = input === 'v1/auth/refresh' || input.endsWith('/login') || input.endsWith('/web/login');
    if (!(error instanceof HTTPError) || error.response.status !== 401 || !retryAfterRefresh || cannotRefresh) throw error;
    try {
      await refreshSession();
    } catch (refreshError) {
      if (refreshError instanceof HTTPError && [401, 403].includes(refreshError.response.status)) returnToLogin();
      throw refreshError;
    }
    return transport<T>(input, options);
  }
}

export async function apiJson<T>(input: string, options?: Options): Promise<T> {
  const response = await apiResponse<T>(input, options);
  if (response.status === 204) return undefined as T;
  return response.json();
}

export interface PageResult<T> {
  rows: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function apiPage<T>(input: string, options?: Options): Promise<PageResult<T>> {
  const response = await apiResponse<T[]>(input, options);
  return {
    rows: await response.json(),
    page: Number(response.headers.get('X-Page') ?? 1),
    pageSize: Number(response.headers.get('X-Page-Size') ?? 25),
    total: Number(response.headers.get('X-Total-Count') ?? 0),
    totalPages: Number(response.headers.get('X-Total-Pages') ?? 0),
  };
}

export async function apiAllRows<T>(input: string, searchParams: Record<string, string | number | boolean> = {}): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; ; page += 1) {
    const result = await apiPage<T>(input, { searchParams: { ...searchParams, page, pageSize: 100 } });
    rows.push(...result.rows);
    if (page >= result.totalPages) return rows;
  }
}
