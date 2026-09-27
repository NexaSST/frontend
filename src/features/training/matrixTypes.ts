export interface Named { id: string; name: string }
export interface Course extends Named { validityDays: number | null }
export interface Rule { name: string; courseIds: string[]; effect: 'require' | 'waive'; reason?: string; departmentId?: string; sectorId?: string; jobFunctionId?: string; personId?: string; activityId?: string; effectiveFrom?: string; effectiveUntil?: string }
export interface Version { id: string; versionNo: number; status: string; effectiveFrom: string; groups?: Rule[] | null; rules: Array<Omit<Rule, 'courseIds'> & { courseId: string }> }
export interface Matrix extends Named { versions: Version[] }
