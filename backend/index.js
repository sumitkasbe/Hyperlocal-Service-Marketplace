import "dotenv/config";
import { config } from "./src/config/index.js";
import "./src/config/redis.js";
import app from "./src/app.js";
import pool from "./src/config/db.js";

/* FAIL FAST CHECK — PUT HERE */
if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is missing");
}

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL Connected");

    app.listen(config.port, function () {
      console.log("Server running on port " + config.port);
    });

  } catch (error) {
    console.error("DB connection failed", error);
    process.exit(1);
  }
}

startServer();





