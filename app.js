import Fastify from "fastify";
import "dotenv/config";
import { connectDB } from './src/config/connect.js';
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { PORT } from "./src/config/config.js"; // Sử dụng giá trị từ config.js
import { registerRoutes } from "./src/routes/index.js";

const start = async () => {
  try {
    // Kết nối với cơ sở dữ liệu
    await connectDB(process.env.MONGO_URI);

    const app = Fastify();

    await registerRoutes(app);

    // Xây dựng router admin
    await buildAdminRouter(app);

    // Khởi động máy chủ
    app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
      if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
      } else {
        console.log(`GroceryStore Started on http://localhost:${PORT}${admin.options.rootPath}`);
      }
    });
  } catch (error) {
    console.error("Error during startup:", error);
    process.exit(1);
  }
};

start();
