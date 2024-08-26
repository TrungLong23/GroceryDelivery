import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },  // Chỉ giữ kiểu String
    discountPrice: { type: Number, required: true },
    quantity: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
