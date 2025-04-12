import { io } from 'socket.io-client';

export const initSocket = () => {
  return io('http://10.1.1.155:6112');
};
