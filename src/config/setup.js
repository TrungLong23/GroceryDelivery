import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as Models from '../models/index.js';
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import {dark,light,noSidebar}  from '@adminjs/themes'
AdminJS.registerAdapter(AdminJSMongoose);

export const admin = new AdminJS({
    resources: [
        {
            resource: Models.Customer,
            options: {
                listProperties: ["phone", "role", "isActivated"],
                filterProperties: ["phone", "role"],
            },
        },
        {
            resource: Models.DeliveryPartner,
            options: {
                listProperties: ["email", "role", "isActivated"],
                filterProperties: ["email", "role"],
            },
        },
        {
            resource: Models.Admin,
            options: {
                listProperties: ["email", "role", "isActivated"],
                filterProperties: ["email", "role"],
            },
        },
        {  resource: Models.Branch},
        {  resource: Models.Product},
        {  resource: Models.Category},
        {  resource: Models.Order},
        {  resource: Models.Counter},
    ],
    branding: {
        companyName: "GroceryDashBoard",
        withMadeWithLove: false,
        favicon: 
        "https://res.cloudinary.com/dje9nwbxk/image/upload/v1724237629/samples/logo.png",
        logo: "https://res.cloudinary.com/dje9nwbxk/image/upload/v1724237629/samples/logo.png"

    },
    defaultTheme: dark.id,
    availableThemes: [dark,light,noSidebar],
    rootPath: "/admin",
});

export const buildAdminRouter = async (app) => {
    await AdminJSFastify.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD, // Sửa lỗi chính tả ở đây
            cookieName: "adminjs",
        },
        app,
        {
            store: sessionStore,
            saveUninitialized: true, // Sửa lỗi chính tả ở đây (saveUnintialized -> saveUninitialized)
            secret: COOKIE_PASSWORD, // Dùng secret hoặc cookiePassword nhưng không cả hai
            cookie: {
                httpOnly: process.env.NODE_ENV === "production",
                secure: process.env.NODE_ENV === "production",
            }
        }
    );
};
