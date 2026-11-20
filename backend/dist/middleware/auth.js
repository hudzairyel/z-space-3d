import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization header" });
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;
        req.userEmail = payload.email;
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
export function generateToken(userId, email) {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "7d" });
}
