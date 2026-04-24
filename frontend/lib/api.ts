/**
 * API Client for Backend
 * Centralized configuration and request utilities
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Event {
  event_id: string;
  tenant_id: string;
  user_id: string;
  payload: Record<string, unknown>;
  created_at?: string;
}

export interface UserContext {
  tenant_id: string;
  user_id: string;
  persona: string;
  confidence: number;
  signals?: string[];
  updated_at?: string;
}

export interface ApiError {
  error: string;
}

/**
 * Fetch user context/persona with retry logic
 */
export async function getUserContext(
  tenantId: string,
  userId: string,
  retries = 1
): Promise<UserContext | null> {
  try {
    const params = new URLSearchParams({
      tenant_id: tenantId,
      user_id: userId,
    });

    const response = await fetch(`${BASE_URL}/context?${params}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as UserContext;
  } catch (error) {
    console.error('Failed to fetch user context:', error);

    if (retries > 0) {
      console.log('Retrying context fetch...');
      return getUserContext(tenantId, userId, retries - 1);
    }

    throw error;
  }
}

/**
 * Mock event stream for demo purposes
 */
export function getMockEvents(): Event[] {
  return [
    {
      event_id: 'evt_001',
      tenant_id: 't1',
      user_id: 'u1',
      payload: { action: 'purchase', amount: 99.99 },
      created_at: new Date(Date.now() - 30000).toISOString(),
    },
    {
      event_id: 'evt_002',
      tenant_id: 't1',
      user_id: 'u2',
      payload: { action: 'click', page: 'pricing' },
      created_at: new Date(Date.now() - 20000).toISOString(),
    },
    {
      event_id: 'evt_003',
      tenant_id: 't2',
      user_id: 'u3',
      payload: { action: 'view', product_id: '42' },
      created_at: new Date(Date.now() - 10000).toISOString(),
    },
    {
      event_id: 'evt_004',
      tenant_id: 't1',
      user_id: 'u1',
      payload: { action: 'click', page: 'checkout' },
      created_at: new Date().toISOString(),
    },
  ];
}
