import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
    autoConnect: false
});

export const ensureSocketConnected = () => {
    const token = localStorage.getItem("jwt-auth-token");
    if (token && !socket.connected) {
        socket.auth = { token };
        socket.connect();
    }
    return socket;
};