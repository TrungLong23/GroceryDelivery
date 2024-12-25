import { getAllCategories } from "../controllers/product/category.js";
import { addProductReview, getProductReviews, getProductsByCategoryId, searchProducts } from "../controllers/product/product.js";

export const categoryRoutes = async(fastify,options) => {
    fastify.get("/categories", getAllCategories);
};
export const productRoutes = async(fastify,options) => {
    fastify.get("/products/:categoryId", getProductsByCategoryId);
    fastify.get("/products/search/:searchTerm", searchProducts);
    fastify.post("/product/:productId/review", addProductReview);
    fastify.get("/product/:productId/reviews", getProductReviews);
};
