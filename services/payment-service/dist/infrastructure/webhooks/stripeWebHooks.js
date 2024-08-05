"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle successful payment
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
            // Update your database, fulfill the purchase, etc.
            break;
        case 'payment_intent.payment_failed':
            const failedPaymentIntent = event.data.object;
            console.log(`PaymentIntent for ${failedPaymentIntent.amount} failed.`);
            // Notify the customer that their payment failed
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
};
exports.handleStripeWebhook = handleStripeWebhook;
