export type IncidentStatus = 'NOUVEAU' | 'EN_COURS' | 'RESOLU' | 'REJETE';
export type IncidentPriority = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';

export interface IncidentRequest {
  title: string;
  description: string;
  imageUrl?: string;
  priority: IncidentPriority;
  departmentId?: number;
  categoryId?: number;
}

export interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  departmentName?: string;
  categoryName?: string;
  employeeEmail?: string;
  technicianEmail?: string;
}