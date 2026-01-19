/**
 * Stripe Webhook Handler - Netlify Function
 * Handles subscription events from Stripe
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Import stripe dynamically to handle missing dependency gracefully
let stripe = null;
try {
  const Stripe = require('stripe');
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
} catch (err) {
  console.warn('Stripe module not available');
}

/**
 * Map Stripe price ID to subscription tier
 */
function priceIdToTier(priceId) {
  const mapping = {
    [process.env.STRIPE_PRICE_STARTER]: 'STARTER',
    [process.env.STRIPE_PRICE_PROFESSIONAL]: 'PROFESSIONAL',
    [process.env.STRIPE_PRICE_ENTERPRISE]: 'ENTERPRISE',
  };
  return mapping[priceId] || 'FREE';
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Get subscription details
  let subscription = null;
  if (subscriptionId && stripe) {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  }

  // Update or create company subscription
  await prisma.companySubscription.upsert({
    where: { userId },
    create: {
      userId,
      tier: tier || 'STARTER',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: subscription?.current_period_start 
        ? new Date(subscription.current_period_start * 1000) 
        : new Date(),
      currentPeriodEnd: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
    update: {
      tier: tier || 'STARTER',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: subscription?.current_period_start 
        ? new Date(subscription.current_period_start * 1000) 
        : undefined,
      currentPeriodEnd: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Checkout completed for user ${userId}, tier: ${tier}`);
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice) {
  const customerId = invoice.customer;
  
  // Find user by Stripe customer ID
  const subscription = await prisma.companySubscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Create invoice record
  await prisma.invoice.create({
    data: {
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      invoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      paidAt: new Date(),
    },
  });

  // Update subscription period
  if (invoice.subscription && stripe) {
    const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await prisma.companySubscription.update({
      where: { userId: subscription.userId },
      data: {
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });
  }

  console.log(`Invoice paid for user ${subscription.userId}`);
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice) {
  const customerId = invoice.customer;
  
  const subscription = await prisma.companySubscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Create failed invoice record
  await prisma.invoice.create({
    data: {
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'uncollectible',
      invoiceUrl: invoice.hosted_invoice_url,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
    },
  });

  // Send email notification about failed payment
  try {
    const user = await prisma.user.findUnique({
      where: { id: subscription.userId },
      select: { email: true }
    });

    if (user?.email) {
      const { sendMail } = require('./helpers');
      const amountFormatted = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: invoice.currency?.toUpperCase() || 'AUD'
      }).format((invoice.amount_due || 0) / 100);

      await sendMail({
        to: user.email,
        subject: 'Payment Failed - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C41E3A;">Payment Failed</h2>
            <p>We were unable to process your subscription payment of <strong>${amountFormatted}</strong>.</p>
            <p>To avoid service interruption, please update your payment method:</p>
            <p style="margin: 24px 0;">
              <a href="${invoice.hosted_invoice_url || 'https://ngurrapathways.com.au/company/billing'}" 
                 style="background: #6B4C9A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Update Payment Method
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              If you have questions, please contact our support team.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #999; font-size: 12px;">
              Ngurra Pathways - Supporting First Nations Futures
            </p>
          </div>
        `,
        text: `Payment Failed\n\nWe were unable to process your subscription payment of ${amountFormatted}.\n\nPlease update your payment method at: ${invoice.hosted_invoice_url || 'https://ngurrapathways.com.au/company/billing'}\n\nNgurra Pathways`
      });
      console.log(`Payment failed email sent to ${user.email}`);
    }
  } catch (emailErr) {
    console.error('Failed to send payment failed email:', emailErr.message);
  }

  console.log(`Invoice payment failed for user ${subscription.userId}`);
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  
  const dbSubscription = await prisma.companySubscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Determine tier from price
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const tier = priceIdToTier(priceId);

  await prisma.companySubscription.update({
    where: { userId: dbSubscription.userId },
    data: {
      tier,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription updated for user ${dbSubscription.userId}, tier: ${tier}`);
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  
  const dbSubscription = await prisma.companySubscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Downgrade to free tier
  await prisma.companySubscription.update({
    where: { userId: dbSubscription.userId },
    data: {
      tier: 'FREE',
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Subscription deleted for user ${dbSubscription.userId}, downgraded to FREE`);
}

/**
 * Main webhook handler
 */
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  if (!stripe) {
    return { statusCode: 500, body: 'Stripe not configured' };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { statusCode: 500, body: 'Webhook secret not configured' };
  }

  const signature = event.headers['stripe-signature'];
  if (!signature) {
    return { statusCode: 400, body: 'Missing stripe-signature header' };
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(stripeEvent.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Error processing webhook:', err);
    return { statusCode: 500, body: 'Webhook processing failed' };
  } finally {
    await prisma.$disconnect();
  }
};
