import { useEffect, useRef, useCallback, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type SSEEventType = 
  | 'candidate_status_change'
  | 'interview_scheduled'
  | 'feedback_submitted'
  | 'candidate_created'
  | 'connection_established';

export interface SSEEvent {
  type: SSEEventType;
  candidateId?: string;
  applicationId?: string;
  newStatus?: string;
  previousStatus?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface UseSSEOptions {
  enabled?: boolean;
  onEvent?: (event: SSEEvent) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxRetries?: number;
}

export function useSSE(options: UseSSEOptions = {}) {
  const {
    enabled = true,
    onEvent,
    onError,
    onConnect,
    onDisconnect,
    reconnectInterval = 5000,
    maxRetries = 5,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!enabled) return;
    
    cleanup();

    const token = sessionStorage.getItem('ats_auth_token');
    
    // SSE with token as query param (EventSource doesn't support headers)
    const url = token 
      ? `${API_BASE}/sse/events?token=${encodeURIComponent(token)}`
      : `${API_BASE}/sse/events`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      retriesRef.current = 0;
      onConnect?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        setLastEvent(data);
        onEvent?.(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    // Listen for specific event types
    const eventTypes: SSEEventType[] = [
      'candidate_status_change',
      'interview_scheduled',
      'feedback_submitted',
      'candidate_created',
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          setLastEvent({ ...data, type: eventType });
          onEvent?.({ ...data, type: eventType });
        } catch (error) {
          console.error(`Failed to parse ${eventType} event:`, error);
        }
      });
    });

    eventSource.onerror = (error) => {
      setIsConnected(false);
      onError?.(error);
      onDisconnect?.();
      
      // Attempt to reconnect
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval * retriesRef.current);
      }
    };
  }, [enabled, onEvent, onError, onConnect, onDisconnect, reconnectInterval, maxRetries, cleanup]);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }
    return cleanup;
  }, [enabled, connect, cleanup]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  return {
    isConnected,
    lastEvent,
    reconnect,
    disconnect: cleanup,
  };
}
