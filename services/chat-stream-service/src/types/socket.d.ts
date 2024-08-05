import { Socket as DefaultSocket } from 'socket.io';

interface CustomSocket extends DefaultSocket {
  decoded?: any;
}

declare module 'socket.io' {
  export interface Socket extends CustomSocket {}
}
