import { Event } from '@/lib/api';

interface EventCardProps {
  event: Event;
  formatTime: (timestamp?: string) => string;
}

export default function EventCard({ event, formatTime }: EventCardProps) {
  const actionColor = (action: string): string => {
    switch (action) {
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'click':
        return 'bg-blue-100 text-blue-800';
      case 'view':
        return 'bg-purple-100 text-purple-800';
      case 'scroll':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const action = event.payload?.action as string || 'unknown';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-gray-900">
                {event.event_id}
              </span>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${actionColor(action)}`}>
                {action}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>
                <span className="font-medium">Tenant:</span> {event.tenant_id}
              </span>
              <span>
                <span className="font-medium">User:</span> {event.user_id}
              </span>
              <span>
                <span className="font-medium">Time:</span> {formatTime(event.created_at)}
              </span>
            </div>
          </div>
        </div>
        {event.payload && (
          <div className="ml-4 text-right">
            <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {JSON.stringify(event.payload).slice(0, 50)}
              {JSON.stringify(event.payload).length > 50 ? '...' : ''}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
