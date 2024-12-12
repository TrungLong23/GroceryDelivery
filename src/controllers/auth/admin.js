import { Admin } from "../../models/index.js"; // Import model Admin
import bcrypt from "bcrypt";

export const createAdmin = async (request, reply) => {
    try {
        const { email, password } = request.body;

        // Kiểm tra đầu vào
        if (!email || !password) {
            return reply.status(400).send({ message: "Email and password are required." });
        }

        // Kiểm tra email có tồn tại không
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return reply.status(409).send({ message: "Admin email already exists." });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo tài khoản admin
        const newAdmin = new Admin({
            email,
            password: hashedPassword,
            role: "Admin",
        });

        await newAdmin.save();

        reply.status(201).send({
            message: "Admin account created successfully.",
            admin: { email, role: newAdmin.role },
        });
    } catch (error) {
        console.error("[CREATE ADMIN ERROR]", error);
        reply.status(500).send({ message: "Internal server error." });
    }
};
