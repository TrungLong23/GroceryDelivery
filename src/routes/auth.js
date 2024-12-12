// src/routes/auth.js
import { createAdmin } from "../controllers/auth/admin.js";
import { fetchUser, loginCustomer, loginDeliveryPartner, refreshToken, registerCustomer, registerDeliveryPartner} from "../controllers/auth/auth.js";
import {updateUser }  from "../controllers/tracking/user.js";
import { verifyToken } from "../middleware/auth.js";

export const authRoutes = async (fastify, options) => {
    fastify.post("/customer/register", registerCustomer);
    fastify.post("/delivery/register", registerDeliveryPartner);
    fastify.post("/customer/login", loginCustomer); // Đảm bảo đường dẫn bắt đầu bằng /
    fastify.post("/delivery/login", loginDeliveryPartner);
    fastify.post("/refresh-token", refreshToken);
    fastify.get("/user", { preHandler: [verifyToken] }, fetchUser); 
    fastify.patch("/user", { preHandler: [verifyToken] }, updateUser); 
    fastify.post("/admin/register", createAdmin);

};
