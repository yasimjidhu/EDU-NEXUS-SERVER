import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
// Initialize Stripe with your test secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20', // Use the current API version
});


async function createTestCharge(amountInRupees: number) {
    try {
      // Convert amount from INR to cents (Stripe uses the smallest currency unit, i.e., cents)
      const amountInCents = amountInRupees * 100;
  
      // Create a PaymentIntent with automatic payment methods configuration
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'inr',
        description: `Test charge for ₹${amountInRupees}`,
        payment_method: 'pm_card_visa', // Use a test card token
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never', // Disable redirects for automatic payment methods
        },
      });
  
      console.log('Test charge created successfully:', paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating test charge:', error);
      throw error;
    }
  }
  
export {createTestCharge}