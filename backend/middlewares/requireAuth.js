import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

const readToken = (req) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7);
};

export const loadUserFromToken = async (token) => {
  const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);
  return UserModel.findById(userId).select("-password");
};

const requireAuth = async (req, res, next) => {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const user = await loadUserFromToken(token);
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired, please sign in again" });
  }
};

// Attaches req.user when a valid token is present but never rejects.
export const optionalAuth = async (req, _res, next) => {
  const token = readToken(req);
  if (token) {
    try {
      req.user = await loadUserFromToken(token);
    } catch {
      // ignore invalid tokens on public routes
    }
  }
  next();
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }
    next();
  };

export default requireAuth;
