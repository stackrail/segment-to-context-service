import { UserContext } from '@/lib/api';

interface ContextCardProps {
  context: UserContext;
}

export default function ContextCard({ context }: ContextCardProps) {
  const confidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Context</h3>
              <p className="mt-1 text-sm text-gray-600">
                {context.tenant_id} / {context.user_id}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Updated: {formatDate(context.updated_at)}
            </div>
          </div>
        </div>

        {/* Persona Display */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
              Persona
            </label>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {context.persona}
            </p>
          </div>

          {/* Confidence */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
              Confidence Score
            </label>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-2 bg-blue-600 transition-all"
                  style={{ width: `${context.confidence * 100}%` }}
                />
              </div>
              <span
                className={`rounded px-3 py-1 text-sm font-semibold ${confidenceColor(
                  context.confidence
                )}`}
              >
                {(context.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Signals */}
          {context.signals && context.signals.length > 0 && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                Behavioral Signals
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {context.signals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
