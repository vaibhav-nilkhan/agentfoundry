import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      console.warn(
        'STRIPE_SECRET_KEY not configured - Stripe functionality will be disabled',
      );
      // Initialize with a dummy key for development
      this.stripe = new Stripe(stripeSecretKey || 'sk_test_dummy', {
        apiVersion: '2024-12-18.acacia',
      });
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-12-18.acacia',
      });
    }
  }

  /**
   * Get Stripe price IDs for tiers
   */
  private getPriceId(tier: string): string {
    const priceIds = {
      CREATOR:
        this.configService.get<string>('STRIPE_PRICE_CREATOR') ||
        'price_creator',
      PRO: this.configService.get<string>('STRIPE_PRICE_PRO') || 'price_pro',
      ENTERPRISE:
        this.configService.get<string>('STRIPE_PRICE_ENTERPRISE') ||
        'price_enterprise',
    };

    return priceIds[tier] || '';
  }

  /**
   * Create or retrieve Stripe customer for user
   */
  async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Return existing customer ID if available
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.displayName || undefined,
      metadata: {
        userId: user.id,
        firebaseUid: user.firebaseUid,
      },
    });

    // Store customer ID
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(userId: string, tier: string, successUrl: string, cancelUrl: string) {
    const customerId = await this.getOrCreateCustomer(userId);
    const priceId = this.getPriceId(tier);

    if (!priceId) {
      throw new BadRequestException(`Invalid tier: ${tier}`);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        tier,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create Stripe portal session for managing subscription
   */
  async createPortalSession(userId: string, returnUrl: string) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  /**
   * Handle successful subscription creation from webhook
   */
  async handleSubscriptionCreated(stripeSubscription: Stripe.Subscription) {
    const userId = stripeSubscription.metadata.userId;
    const tier = stripeSubscription.metadata.tier;

    if (!userId || !tier) {
      console.error('Missing metadata in subscription:', stripeSubscription.id);
      return;
    }

    // Get tier config
    const tierLimits = {
      CREATOR: null,
      PRO: null,
      ENTERPRISE: null,
    };

    const now = new Date();
    const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

    // Update or create subscription in database
    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        tier,
        status: 'ACTIVE',
        monthlyLimit: tierLimits[tier],
        usageCount: 0,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        stripeCurrentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        stripeCurrentPeriodEnd: periodEnd,
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        currentPeriodEnd: periodEnd,
        resetDate: periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      create: {
        userId,
        tier,
        status: 'ACTIVE',
        monthlyLimit: tierLimits[tier],
        usageCount: 0,
        resetDate: periodEnd,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        stripeCurrentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        stripeCurrentPeriodEnd: periodEnd,
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        currentPeriodEnd: periodEnd,
      },
    });
  }

  /**
   * Handle subscription updated from webhook
   */
  async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      console.error('Subscription not found:', stripeSubscription.id);
      return;
    }

    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: {
        status: stripeSubscription.status.toUpperCase() as any,
        stripeCurrentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        stripeCurrentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000,
        ),
        currentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000,
        ),
        resetDate: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });
  }

  /**
   * Handle subscription deleted/canceled from webhook
   */
  async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      console.error('Subscription not found:', stripeSubscription.id);
      return;
    }

    // Downgrade to FREE tier
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: {
        tier: 'FREE',
        status: 'CANCELED',
        monthlyLimit: 100,
        usageCount: 0,
        canceledAt: new Date(),
        stripeSubscriptionId: null,
        stripePriceId: null,
      },
    });
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }
  }

  /**
   * Cancel subscription in Stripe
   */
  async cancelSubscription(stripeSubscriptionId: string) {
    return this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  /**
   * Update subscription in Stripe (for tier changes)
   */
  async updateSubscription(
    stripeSubscriptionId: string,
    newPriceId: string,
  ) {
    const subscription = await this.stripe.subscriptions.retrieve(
      stripeSubscriptionId,
    );

    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }
}
