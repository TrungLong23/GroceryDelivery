// controllers/paymentController.js
import paypal from 'paypal-rest-sdk';


// PayPal configuration
paypal.configure({
    mode: 'sandbox', // or 'live' for production
    client_id: 'AeH9IkYn9dXnw0uNlMxUuQhAtc2PvKrMMyO8L_lESAQIQmlfSTE4pFsZgAmBsnyJ5_BGXQT0eV7ExE8C',
    client_secret: 'ELI5TjC7SedWwGPam186nfv8C6EzqEarzwzZZ75cey6A-3AAX36hL7mgxalXixj7CfBSGwYHeotqP0-w',
  }); 

  export const createPayment = async (req, reply) => {
    const { totalPrice } = req.body;
  
    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'yourapp://payment-success',  // Adjust this to your app's success URL
        cancel_url: 'yourapp://payment-cancel',  // Adjust this to your app's cancel URL
      },
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: totalPrice,
          },
          description: 'Grocery Delivery',
        },
      ],
    };
  
    try {
      const payment = await new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, (error, payment) => {
          if (error) {
            reject(error);
          } else {
            resolve(payment);
          }
        });
      });
  
      // Find the approval URL from the payment links
      const approvalLink = payment.links.find(link => link.rel === 'approval_url');
      if (approvalLink) {
        reply.send({ id: payment.id, approval_url: approvalLink.href });
      } else {
        reply.status(500).send({ message: "Approval URL not found" });
      }
    } catch (error) {
      console.error(error);
      reply.status(500).send(error);  // Send error response
    }
  };
  
  // Execute payment route
  export const executePayment = async (req, reply) => {
    const { paymentId, payerId } = req.body;
  
    const execute_payment_json = {
      payer_id: payerId,
    };
  
    try {
      const payment = await new Promise((resolve, reject) => {
        paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
          if (error) {
            reject(error.response);
          } else {
            resolve(payment);
          }
        });
      });
  
      reply.send(payment);  // Return the payment details after execution
    } catch (error) {
      console.error(error);
      reply.status(500).send(error);  // Send error response
    }
  };