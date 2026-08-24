import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Always maintain one persistent socket connection
    if (!socketRef.current) {
      const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: true
      });
      socketRef.current = s;
      setSocket(s);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
