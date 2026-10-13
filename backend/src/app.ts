import express from "express";
import cors from "cors";
import "dotenv/config";
import wishRoutes from "./routes/wishRoutes";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/wishes", wishRoutes);

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});
