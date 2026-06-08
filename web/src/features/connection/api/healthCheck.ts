import { apiClient } from '@/shared/api/client'

export async function checkBackendHealth(): Promise<boolean> {
  try {
    await apiClient.get('/health')
    return true
  } catch {
    return false
  }
}
