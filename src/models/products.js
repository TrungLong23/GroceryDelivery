import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    quantity: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 0 }, // Sửa thành Number
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    reviews: [
        {
            rating: { type: Number, required: true },
            review: { type: String },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
});

const Product = mongoose.model('Product', productSchema);

export default Product;
