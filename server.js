import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import auth from "./routes/auth.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT;

app.use(express.json());
app.use("/api/auth", auth);

connectDB();

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});