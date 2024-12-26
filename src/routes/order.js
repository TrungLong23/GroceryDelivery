import { confirmOrder, createOrder, getOrders, getOrdersById, updateOrderStatus } from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fastify, options) => {
    // Thêm hook để kiểm tra xác thực trước mỗi request
    fastify.addHook("preHandler", async (request, reply) => {
        const isAuthenticated = await verifyToken(request, reply);
        if (!isAuthenticated) {
            return reply.code(401).send({ message: "Unauthenticated" });
        }
    });
    // Định nghĩa các route
    fastify.post('/order', createOrder);
    fastify.get('/order', getOrders);
    fastify.patch('/order/:orderId/status', updateOrderStatus);
    fastify.post('/order/:orderId/confirm', confirmOrder);
    fastify.get('/order/:orderId', getOrdersById);

};
