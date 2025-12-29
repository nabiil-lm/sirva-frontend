export enum DossierStatus {
  EN_EDITION = 'EN_EDITION',
  QUESTIONNAIRE_SOUMIS = 'QUESTIONNAIRE_SOUMIS',
  IA1_INCOHERENT = 'IA1_INCOHERENT',
  IA1_COHERENT = 'IA1_COHERENT',
  ARCHI_UPLOAD_EN_COURS = 'ARCHI_UPLOAD_EN_COURS',
  IA2_INCOHERENT = 'IA2_INCOHERENT',
  IA2_COHERENT = 'IA2_COHERENT',
  RISQUES_EN_COURS = 'RISQUES_EN_COURS',
  PRET_VALIDATION = 'PRET_VALIDATION',
  VALIDE = 'VALIDE',
}

export enum RiskStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED',
  ACCEPTED = 'ACCEPTED',
}

export enum RiskItemStatus {
  PENDING = 'PENDING',
  DELEGATED_PENDING = 'DELEGATED_PENDING',
  ACCEPTED = 'ACCEPTED',
  CONTESTED = 'CONTESTED',
  REFUSED = 'REFUSED',
  INVALIDATED = 'INVALIDATED', // NEW
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RiskLikelihood {
  RARE = 'RARE',
  UNLIKELY = 'UNLIKELY',
  POSSIBLE = 'POSSIBLE',
  LIKELY = 'LIKELY',
  ALMOST_CERTAIN = 'ALMOST_CERTAIN',
}

export enum RiskImpact {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  SEVERE = 'SEVERE',
  CATASTROPHIC = 'CATASTROPHIC',
}

export interface IaCheckResult {
  secure_score: number;
  status: string;
  findings: {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    [key: string]: string | string[] | undefined;
  };
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'AM' | 'SO' | 'ADMIN';
  role_display: string;
}

export interface IaResult {
  status: string;
  secure_score: number;
  findings: Record<string, string | string[] | undefined> | string; // Allow flexible findings structure
  raw_response?: string; // Added raw_response
  created_at: string;
}

export interface Dossier {
  id: number;
  title: string;
  status: string;
  status_display: string;
  am: User;
  responsible_so_details?: User; // NEW: SO user details
  questionnaire_template: number | null;
  questionnaire_template_name: string | null;
  is_submitted: boolean;
  architecture_docs_submitted?: boolean;  // ADD THIS LINE
  created_at: string;
  updated_at: string;
  ia1_result?: IaResult; // Add this field
  ia2_result?: IaResult; // Add this field
  risk_register?: RiskRegister | null; // Add risk_register field
}

export interface QuestionnaireTemplate {
  id: number;
  name: string;
  description: string;
  question_count: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface RiskItem {
  id: number;
  register: number;
  title: string;
  description: string;
  likelihood: RiskLikelihood;
  likelihood_display?: string;
  impact: RiskImpact;
  impact_display?: string;
  level: RiskLevel;
  level_display?: string;
  mitigation: string;
  status: RiskItemStatus;
  status_display?: string;
  owner_user?: User;
  delegated_to?: number; // Changed: ID of the user
  delegated_to_user?: User; // New: Full user object
  contest_reason?: string;
  contestation_reason?: string; // New: Matches backend field
  contest_refused?: boolean;
  refused_by?: number[];
  created_at: string;
  updated_at: string;
}

export interface RiskRegister {
  id: number;
  dossier: number;
  status: RiskStatus;
  status_display?: string;
  items: RiskItem[];
  total_items: number;
  accepted_items: number;
  created_at: string;
  updated_at: string;
}
