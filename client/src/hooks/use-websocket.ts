import { useEffect, useRef, useState, useCallback } from 'react';

interface NotificationData {
  id: string;
  type: 'alert' | 'system' | 'employee' | 'camera';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface WebSocketMessage {
  type: 'notification' | 'update' | 'connection' | 'pong' | 'subscribed';
  data?: NotificationData;
  updateType?: string;
  message?: string;
  timestamp?: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<{ type: string; data: any } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected to Ghoobad.ai');
        setIsConnected(true);
        
        // Subscribe to all notifications
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          subscriptions: ['all']
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'notification':
              if (message.data) {
                setNotifications(prev => [message.data!, ...prev].slice(0, 50)); // Keep last 50 notifications
              }
              break;
            case 'update':
              if (message.updateType && message.data) {
                setLastUpdate({ type: message.updateType, data: message.data });
              }
              break;
            case 'connection':
              console.log('Connection confirmed:', message.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        sendMessage({ type: 'ping' });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    notifications,
    lastUpdate,
    sendMessage,
    clearNotifications,
    removeNotification,
    connect,
    disconnect
  };
}