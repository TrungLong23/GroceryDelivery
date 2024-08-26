import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./src/models/index.js";
import { categories, products } from "./seedData.js";  // Đảm bảo 'products' được import

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);


        await Product.deleteMany({});
        await Category.deleteMany({});

        const categoryDocs = await Category.insertMany(categories);

        const categoryMap = categoryDocs.reduce((map, category) => {
            map[category.name] = category._id;
            return map;
        }, {});

        const productWithCategoryIds = products.map((product) => ({
            ...product,
            category: categoryMap[product.category]
        }));

        await Product.insertMany(productWithCategoryIds);
        console.log("Cơ sở dữ liệu đã được khởi tạo thành công!");

    } catch (error) {
        console.error("Lỗi khi khởi tạo cơ sở dữ liệu: ", error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();  // Đảm bảo hàm được gọi
