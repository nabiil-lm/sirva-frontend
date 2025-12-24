import apiClient from '@/lib/api-client';
import { Dossier, QuestionnaireTemplate, RiskRegister, RiskItem } from '@/types/dossier';

// Define types locally if not available in types/dossier
export interface Question {
  id: number;
  text: string;
  question_type: 'TRUE_FALSE' | 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TEXT';
  is_mandatory: boolean;
  choices_json: string[];
  order: number;
  help_text?: string;
}

export interface QuestionnaireWithQuestions extends QuestionnaireTemplate {
  questions: Question[];
}

export interface Answer {
  id?: number;
  question: number;
  answer_value: string;
}

export interface CreateDossierParams {
  title: string;
  questionnaire_template: number;
  responsible_so?: number; // CHANGED: Expect ID (number) instead of email
}

export interface SecurityOfficer {
  id: string;
  email: string;
  name: string;
}

export interface CreateRiskItemParams {
  title: string;
  description?: string;
  likelihood: string;
  impact: string;
  level: string;
  mitigation?: string;
}

export interface AmRiskActionParams {
  risk_item_id: number;
  action: 'accept' | 'delegate' | 'contest';
  delegate_user_email?: string;
  contest_reason?: string;
}

class DossierService {
  async getDossiers(): Promise<Dossier[]> {
    const response = await apiClient.get<Dossier[]>('/dossiers/');
    return response.data;
  }

  async getDossier(id: string): Promise<Dossier> {
    // CHANGED: Use the 'full' endpoint to get IA results and other nested data
    const response = await apiClient.get<Dossier>(`/dossiers/${id}/full/`);
    return response.data;
  }

  async createDossier(data: CreateDossierParams): Promise<Dossier> {
    const response = await apiClient.post<Dossier>('/dossiers/', data);
    return response.data;
  }

  async getAvailableTemplates(): Promise<{ count: number; templates: QuestionnaireTemplate[] }> {
    const response = await apiClient.get('/questionnaires/available/');
    return response.data;
  }

  async getTemplateWithQuestions(templateId: number): Promise<QuestionnaireWithQuestions> {
    const response = await apiClient.get<QuestionnaireWithQuestions>(`/questionnaires/${templateId}/with_questions/`);
    return response.data;
  }

  async getDossierAnswers(dossierId: string): Promise<Answer[]> {
    const response = await apiClient.get<Answer[]>(`/dossiers/${dossierId}/answers/`);
    return response.data;
  }

  async saveAnswers(dossierId: string, answers: { question: number; answer_value: string }[]): Promise<void> {
    await apiClient.post(`/dossiers/${dossierId}/answers/bulk_answer/`, {
      dossier_id: parseInt(dossierId),
      answers
    });
  }

  async submitDossier(dossierId: string): Promise<Dossier> {
    const response = await apiClient.post<Dossier>(`/dossiers/${dossierId}/submit/`, {});
    return response.data;
  }

  async getAvailableSOs(): Promise<SecurityOfficer[]> {
    const response = await apiClient.get<SecurityOfficer[]>('/dossiers/available_sos/');
    return response.data;
  }

  async createRiskRegister(dossierId: string): Promise<RiskRegister> {
    const response = await apiClient.post<RiskRegister>(`/dossiers/${dossierId}/risk-register/`, {});
    return response.data;
  }

  async submitRiskRegister(dossierId: string, registerId: number): Promise<void> {
    await apiClient.post(`/dossiers/${dossierId}/risk-register/${registerId}/submit/`);
  }

  async createRiskItem(dossierId: string, registerId: number, data: CreateRiskItemParams): Promise<RiskItem> {
    const response = await apiClient.post<RiskItem>(`/dossiers/${dossierId}/risk-register/${registerId}/items/`, data);
    return response.data;
  }

  async updateRiskItem(dossierId: string, registerId: number, itemId: number, data: CreateRiskItemParams): Promise<RiskItem> {
    const response = await apiClient.patch<RiskItem>(`/dossiers/${dossierId}/risk-register/${registerId}/items/${itemId}/`, data);
    return response.data;
  }

  async deleteRiskItem(dossierId: string, registerId: number, itemId: number): Promise<void> {
    await apiClient.delete(`/dossiers/${dossierId}/risk-register/${registerId}/items/${itemId}/`);
  }

  async performAmRiskAction(dossierId: string, registerId: number, data: AmRiskActionParams): Promise<void> {
    await apiClient.post(`/dossiers/${dossierId}/risk-register/${registerId}/items/`, data);
  }

  async performDelegationAction(dossierId: string, registerId: number, data: { risk_item_id: number; action: 'accept' | 'refuse' }): Promise<void> {
    await apiClient.post(`/dossiers/${dossierId}/risk-register/${registerId}/items/delegation-action/`, data);
  }

  async reviewContest(dossierId: string, registerId: number, itemId: number, action: 'accept' | 'refuse'): Promise<void> {
    await apiClient.post(`/dossiers/${dossierId}/risk-register/${registerId}/items/${itemId}/review_contest/`, { action });
  }

  async validateDossier(dossierId: string): Promise<void> {
    await apiClient.post(`/dossiers/${dossierId}/validation/`);
  }
}

const dossierService = new DossierService();
export default dossierService;
