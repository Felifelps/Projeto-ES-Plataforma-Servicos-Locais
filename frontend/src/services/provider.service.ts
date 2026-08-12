import api from './api';
import type { ProviderProfileRequest } from '../models/provider-profile-request.model';
import type { ProviderProfileResponse } from '../models/provider-profile-response.model';

class ProviderService {
  async createProviderProfile(data: ProviderProfileRequest): Promise<ProviderProfileResponse> {
    const response = await api.post<ProviderProfileResponse>('/prestadores', data);
    return response.data;
  }

  async getMyProfile(): Promise<ProviderProfileResponse | null> {
    try {
      const response = await api.get<ProviderProfileResponse>('/prestadores/me');
      return response.data;
    } catch {
      return null;
    }
  }
}

export const providerService = new ProviderService();
