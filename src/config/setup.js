import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as Models from '../models/index.js';
import { authenticate, COOKIE_PASSWORD, sessionStore } from './config.js';
import { dark, light, noSidebar } from '@adminjs/themes';
import { ComponentLoader } from 'adminjs';


AdminJS.registerAdapter(AdminJSMongoose);

const dashboardHandler = async () => {
    console.log("Fetching dashboard data...");  // Kiểm tra xem hàm có được gọi không
    return { message: 'Hello World' };  // Trả về dữ liệu cho dashboard
  };
  
  
const componentLoader = new ComponentLoader();
const Components = {
  Dashboard: componentLoader.add('Dashboard', './CustomDashboard'), // Register your custom dashboard
};

export const admin = new AdminJS({
  resources: [
    { resource: Models.Customer, options: { listProperties: ['phone', 'role', 'isActivated'], filterProperties: ['phone', 'role'] } },
    { resource: Models.DeliveryPartner, options: { listProperties: ['email', 'role', 'isActivated'], filterProperties: ['email', 'role'] } },
    { resource: Models.Admin, options: { listProperties: ['email', 'role', 'isActivated'], filterProperties: ['email', 'role'] } },
    { resource: Models.Branch },
    { resource: Models.Product },
    { resource: Models.Category },
    { resource: Models.Order },
    { resource: Models.Counter },
  ],
  branding: {
    companyName: 'GroceryDashBoard',
    withMadeWithLove: false,
    favicon: 'https://res.cloudinary.com/dje9nwbxk/image/upload/v1724237629/samples/logo.png',
    logo: 'https://res.cloudinary.com/dje9nwbxk/image/upload/v1724237629/samples/logo.png',
  },
  defaultTheme: light.id,
  availableThemes: [dark, light, noSidebar],
  rootPath: '/admin',
  dashboard: {
    component: Components.Dashboard, // Component dashboard tùy chỉnh
    handler: dashboardHandler,      // Đảm bảo rằng handler được cấu hình đúng
  },
});

export const buildAdminRouter = async (app) => {
  console.log('[BUILD ROUTER] Setting up AdminJS router...');
  
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: 'adminjs',
    },
    app,
    {
      store: sessionStore,
      saveUninitialized: false,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure cookie in production
        maxAge: 24 * 60 * 60 * 1000,
      },
    }
  );
  
  console.log('[BUILD ROUTER] AdminJS router setup complete.');
};
