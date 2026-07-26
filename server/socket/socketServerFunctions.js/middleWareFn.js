import { jwtVerify } from "../config/jwt.js";


export function middleWareFn(socket,next){
    
        try {
          const token = socket.handshake.auth?.token;
    
          if (!token) {
            return next(new Error("No token"));
          }
    
          const decoded = jwtVerify(token);
    
          if (!decoded) {
            return next(new Error("Invalid token"));
          }
    
          socket.userId = decoded.id;
    
          next();
        } catch (error) {
          console.error("Socket authentication error:", error);
    
          next(new Error("Socket authentication failed"));
        }
      }
