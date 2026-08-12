export interface ProviderProfileResponse {
  id: number;
  userId: number;
  document: string;
  documentType: 'CPF' | 'CNPJ';
  phones: string[];
  categories: string[];
  serviceAreas: string[];
  description: string;
}
