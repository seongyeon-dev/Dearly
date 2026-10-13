import express from "express";
import cors from "cors";
import "dotenv/config";

import wishRoutes from "./routes/wishRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/wishes", wishRoutes);
app.use("/api/purchases", purchaseRoutes);

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});
