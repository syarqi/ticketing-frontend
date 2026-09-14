export type Role = 'ADMIN' | 'TEKNISI';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: Role;
}

export interface Location {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Priority {
  id: string;
  name: string;
  color: string;
  level: number;
  is_active: boolean;
}

export interface UpdateType {
  id: string;
  name: string;
  is_active: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface TicketRef {
  id: string;
  fullName: string;
}

export interface Attachment {
  id: string;
  url: string;
  originalName: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  issueType: string;
  detail: string | null;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  location: { id: string; name: string };
  priority: { id: string; name: string; color: string; level: number };
  createdBy: TicketRef;
  assignedTo: TicketRef | null;
  initialAttachments?: Attachment[];
}

export interface TicketUpdateEntry {
  id: string;
  note: string | null;
  createdAt: string;
  user: TicketRef;
  updateType: { id: string; name: string } | null;
  attachments: Attachment[];
}
