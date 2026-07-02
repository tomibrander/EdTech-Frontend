import { io, type Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

let socket: Socket | null = null;

export function connectSocket(ticket: string): Socket {
  socket?.disconnect();
  socket = io(WS_URL, {
    auth: { ticket },
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
