import Branch  from "../../models/branch.js";
import {Customer ,DeliveryPartner} from "../../models/user.js";
import Order from "../../models/order.js";

export const createOrder = async (req, reply) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;

        // Fetch customer and branch data from the database
        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);

        // Check if customer and branch data exist
        if (!customerData) {
            return reply.status(404).send({ message: "Customer not found" });
        }
        if (!branchData) {
            return reply.status(404).send({ message: "Branch not found" });
        }

        // Debug output to verify customerData and branchData
        console.log("Customer Data:", customerData);
        console.log("Branch Data:", branchData);

        // Construct the new order
        const newOrder = new Order({
            customer: userId,
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation?.latitude || 0,
                longitude: customerData.liveLocation?.longitude || 0,
                address: customerData.address || "No address available"
            },
            pickupLocation: {
                latitude: branchData.location?.latitude || 0,
                longitude: branchData.location?.longitude || 0,
                address: branchData.address || "No address available"
            }
        });

        // Save the new order to the database
        const savedOrder = await newOrder.save();
        return reply.status(201).send(savedOrder);
    } catch (error) {
        return reply.status(500).send({ message: "Failed to create order", error });
    }
};


export const confirmOrder = async(req,reply) => {
    try {
        const {orderId} = req.params;
        const {userId} = req.user;
        const {deliveryPersonLocation} = req.body;

        const deliveryPerson = await DeliveryPartner.findById(userId)
        if(!deliveryPerson) {
            return reply.status(404).send({message: "Delivery person not found"})
        }
        const order = await Order.findByIdAndUpdate(orderId)
        if(!order) return reply.status(404).send({message: "Order not found"})
        
        if(order.status!=='available') {
            return reply.status(400).send({message: "Order not available"})
        }
        order.status = 'confirmed'

        order.deliveryPartner = userId;
        order.deliveryPersonLocation ={
            laitude: deliveryPersonLocation.latitude,
            longitude: deliveryPersonLocation.longitude,
            address: deliveryPersonLocation.address || ""
        }
        await order.save();

        return reply.send(order)
    } catch (error) {
        return reply.status(500).send({message:"Failed to confirm order",error})
    }
 };

export const updateOrderStatus = async(req,reply) => {
   try {
    const {orderId} = req.params
    const {status, deliveryPersonLocation} = req.body
    
    const {userId} = req.user;
    const deliveryPerson = await DeliveryPartner.findById(userId)
    if(!deliveryPerson) {
        return reply.status(404).send({message: "Delivery person not found"})
    }
    const order = await Order.findById(orderId);
    if(!order) return reply.status(404).send({message: "Order not found"});
        
    if(['cancelled','delivered'].includes(order.status)) {
            return reply.status(400).send({message: "Order cannot be updated"})
        }
         
    if(order.deliveryPartner.toString() !==userId) {
            return reply.status(403).send({message: "Unauthorized"})
        }
        order.status = status;

        order.deliveryPersonLocation = deliveryPersonLocation;
        
        await order.save();
           
        return reply.send(order);

   } catch (error) {
        return reply
        .status(500)
        .send({ message: "Failed to update order status", error });
   }
}

export const getOrders = async(req,reply) => {
    try {
        const { status, customerId,deliveryPartnerId,branchId} = req.query;
        let query = {}

        if(status) {
            query.status = status
        }
        if(customerId) {
            query.customer = customerId
        }
        if(deliveryPartnerId) {
            query.deliveryPartner = status
            query.branch= status
        }

        const orders = await Order.find(query).populate(
            "customer branch items.item deliveryPartner"
        )
        return reply.send(orders);

        
    } catch (error) {
        return reply
        .status(500)
        .send({ message: "Failed to retrieve orders", error });
    }
}

export const getOrdersById = async (req,reply) => {

    try {
        const { orderId} = req.params;
        
        const order = await Order.find(order).populate(
            "customer branch items.item deliveryPartner"
        );

        if(!order) {
            return reply.status(404).send({message: "Order not found"})
        }

        return reply.send(order);

        
    } catch (error) {
        return reply
        .status(500)
        .send({ message: "Failed to retrieve order", error });
    }
}