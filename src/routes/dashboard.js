export const buildApiRoutes = (app) => {
    // Tạo route trả về dữ liệu cho dashboard
    app.get('/api/dashboard', async (request, reply) => {
      try {
        const customerCount = await Models.Customer.countDocuments();
        const orderCount = await Models.Order.countDocuments();
        const productCount = await Models.Product.countDocuments();
  
        return { customerCount, orderCount, productCount };
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        reply.status(500).send({ error: 'Error fetching dashboard data' });
      }
    });
  };
  