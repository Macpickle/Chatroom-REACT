import socketIOClient from "socket.io-client";

export const socket = socketIOClient('ws://localhost:3000');
