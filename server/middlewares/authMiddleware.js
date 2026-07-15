import { jwtVerify } from "../config/jwt";

export function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.sendStatus(401);

    const token = authHeader.split(" ")[1];

    try {
        

        req.user = jwtVerify(token);

        next();
    } catch {
        return res.sendStatus(403);
    }
}