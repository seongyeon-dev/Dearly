import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import "dotenv/config";

import wishRoutes from "./routes/wishRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import wishImageRoutes from "./routes/wishImageRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET 환경변수를 설정해주세요.");
}

const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
});

app.use(
  cors({
    origin: "http://localhost:5173",
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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

app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});
