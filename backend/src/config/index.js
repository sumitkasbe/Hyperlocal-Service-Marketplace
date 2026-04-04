export const config = {
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET,
  env: process.env.NODE_ENV || "development",
};
