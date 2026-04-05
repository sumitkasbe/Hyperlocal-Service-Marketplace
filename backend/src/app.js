import express from "express";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import providerRoutes from "./routes/provider.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import serviceRoutes from "./routes/services.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import paymentRoutes from "./routes/payment.routes.js";
import serviceCategoriesRoutes from "./routes/service-categories.routes.js";
import providerServicesRoutes from "./routes/provider-services.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "https://repair-walla.vercel.app",
      "http://localhost:5173",
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("CORS blocked:", origin);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("Backend is running"));

console.log("User routes loaded");
app.use("/api/user", userRoutes);

console.log("Auth routes loaded");
app.use("/api/auth", authRoutes);

app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/service-categories", serviceCategoriesRoutes);
app.use("/api/provider-services", providerServicesRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(errorHandler);

export default app;