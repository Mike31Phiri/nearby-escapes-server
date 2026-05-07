import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST'),
      port: config.get<number>('MAIL_PORT'),
      secure: true,
      requireTLS: true,
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
      tls: { rejectUnauthorized: true },
    });

    this.transporter.verify((error) => {
      if (error) this.logger.error(`Mail transporter error: ${error.message}`);
      else this.logger.log('Mail transporter ready');
    });
  }

  async sendBookingPending(to: string, firstName: string, bookingId: string) {
    await this.send(to, 'Booking Received – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>Your booking <strong>#${bookingId}</strong> has been received and is awaiting host confirmation.</p>
      <p>We'll notify you once the host responds.</p>
    `);
  }

  async sendBookingStatusUpdate(to: string, firstName: string, bookingId: string, status: BookingStatus) {
    const label = status === 'APPROVED' ? 'confirmed ✅' : 'rejected ❌';
    await this.send(to, `Booking ${status === 'APPROVED' ? 'Confirmed' : 'Rejected'} – Nearby Escapes`, `
      <p>Hi ${firstName},</p>
      <p>Your booking <strong>#${bookingId}</strong> has been <strong>${label}</strong> by the host.</p>
      ${status === 'APPROVED' ? '<p>Get ready for your escape! 🎉</p>' : '<p>Please contact support if you have questions.</p>'}
    `);
  }

  async sendHostApprovalRequest(
    to: string,
    hostName: string,
    bookingId: string,
    travelerName: string,
    approveUrl: string,
    rejectUrl: string,
  ) {
    await this.send(to, 'New Booking Request – Nearby Escapes', `
      <p>Hi ${hostName},</p>
      <p>You have a new booking request <strong>#${bookingId}</strong> from <strong>${travelerName}</strong>.</p>
      <p>
        <a href="${approveUrl}" style="background:#22c55e;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;margin-right:10px;">Approve</a>
        <a href="${rejectUrl}" style="background:#ef4444;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reject</a>
      </p>
      <p>Or manage bookings from your dashboard.</p>
    `);
  }

  async sendCancellationConfirmation(to: string, firstName: string, bookingId: string, refundAmount: number) {
    const refundMsg = refundAmount > 0
      ? `A refund of <strong>ZMW ${refundAmount.toFixed(2)}</strong> will be processed shortly.`
      : 'Unfortunately, no refund is applicable based on the cancellation policy.';
    await this.send(to, 'Booking Cancelled – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>Your booking <strong>#${bookingId}</strong> has been cancelled.</p>
      <p>${refundMsg}</p>
    `);
  }

  async sendPasswordReset(to: string, firstName: string, resetUrl: string) {
    await this.send(to, 'Reset Your Password – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <p>
        <a href="${resetUrl}" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
      </p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
    `);
  }

  async sendPaymentReceipt(to: string, firstName: string, bookingId: string, amount: number) {
    await this.send(to, 'Payment Receipt – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>Your payment of <strong>ZMW ${amount.toFixed(2)}</strong> for booking <strong>#${bookingId}</strong> was successful.</p>
      <p>Thank you for choosing Nearby Escapes! 🌍</p>
    `);
  }

  private async send(to: string, subject: string, html: string) {
    const recipient = this.config.get('NODE_ENV') !== 'production'
      ? this.config.get('MAIL_DEV_OVERRIDE') ?? to
      : to;
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM'),
        to: recipient,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${recipient}: ${err.message}`);
    }
  }
}
