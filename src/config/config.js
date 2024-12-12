import 'dotenv/config';
import fastifySession from '@fastify/session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import { Admin } from '../models/index.js';

const MongoDBStore = ConnectMongoDBSession(fastifySession);

export const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'session',
    ssl: true, // Kích hoạt kết nối SSL
    sslValidate: true, // Kiểm tra chứng chỉ SSL
});

sessionStore.on("error", (error) => {
    console.log("Session store error", error);
});

export const authenticate = async (email, password) => {
    console.log(`[AUTHENTICATE] Attempting login with email: ${email}`);

    if (email && password) {
        const user = await Admin.findOne({ email });
        if (!user) {
            console.log(`[AUTHENTICATE] User not found: ${email}`);
            return null;
        }
        console.log(`[AUTHENTICATE] Found user: ${email}`);

        // Kiểm tra mật khẩu (giả sử dùng bcrypt)
        const bcrypt = (await import("bcrypt")).default;
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            console.log(`[AUTHENTICATE] Authentication successful for: ${email}`);
            return Promise.resolve({ email });
        } else {
            console.log(`[AUTHENTICATE] Invalid password for: ${email}`);
            return null;
        }
    }
    console.log(`[AUTHENTICATE] Missing email or password.`);
    return null;
};


export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;
