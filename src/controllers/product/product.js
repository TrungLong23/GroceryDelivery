import Product from "../../models/products.js";
import { Customer } from "../../models/user.js";
import mongoose from "mongoose";

export const getProductsByCategoryId = async (req, reply) => {
    const { categoryId } = req.params;

    try {
        const products = await Product.find({ category: categoryId })
            .select("-category")
            .exec();
        return reply.send(products);

    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
};

export const searchProducts = async (req, reply) => {
    const { searchTerm } = req.params;
    try {
        const products = await Product.find({
            name: { $regex: searchTerm, $options: 'i' } // Tìm kiếm không phân biệt chữ hoa chữ thường
        });
        return reply.send(products);
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred while searching products", error });
    }
};


export const addProductReview = async (req, reply) => {
    const { rating, review, userId } = req.body;
    const { productId } = req.params; // Get productId from the URL

    try {
        console.log("Product ID:", productId);

        // Validate userId and productId format
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return reply.status(400).send({ message: "Invalid userId or productId format" });
        }

        // Fetch user
        const user = await Customer.findById(userId); // Mongoose automatically handles ObjectId conversion
        if (!user) {
            return reply.status(404).send({ message: "Customer not found" });
        }

        // Fetch product
        const product = await Product.findById(productId); // Mongoose automatically handles ObjectId conversion
        if (!product) {
            return reply.status(404).send({ message: "Product not found" });
        }

        console.log("Product found:", product.name);

        // Add the review
        product.reviews.push({
            rating,
            review,
            user: userId,
        });

        // Recalculate average rating
        const totalRatings = product.reviews.length;
        const totalStars = product.reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = (totalStars / totalRatings).toFixed(1);

        product.rating = averageRating;

        await product.save();

        return reply.status(200).send({ message: "Review added successfully", product });
    } catch (err) {
        console.error("Error adding review:", err);
        return reply.status(500).send({ message: "Internal server error", error: err.message });
    }
};

export const getProductReviews = async (req, reply) => {
    const { productId } = req.params;

    try {
        // Tìm sản phẩm theo productId và populate thông tin user (Customer)
        const product = await Product.findById(productId).populate('reviews.user', 'name');
        
        if (!product) {
            return reply.status(404).send({ message: "Product not found" });
        }

        // Trả về danh sách đánh giá cùng với rating của sản phẩm
        return reply.status(200).send({ reviews: product.reviews, rating: product.rating });
    } catch (err) {
        return reply.status(500).send({ message: err.message });
    }
};
