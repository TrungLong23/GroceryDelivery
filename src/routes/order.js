
import { confirmOrder, createOrder, getOrders, getOrdersById, updateOrderStatus } from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fasitfy,options)=> {
   
    fasitfy.addHook("preHandler",async(request,reply)=>{
        const isAuthenticated = await verifyToken(request,reply)
        if (!isAuthenticated) {
            return reply.code(401).send({message:"Unauthenticated"})
        }
            
        })
    
        fasitfy.post('/order',createOrder)
        fasitfy.get('/order',getOrders)
        fasitfy.patch('/order/:orderId/status',updateOrderStatus)
        fasitfy.post('/order/:orderId/confirm',confirmOrder)
        fasitfy.post('/order/:orderId',getOrdersById)
}