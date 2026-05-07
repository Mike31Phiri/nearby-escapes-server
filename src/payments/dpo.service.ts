import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentStatus } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class DpoService {
  private readonly logger = new Logger(DpoService.name);
  private dpoBaseUrl: string;
  private serviceCode: string;
  private returnUrl: string;
  private securityHash: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {
    this.dpoBaseUrl = config.get<string>('DPO_BASE_URL') ?? 'https://secure.3gdirectpay.com';
    this.serviceCode = config.get<string>('DPO_SERVICE_CODE') ?? '';
    this.returnUrl = config.get<string>('DPO_RETURN_URL') ?? '';
    this.securityHash = config.get<string>('DPO_SECURITY_HASH') ?? '';
  }

  /**
   * Initiates a payment request with DPO and returns the checkout URL
   */
  async initiatePayment(
    amount: number,
    userId: string,
    bookingId: string,
    currency: string = 'ZMW', // Using ZMW as it's common in Zambia
  ): Promise<{ transactionId: string; checkoutUrl: string }> {
    // Get user details for the payment
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Get booking details
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized: User does not own this booking');
    }

    // Generate the transaction reference
    const transactionReference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate amounts
    const commissionAmount = amount * 0.1; // Assuming 10% commission
    const hostAmount = amount - commissionAmount;

    // Create payment record in our database with PENDING status
    await this.prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount: new Number(amount).toString() as any,
        commissionAmount: new Number(commissionAmount).toString() as any,
        hostAmount: new Number(hostAmount).toString() as any,
        provider: 'dpo',
        providerRef: transactionReference,
        status: PaymentStatus.PENDING,
      },
    });

    // Format the amount with 2 decimal places as required by many payment gateways
    const formattedAmount = amount.toFixed(2);

    // For the DPO URL format like: https://secure.3gdirectpay.com/?ID={serviceCode}
    // Or: https://secure.3gdirectpay.com/pay.asp?ID={serviceCode}
    const checkoutUrl = `${this.dpoBaseUrl}/pay.asp?ID=${this.serviceCode}`;

    // Store transaction details in a temporary session or cache to reference after payment
    // This assumes you have a way to link the transaction back after the user returns from DPO
    // In a real implementation, this might involve storing in Redis or a temp DB table
    const paymentSession = {
      transactionId: transactionReference,
      userId,
      bookingId,
      amount: formattedAmount,
      currency,
      timestamp: Date.now(),
    };

    // This is a simplified approach - in production, you'd likely store this in Redis or a temporary table
    // For now, we'll just return the checkout URL with transaction info that can be used by the webhook
    return {
      transactionId: transactionReference,
      checkoutUrl,
    };
  }

  /**
   * Handles DPO callback/webhook to update payment status
   */
  async handleCallback(payload: any): Promise<void> {
    const { transaction_reference, status, provider_ref } = payload;
    
    if (!transaction_reference || !status) {
      throw new Error('Invalid DPO callback payload');
    }

    // Verify the security hash if present in the callback
    if (payload.security_hash) {
      // Remove security_hash from payload for verification
      const payloadCopy = { ...payload };
      const receivedHash = payloadCopy.security_hash;
      delete payloadCopy.security_hash;
      
      const valuesString = Object.values(payloadCopy).join('');
      const calculatedHash = crypto
        .createHmac('sha1', this.securityHash)
        .update(valuesString)
        .digest('hex');
        
      if (calculatedHash !== receivedHash) {
        this.logger.error('Security hash mismatch in DPO callback');
        throw new Error('Security hash mismatch');
      }
    }

    // Find the payment record by transaction reference
    const payment = await this.prisma.payment.findFirst({
      where: {
        providerRef: transaction_reference,
        provider: 'dpo',
      },
      include: {
        booking: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.error(`Payment not found for transaction reference: ${transaction_reference}`);
      throw new Error(`Payment not found for transaction reference: ${transaction_reference}`);
    }

    // Update payment status based on DPO response
    const newStatus = status === 'SUCCESSFUL' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

    await this.prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: { 
          status: newStatus,
          providerRef: provider_ref || payment.providerRef, // Update with provider's reference if provided
        },
      });

      // If payment is successful, update booking status to APPROVED
      if (newStatus === PaymentStatus.COMPLETED) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'APPROVED' },
        });

        // Send payment receipt notification
        await this.notifications.sendPaymentReceipt(
          payment.booking.user.email,
          payment.booking.user.firstName,
          payment.bookingId,
          Number(payment.amount),
        );
      }
    });

    this.logger.log(`Payment status updated to ${newStatus} for transaction: ${transaction_reference}`);
  }

  /**
   * Validates a transaction with DPO
   */
  async validateTransaction(transactionId: string): Promise<any> {
    // Implementation would depend on DPO's specific validation API
    // This is a placeholder for validation functionality
    const payment = await this.prisma.payment.findFirst({
      where: {
        providerRef: transactionId,
        provider: 'dpo',
      },
    });

    if (!payment) {
      throw new Error(`Payment not found for transaction ID: ${transactionId}`);
    }

    // This would typically call DPO's validation API
    // For now, returning the payment record as validation result
    return payment;
  }
}