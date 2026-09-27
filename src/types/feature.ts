export interface Scope { companyId: string; branchId: string }
export interface ModuleSearch { tab?: string; page: number; q: string; nr?: string; action?: "new" | "edit"; id?: string; periodDays?: 30 | 90 | 180 | 365; analyticsGroupBy?: "course" | "department" | "jobFunction" | "activity" | "status" }
