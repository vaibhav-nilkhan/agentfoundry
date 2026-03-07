import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
  UseGuards,
  Get,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import Stripe from 'stripe';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth('ApiKey')
  @ApiOperation({
    summary: 'Create Stripe checkout session',
    description: 'Create a Stripe checkout session for subscription payment',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
    schema: {
      example: {
        sessionId: 'cs_test_xxxxx',
        url: 'https://checkout.stripe.com/c/pay/cs_test_xxxxx',
      },
    },
  })
  async createCheckoutSession(
    @Request() req: any,
    @Body('tier') tier: string,
    @Body('successUrl') successUrl: string,
    @Body('cancelUrl') cancelUrl: string,
  ) {
    const userId = req.user.id;

    if (!tier) {
      throw new BadRequestException('Tier is required');
    }

    if (!successUrl || !cancelUrl) {
      throw new BadRequestException('Success and cancel URLs are required');
    }

    return this.stripeService.createCheckoutSession(
      userId,
      tier,
      successUrl,
      cancelUrl,
    );
  }

  @Get('portal-session')
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth('ApiKey')
  @ApiOperation({
    summary: 'Create Stripe customer portal session',
    description:
      'Create a Stripe customer portal session for managing subscriptions',
  })
  @ApiResponse({
    status: 200,
    description: 'Portal session created successfully',
    schema: {
      example: {
        url: 'https://billing.stripe.com/session/xxxxx',
      },
    },
  })
  async createPortalSession(
    @Request() req: any,
    @Query('returnUrl') returnUrl: string,
  ) {
    const userId = req.user.id;

    if (!returnUrl) {
      throw new BadRequestException('Return URL is required');
    }

    return this.stripeService.createPortalSession(userId, returnUrl);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Stripe webhook handler',
    description: 'Handle Stripe webhook events for subscription updates',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Webhook signature verification failed',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripeService.verifyWebhookSignature(
        req.rawBody,
        signature,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new BadRequestException('Webhook signature verification failed');
    }

    // Handle different event types
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.stripeService.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'customer.subscription.updated':
          await this.stripeService.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'customer.subscription.deleted':
          await this.stripeService.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'invoice.payment_succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          break;

        case 'invoice.payment_failed':
          console.log('Payment failed:', event.data.object.id);
          // TODO: Handle failed payment (send email, update subscription status, etc.)
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      console.error('Error processing webhook:', err);
      throw new BadRequestException('Error processing webhook');
    }
  }
}
