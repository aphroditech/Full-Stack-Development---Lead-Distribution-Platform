export type LeadStatus = "sent" | "unsent" | "duplicate" | "failed";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Broker {
  id: string;
  name: string;
  active: boolean;
  dailyCap: number;
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: number[];
  createdAt: string;
  updatedAt: string;
  sentToday?: number;
  totalLeads?: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  ipAddress: string;
  formName: string;
  status: LeadStatus;
  assignedBrokerId: string | null;
  broker: { id: string; name: string } | null;
  assignedAt: string | null;
  createdAt: string;
}

export interface FormInfo {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  hasDistribution: boolean;
}

export interface DistributionBrokerSetting {
  id: string;
  brokerId: string;
  percentage: number;
  active: boolean;
  broker: Broker | null;
}

export interface Distribution {
  id: string;
  formId: string;
  form: { id: string; name: string; slug: string } | null;
  createdAt: string;
  brokers: DistributionBrokerSetting[];
}

export interface LeadStats {
  total: number;
  sent: number;
  unsent: number;
  duplicate: number;
  failed: number;
}

export interface DashboardStats {
  brokers: { total: number; active: number };
  hasForm: boolean;
  hasDistribution: boolean;
  form: { id: string; name: string; slug: string } | null;
  leads: LeadStats;
}
