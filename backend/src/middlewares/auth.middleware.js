import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
