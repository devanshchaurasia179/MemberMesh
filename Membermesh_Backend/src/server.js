import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import membershipRoutes from "./routes/auth.routes.js";
import MembershipPlan from "./routes/membershipPlan.routes.js";
import Subscriptions from "./routes/subscription.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const __dirname = path.resolve();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

  
  app.use(express.json());
  app.use(cookieParser());


//Membership
app.use("/api/membership/auth", membershipRoutes);
app.use("/api/membership/plans", MembershipPlan);
app.use("/api/membership/subscription", Subscriptions);




app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

connectDB();

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});