'use client';

import { useEffect, useState } from 'react';
import { Event, getMockEvents } from '@/lib/api';
import EventCard from '@/components/EventCard';

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // Initialize dashboard with mock events (no backend streaming endpoint)
    setEvents(getMockEvents());

    if (!isPolling) return;

    const interval = setInterval(() => {
      setEvents((prevEvents) => {
        const newEvent: Event = {
          event_id: `evt_${Math.random().toString(36).substr(2, 9)}`,
          tenant_id: ['t1', 't2'][Math.floor(Math.random() * 2)],
          user_id: `u${Math.floor(Math.random() * 5) + 1}`,
          payload: {
            action: ['click', 'view', 'purchase', 'scroll'][
              Math.floor(Math.random() * 4)
            ],
            timestamp: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        };

        return [newEvent, ...prevEvents.slice(0, 49)];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPolling]);

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'unknown';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Live Event Stream
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Simulated real-time event visualization
          </p>
        </div>

        <button
          onClick={togglePolling}
          className={`rounded-lg px-6 py-2 font-medium text-white ${
            isPolling
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isPolling ? 'Stop' : 'Start'} Polling
        </button>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              isPolling ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm font-medium">
            {isPolling ? 'Polling Active' : 'Polling Paused'}
          </span>

          <span className="ml-auto text-xs text-gray-500">
            {events.length} events
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <EventCard
            key={event.event_id}
            event={event}
            formatTime={formatTime}
          />
        ))}
      </div>
    </div>
  );
}
