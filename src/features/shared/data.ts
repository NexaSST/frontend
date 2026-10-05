import { useQuery } from "@tanstack/react-query";
import { apiAllRows, apiPage } from "../../lib/api.js";
import type { ModuleSearch } from "../../types/feature.js";

export function usePagedRows<T>(
  key: string,
  endpoint: string,
  search: ModuleSearch,
  extra?: Record<string, string | number | boolean | undefined>,
) {
  return useQuery({
    queryKey: [key, endpoint, search.page, search.q, extra],
    queryFn: () =>
      apiPage<T>(endpoint, {
        searchParams: {
          page: search.page,
          pageSize: 25,
          ...(search.q ? { search: search.q } : {}),
          ...extra,
        },
      }),
  });
}

export function useAllRows<T>(key: string, endpoint: string, enabled = true) {
  return useQuery({
    queryKey: [key, endpoint],
    queryFn: async () => ({ rows: await apiAllRows<T>(endpoint) }),
    enabled,
  });
}
