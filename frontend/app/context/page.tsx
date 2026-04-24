'use client';

import { useState } from 'react';
import { getUserContext, UserContext, ApiError } from '@/lib/api';
import ContextCard from '@/components/ContextCard';

export default function ContextPage() {
  const [tenantId, setTenantId] = useState('');
  const [userId, setUserId] = useState('');
  const [context, setContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId.trim() || !userId.trim()) {
      setError('Please enter both tenant_id and user_id');
      return;
    }

    setLoading(true);
    setError(null);
    setContext(null);

    try {
      const result = await getUserContext(tenantId, userId);

      if (!result) {
        setError(
          'User context not found. Generate events first or check the IDs.'
        );
        return;
      }

      setContext(result);
    } catch (err) {
      console.error('Error fetching context:', err);
      setError('Failed to fetch user context. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Persona Viewer</h2>
        <p className="mt-1 text-sm text-gray-600">
          Search for a user and view their AI-generated persona
        </p>
      </div>

      {/* Search Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tenant ID
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="e.g., t1"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g., u1"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Fetching...' : 'Fetch Context'}
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Context Card */}
      {context && <ContextCard context={context} />}

      {/* Empty State */}
      {!loading && !error && !context && tenantId && userId && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            Enter tenant_id and user_id, then click "Fetch Context" to see persona data.
          </p>
        </div>
      )}
    </div>
  );
}
