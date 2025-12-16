export interface ProjectMember {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Project {
    id: number;
    name: string;
    description: string;
    startDate: string; // ISO String (e.g. "2025-12-05...")
    endDate: string;
    status: string;    // 'Active' | 'Completed' etc.
    creatorId: string;
    creatorName: string;
    members: ProjectMember[];
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  status: string; // "Active", "Completed", "On Hold"
}

export interface EditProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string | null; // Nullable in case they haven't picked one
  status: string;
}