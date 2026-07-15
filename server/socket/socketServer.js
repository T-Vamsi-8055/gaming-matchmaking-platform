import {Server } from "socket.io";
export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });
    
    io.use((socket,next)=>{
        const token=socket.handshake.auth.token;
        
    })
    io.on("connection",(socket)=>{
        
    })
}