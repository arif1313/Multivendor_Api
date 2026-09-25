import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/multivendor",
  nodeEnv: process.env.NODE_ENV || "development",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "access_secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  defaultDeliveryCharge: Number(process.env.DEFAULT_DELIVERY_CHARGE || 60),
  admin: {
    name: process.env.ADMIN_NAME || "Super Admin",
    email: process.env.ADMIN_EMAIL || "admin@shop.com",
    password: process.env.ADMIN_PASSWORD || "admin1234",
  },
};
