export interface Person { id: string; fullName: string }
export interface Department { id: string; name: string; managerPersonId: string | null; managerName: string | null; supervisorPersonId: string | null; supervisorName: string | null }
export interface Sector { id: string; name: string }
