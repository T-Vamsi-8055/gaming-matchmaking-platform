import { jwtVerify } from "../config/jwt.js";

export function verifyJWT(req, res, next) {
    const cookieToken = req.cookies.token;

    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = cookieToken || headerToken;

    if (!token) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    try {
        req.user = jwtVerify(token);
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}