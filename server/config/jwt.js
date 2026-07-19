import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function jwtVerify(token){
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );
    return decoded;
}