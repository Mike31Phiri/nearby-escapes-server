import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { BookingStatus, NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private config: ConfigService,
    private prisma?: PrismaService,
  ) {
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

  // ─── In-app notification helper ────────────────────────────────────────────

  private async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    description: string,
    actionUrl?: string,
  ) {
    if (!this.prisma) return;
    try {
      await this.prisma.notification.create({
        data: { userId, type, title, description, actionUrl },
      });
    } catch (err) {
      this.logger.error(`Failed to create notification: ${err.message}`);
    }
  }

  // ─── Booking notifications ─────────────────────────────────────────────────

  async sendBookingPending(to: string, name: string, bookingRef: string) {
    await this.send(to, 'Booking Received – Nearby Escapes', `
      <p>Hi ${name},</p>
      <p>Your booking <strong>${bookingRef}</strong> has been received and is awaiting host confirmation.</p>
      <p>We'll notify you once the host responds.</p>
    `);
  }

  async sendBookingStatusUpdate(to: string, name: string, bookingRef: string, status: string) {
    const label = status === 'CONFIRMED' ? 'confirmed ✅' : status === 'PENDING' ? 'pending ⏳' : 'rejected ❌';
    await this.send(to, `Booking ${status === 'CONFIRMED' ? 'Confirmed' : status === 'PENDING' ? 'Pending' : 'Rejected'} – Nearby Escapes`, `
      <p>Hi ${name},</p>
      <p>Your booking <strong>${bookingRef}</strong> has been <strong>${label}</strong>${status === 'CONFIRMED' ? 'by the host' : ''}.</p>
      ${status === 'CONFIRMED' ? '<p>Get ready for your escape! 🎉</p>' : status === 'PENDING' ? '<p>We are waiting for the host to confirm your booking.</p>' : '<p>Please contact support if you have questions.</p>'}
    `);
  }

  async sendHostBookingRequest(to: string, hostName: string, bookingRef: string, travelerName: string) {
    const dashboardUrl = `${this.config.get('FRONTEND_URL') || 'http://localhost:3000'}/host/bookings`;
    await this.send(to, 'New Booking Request – Nearby Escapes', `
      <p>Hi ${hostName},</p>
      <p>You have a new booking request <strong>${bookingRef}</strong> from <strong>${travelerName}</strong>.</p>
      <p>Please review and respond from your <a href="${dashboardUrl}">dashboard</a>.</p>
    `);

    // Also create in-app notification for host
    const host = await this.prisma?.user.findUnique({ where: { email: to } });
    if (host) {
      await this.createNotification(
        host.id,
        'BOOKING_REQUEST',
        'New Booking Request',
        `${travelerName} wants to book at your listing - ${bookingRef}`,
        '/host/bookings',
      );
    }
  }

  async sendCancellationConfirmation(to: string, name: string, bookingRef: string, refundAmount: number) {
    const refundMsg = refundAmount > 0
      ? `A refund of <strong>ZMW ${(refundAmount / 100).toFixed(2)}</strong> will be processed shortly.`
      : 'Unfortunately, no refund is applicable based on the cancellation policy.';
    await this.send(to, 'Booking Cancelled – Nearby Escapes', `
      <p>Hi ${name},</p>
      <p>Your booking <strong>${bookingRef}</strong> has been cancelled.</p>
      <p>${refundMsg}</p>
    `);
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    await this.send(to, 'Reset Your Password – Nearby Escapes', `
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <p>
        <a href="${resetUrl}" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
      </p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
    `);
  }

  async sendPaymentReceipt(to: string, name: string, bookingRef: string, amount: number) {
    await this.send(to, 'Payment Receipt – Nearby Escapes', `
      <p>Hi ${name},</p>
      <p>Your payment of <strong>ZMW ${(amount / 100).toFixed(2)}</strong> for booking <strong>${bookingRef}</strong> was successful.</p>
      <p>Thank you for choosing Nearby Escapes! 🌍</p>
    `);
  }

  // ─── Generic email send ────────────────────────────────────────────────────

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
