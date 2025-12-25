import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || "default_secret_change_in_production",
    expiry: process.env.JWT_EXPIRY || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
};
