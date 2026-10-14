import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import "dotenv/config";

import pool from "./config/db";

import wishRoutes from "./routes/wishRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import wishImageRoutes from "./routes/wishImageRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.set("trust proxy", 1);

const isProduction = process.env.NODE_ENV === "production";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET 환경변수를 설정해주세요.");
}

const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
  },
  pool as unknown as ConstructorParameters<typeof MySQLStore>[1],
);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: "dearly.sid",
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/wishes", wishImageRoutes);
app.use("/api/wishes", wishRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/budgets", budgetRoutes);

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});
