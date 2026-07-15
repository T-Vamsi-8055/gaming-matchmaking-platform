import {Server } from "socket.io";
import { jwtVerify } from "../config/jwt.js";

export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });
    
    io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("No token"));
    }

    const decoded = jwtVerify(token);

    if (!decoded) {
        return next(new Error("Invalid token"));
    }

    socket.userId = decoded.id;
    next();
});
    io.on("connection",(socket)=>{
        console.log("Socket connected with userId",socket.userId)
        socket.on("disconnect",(reason)=>{
        console.log("Socket disconnected with userId",socket.userId,"Reason:",reason)
    })
    })
    
}