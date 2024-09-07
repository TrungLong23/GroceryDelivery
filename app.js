import Fastify from "fastify";
import "dotenv/config";
import { connectDB } from './src/config/connect.js';
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { PORT } from "./src/config/config.js"; // Sử dụng giá trị từ config.js
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

const start = async () => {
  try {
    // Kết nối với cơ sở dữ liệu
    await connectDB(process.env.MONGO_URI);

    const app = Fastify();

    app.register(fastifySocketIO, {
      cors: {
        origin: "*"
      },
      pingInterval: 10000,
      pingTimeout: 5000,
      transports: ['websocket'],
    });

    await registerRoutes(app);

    // Xây dựng router admin
    await buildAdminRouter(app);

    // Khởi động máy chủ
    app.listen({ port: PORT }, (err, addr) => {
      if (err) {
        console.error("Lỗi khi khởi động máy chủ:", err);
        process.exit(1);
      } else {
        console.log(`GroceryStore đã khởi động tại http://localhost:${PORT}${admin.options.rootPath}`);
      }
    });

    // Chờ cho đến khi máy chủ được khởi tạo hoàn chỉnh
    await app.ready();

    // Cài đặt Socket.IO
    app.io.on("connection", (socket) => {
      console.log("Có người dùng kết nối");

      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`Người dùng đã tham gia phòng ${orderId}`);
      });

      socket.on('disconnect', () => {
        console.log("Người dùng đã ngắt kết nối");
      });
    });

  } catch (error) {
    console.error("Lỗi trong quá trình khởi động:", error);
    process.exit(1);
  }
};

start();
