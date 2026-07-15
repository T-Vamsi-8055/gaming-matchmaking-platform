import {Server } from "socket.io";
export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    // middleware
    // connection events
}