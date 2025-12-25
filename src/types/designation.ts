// Designation Types for API integration

export interface ApiDesignation {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface CreateDesignationRequest {
  title: string;
  description?: string;
}

export interface UpdateDesignationRequest {
  title?: string;
  description?: string;
}

// API Response types
export interface DesignationResponse {
  designation: ApiDesignation;
}

export interface DesignationsListResponse {
  designations: ApiDesignation[];
}

export interface DeleteDesignationResponse {
  message: string;
}
