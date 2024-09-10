import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

async function createTestCharge() {
  try {
    // Simulating a large but smaller amount for testing purposes
    const amountInCents = 1000000; // 1,000,000 cents ($10,000)
    console.log('Amount in USD cents:', amountInCents);

    const charge = await stripe.charges.create({
      amount: amountInCents, // Test with a lower amount
      currency: 'usd',
      source: 'tok_visa', // A test token
      description: 'Simulate large Stripe test charge',
    });

    return charge;
  } catch (error) {
    console.error('Error creating test charge:', error);
    throw error;
  }
}


export { createTestCharge };
