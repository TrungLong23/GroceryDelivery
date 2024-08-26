// src/routes/index.js
import { authRoutes } from "./auth.js"; // Đảm bảo có đuôi .js
import { productRoutes ,categoryRoutes} from "./product.js";
const prefix = '/api';

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix });
    fastify.register(productRoutes, { prefix });
    fastify.register(categoryRoutes, { prefix });
};
