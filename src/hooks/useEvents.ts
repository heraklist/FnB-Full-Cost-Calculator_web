import { useState, useEffect, useCallback } from 'react';
import type { Event, EventStatus } from '../types';
import * as api from '../lib/api';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  createEvent: (event: Omit<Event, 'id'>) => Promise<number>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  updateEventStatus: (id: number, status: EventStatus) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useEvents(enabled: boolean = true): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!enabled) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (event: Omit<Event, 'id'>) => {
    const id = await api.createEvent(event);
    await fetchEvents();
    return id;
  }, [fetchEvents]);

  const updateEvent = useCallback(async (event: Event) => {
    await api.updateEvent(event);
    await fetchEvents();
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (id: number) => {
    await api.deleteEvent(id);
    await fetchEvents();
  }, [fetchEvents]);

  const updateEventStatus = useCallback(async (id: number, status: EventStatus) => {
    await api.updateEventStatus(id, status);
    await fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    refresh: fetchEvents
  };
}
