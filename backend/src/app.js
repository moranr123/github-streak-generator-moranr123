import express from "express";
import cors from "cors";
import streakRoutes from "./routes/streakRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/streak", streakRoutes);

export default app;
