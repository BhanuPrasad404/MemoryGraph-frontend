'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ProgressData {
  documentId: string;
  step: number;
  progress: number;
  message: string;
  timestamp: string;
  details?: any;
}

interface UseUploadWebSocketProps {
  documentId: string;
  userId: string;
  onProgress?: (data: ProgressData) => void;
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useUploadWebSocket({
  documentId,
  userId,
  onProgress,
  onComplete,
  onError,
}: UseUploadWebSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!documentId || !userId) return;

    //  Prevent duplicate connections
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    // In useUploadWebSocket hook, improve options:
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;
    startTimeRef.current = Date.now();

    socket.on('connect', () => {
      setIsConnected(true);

      socket.emit('join-user-room', userId);
      console.log("User has joined his Room")
      socket.emit('join-document-room', documentId);
      console.log("user has joined the Doucment Room")
      socket.emit('document-ready', documentId);
    });

    socket.on('document-progress', (data: ProgressData) => {
      console.log('🔥🔥🔥 WebSocket PROGRESS RECEIVED:', data);
      setProgress(data);

      if (data.progress > 0) {
        const elapsed = Date.now() - startTimeRef.current;
        const total = (elapsed / data.progress) * 100;
        const remaining = total - elapsed;

        if (remaining > 0) {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          setEstimatedTime(`${m}m ${s}s`);
        }
      }

      onProgress?.(data);
    });

    socket.on('document-completed', (data: any) => {
      setProgress((prev) =>
        prev ? { ...prev, progress: 100, message: 'Processing complete!' } : null
      );
      onComplete?.(data);
    });

    socket.on('document-error', (err: any) => {
      onError?.(err?.error || 'Processing failed');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    //  CLEANUP — runs ONLY when documentId/userId changes or component unmounts
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [documentId, userId]);

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  };

  const reconnect = () => {
    disconnect();
    // effect will re-run only if ids change
  };

  return {
    socket: socketRef.current,
    isConnected,
    progress,
    estimatedTime,
    disconnect,
    reconnect,
  };
}
