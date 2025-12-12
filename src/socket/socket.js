
// src/socket.js
import { io } from "socket.io-client";

// Prefer explicit socket URL from env. If not provided, connect to same origin
// by calling io() without a URL (useful when backend serves socket from same host).
const SOCKET_URL = process.env.REACT_APP_BASEURL;

const socketOptions = {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  withCredentials: true,
};

const socket = SOCKET_URL ? io(SOCKET_URL, socketOptions) : io(socketOptions);

export default socket;
