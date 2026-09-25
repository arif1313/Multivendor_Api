import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";

let server: Server;

const main = async () => {
  try {
    await mongoose.connect(config.databaseUrl);
     
    console.log("Database connected");

    server = app.listen(config.port, () => {
       
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
     
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

main();

const shutdown = () => {
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
};

process.on("unhandledRejection", shutdown);
process.on("uncaughtException", shutdown);
