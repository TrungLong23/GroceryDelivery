import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"; // Import bcrypt để so sánh mật khẩu

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
    return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply) => {
    try {
        const { phone, password } = req.body;

        // Kiểm tra xem khách hàng đã tồn tại chưa
        const customer = await Customer.findOne({ phone }).select("+password");
        if (!customer) {
            return reply.status(404).send({ message: "Phone number not registered" });
        }

        // Kiểm tra mật khẩu
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return reply.status(400).send({ message: "Invalid credentials" });
        }

        // Tạo token cho khách hàng đã tồn tại
        const { accessToken, refreshToken } = generateTokens(customer);

        return reply.send({
            message: "Login Successful",
            accessToken,
            refreshToken,
            customer,
        });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
};

export const loginDeliveryPartner = async (req, reply) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra xem đối tác đã tồn tại chưa
        const deliveryPartner = await DeliveryPartner.findOne({ email });
        if (!deliveryPartner) {
            return reply.status(404).send({ message: "Email not registered" });
        }

        // So sánh mật khẩu đã mã hóa
        const isMatch = await bcrypt.compare(password, deliveryPartner.password);
        if (!isMatch) {
            return reply.status(400).send({ message: "Invalid credentials" });
        }

        // Tạo token cho đối tác đã tồn tại
        const { accessToken, refreshToken } = generateTokens(deliveryPartner);

        return reply.send({
            message: "Login Successful",
            accessToken,
            refreshToken,
            deliveryPartner,
        });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
};


export const refreshToken = async (req, reply) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return reply.status(401).send({ message: "Refresh token required" });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        let user;
        if (decoded.role === "Customer") {
            user = await Customer.findById(decoded.userId);
        } else if (decoded.role === "DeliveryPartner") {
            user = await DeliveryPartner.findById(decoded.userId);
        } else {
            return reply.status(403).send({ message: "Invalid role" });
        }

        if (!user) {
            return reply.status(403).send({ message: "Invalid refresh token" });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
        return reply.send({
            message: "Token Refreshed",
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        return reply.status(403).send({ message: "Invalid refresh token" });
    }
};

export const fetchUser = async (req, reply) => {
    try {
        const { userId, role } = req.user;
        let user;

        if (role === "Customer") {
            user = await Customer.findById(userId);
        } else if (role === "DeliveryPartner") {
            user = await DeliveryPartner.findById(userId);
        } else {
            return reply.status(403).send({ message: "Invalid role" });
        }

        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }
        return reply.send({
            message: "User fetched successfully",
            user,
        });

    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
};

export const registerCustomer = async (req, reply) => {
    try {
        const { phone, name, address, password } = req.body;

        // Kiểm tra xem số điện thoại đã tồn tại chưa
        let existingCustomer = await Customer.findOne({ phone });
        if (existingCustomer) {
            return reply
                .status(400)
                .send({ message: "Phone number already registered" });
        }

        // Tạo khách hàng mới
        const customer = new Customer({
            phone,
            name,
            address,
            password, // Truyền password vào schema (middleware sẽ tự mã hóa)
            role: "Customer",
            isActivated: true,
        });
        await customer.save();

        const { accessToken, refreshToken } = generateTokens(customer);

        return reply.send({
            message: "Customer registered successfully",
            accessToken,
            refreshToken,
            customer,
        });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
};


// Đăng ký đối tác giao hàng
export const registerDeliveryPartner = async (req, reply) => {
    try {
        const { email, password, phone, name, branch } = req.body;

        // Kiểm tra email đã tồn tại chưa
        let existingPartner = await DeliveryPartner.findOne({ email });
        if (existingPartner) {
            return reply
                .status(400)
                .send({ message: "Email already registered" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo đối tác mới
        const deliveryPartner = new DeliveryPartner({
            email,
            password: hashedPassword,
            phone,
            name,
            branch,
            role: "DeliveryPartner",
        });
        await deliveryPartner.save();

        const { accessToken, refreshToken } = generateTokens(deliveryPartner);

        return reply.send({
            message: "Delivery Partner registered successfully",
            accessToken,
            refreshToken,
            deliveryPartner,
        });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
};
