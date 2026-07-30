import { useEffect } from 'react';
import { socket } from '../services/socket';

export const useSocket = (event, callback) => {
  useEffect(() => {
    if (!event || !callback) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
};

export default useSocket;
