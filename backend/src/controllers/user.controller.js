import pool from "../config/db.js";
import redis from "../config/redis.js";

export async function getUsers(req, res, next) {
  try {
    const cachedUsers = await redis.get("users");

    if (cachedUsers) {
      return res.json({
        success: true,
        source: "redis",
        users: JSON.parse(cachedUsers),
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users",
    );

    await redis.set("users", JSON.stringify(result.rows), "EX", 60);

    res.json({
      success: true,
      source: "database",
      users: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
    );

    await redis.del("users");

    res.status(201).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}
