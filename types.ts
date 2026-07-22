export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WORKER = 'worker',
  ENGINEERING = 'engineering',
  FACTORY = 'factory'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface RolePermission {
  displayName: string;
  allowedViews: string[];
}

export interface MaterialFormulaItem {
  id: string;
  name: string;
  formula: string;
  unit: string;
}

export interface MaterialFormulaConfig {
  id: string;
  keyword: string;
  category: string;
  items: MaterialFormulaItem[];
}

export interface Employee {
  id: string;
  name: string;
  nickname?: string;
  role?: string;
  category?: string;
}

export type CardType = 'material' | 'outsourcing' | 'subcontractor' | 'production';

export interface PlanningCard {
  id: string;
  name: string;
  type: CardType;
  projectName?: string;
  spec?: string;
  vendor?: string;
  quantity?: number;
  unit?: string;
  materialDetails?: { id: string, name: string, quantity: number, unit: string }[];
}

export interface TaskSchedule {
  date: string;
  collabCards: PlanningCard[];
  masterAssignments: Record<string, PlanningCard[]>;
  master?: string;
  masterCards?: PlanningCard[];
  cards?: PlanningCard[];
  lastModifiedBy?: string;
  lastModifiedAt?: number;
}

export interface SystemRules {
  productionKeywords: string[];
  subcontractorKeywords: string[];
  modularProductionKeywords: string[];
  modularSubcontractorKeywords: string[];
  materialFormulas: MaterialFormulaConfig[];
  rolePermissions?: Record<UserRole, RolePermission>;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  [key: string]: any;
}
