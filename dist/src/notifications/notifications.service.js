"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = __importStar(require("nodemailer"));
const ACTION_LABELS = {
    booking_confirmed: 'View Trip Receipt',
    booking_request: 'Review Request',
    booking_cancelled: 'View Booking',
    checked_in: 'View Booking',
    checked_out: 'View Booking',
    review_received: 'View Review',
    system: 'View',
    property_approved: 'Manage Inventory',
    property_rejected: 'Fix Listing',
    listing_approved: 'Manage Inventory',
    listing_rejected: 'Fix Listing',
    payout: 'View Payout Ledger',
    message: 'Reply',
    promotion: 'View Offer',
};
let NotificationsService = NotificationsService_1 = class NotificationsService {
    config;
    prisma;
    transporter;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.transporter = nodemailer.createTransport({
            host: config.get('MAIL_HOST'),
            port: config.get('MAIL_PORT'),
            secure: true,
            requireTLS: true,
            auth: {
                user: config.get('MAIL_USER'),
                pass: config.get('MAIL_PASS'),
            },
            tls: { rejectUnauthorized: true },
        });
        this.transporter.verify((err) => {
            if (err)
                this.logger.error(`Mail transporter error: ${err.message}`);
            else
                this.logger.log('Mail transporter ready ✓');
        });
    }
    async push(userId, type, title, description, opts = {}) {
        try {
            return await this.prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    description,
                    actionUrl: opts.actionUrl ?? null,
                    actionLabel: opts.actionLabel ?? ACTION_LABELS[type.toLowerCase()] ?? 'View',
                    metadata: opts.metadata ?? undefined,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to create notification: ${err.message}`);
        }
    }
    async getUserNotifications(userId, query) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, Math.max(1, query.limit ?? 20));
        const skip = (page - 1) * limit;
        const where = { userId, deletedAt: null };
        if (query.unreadOnly)
            where.isRead = false;
        if (query.type && query.type !== 'all') {
            where.type = query.type.toUpperCase();
        }
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { userId, isRead: false, deletedAt: null } }),
        ]);
        return {
            success: true,
            meta: {
                total,
                unreadCount,
                page,
                limit,
                hasMore: skip + notifications.length < total,
            },
            data: notifications.map((n) => this.serialize(n, userId)),
        };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false, deletedAt: null },
        });
        return { success: true, unreadCount: count };
    }
    async markAsRead(userId, id) {
        const notif = await this.prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });
        if (!notif)
            throw new common_1.NotFoundException('Notification not found');
        await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        const unreadCount = await this.prisma.notification.count({
            where: { userId, isRead: false, deletedAt: null },
        });
        return {
            success: true,
            message: 'Notification marked as read.',
            data: { id, read: true, unreadCount },
        };
    }
    async markAllAsRead(userId) {
        const { count } = await this.prisma.notification.updateMany({
            where: { userId, isRead: false, deletedAt: null },
            data: { isRead: true },
        });
        return {
            success: true,
            message: 'All notifications marked as read.',
            data: { markedCount: count, unreadCount: 0 },
        };
    }
    async deleteNotification(userId, id) {
        const notif = await this.prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });
        if (!notif)
            throw new common_1.NotFoundException('Notification not found');
        await this.prisma.notification.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return {
            success: true,
            message: 'Notification removed.',
            data: { deletedId: id },
        };
    }
    serialize(n, userId) {
        const typeKey = n.type.toLowerCase();
        return {
            id: n.id,
            userId,
            type: typeKey,
            title: n.title,
            description: n.description,
            timestamp: n.createdAt.toISOString(),
            read: n.isRead,
            actionUrl: n.actionUrl ?? null,
            actionLabel: n.actionLabel ?? ACTION_LABELS[typeKey] ?? 'View',
            metadata: n.metadata ?? undefined,
        };
    }
    async onBookingCreated(opts) {
        const { guestUserId, guestEmail, guestName, hostUserId, hostEmail, hostName, bookingRef, listingId, listingName, checkIn, checkOut, guests, amountZMW } = opts;
        await this.push(guestUserId, 'BOOKING_REQUEST', `Booking Received — ${bookingRef}`, `Your booking at ${listingName} for ${checkIn} – ${checkOut} (${guests} guest${guests !== 1 ? 's' : ''}) has been received and is awaiting host confirmation.`, { actionUrl: `/trips/${bookingRef}`, actionLabel: 'View Booking', metadata: { bookingRef, listingId, amountZMW } });
        await this.push(hostUserId, 'BOOKING_REQUEST', `New Booking Request — ${listingName}`, `${guestName} requested to book ${listingName} for ${checkIn} – ${checkOut} (${guests} guest${guests !== 1 ? 's' : ''}). Amount: ZMW ${(amountZMW / 100).toFixed(2)}.`, { actionUrl: '/host/bookings', actionLabel: 'Review Request', metadata: { bookingRef, listingId, amountZMW, senderName: guestName } });
        await this.send(guestEmail, `Booking Received — ${bookingRef} | Nearby Escapes`, this.tpl({
            name: guestName,
            heading: '🏕️ Booking Received',
            body: `
        <p>Your booking request <strong>${bookingRef}</strong> for <strong>${listingName}</strong> has been received.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#666;">Check-in</td><td style="padding:6px 0;font-weight:600;">${checkIn}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Check-out</td><td style="padding:6px 0;font-weight:600;">${checkOut}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Guests</td><td style="padding:6px 0;font-weight:600;">${guests}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Amount</td><td style="padding:6px 0;font-weight:600;color:#1f1433;">ZMW ${(amountZMW / 100).toFixed(2)}</td></tr>
        </table>
        <p>We'll notify you once the host confirms. Sit tight! 🎒</p>
      `,
            ctaLabel: 'View Booking',
            ctaUrl: `${this.frontendUrl()}/trips/${bookingRef}`,
        }));
        await this.send(hostEmail, `New Booking Request — ${bookingRef} | Nearby Escapes`, this.tpl({
            name: hostName,
            heading: '📬 New Booking Request',
            body: `
        <p><strong>${guestName}</strong> wants to book <strong>${listingName}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#666;">Booking Ref</td><td style="padding:6px 0;font-weight:600;">${bookingRef}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Check-in</td><td style="padding:6px 0;font-weight:600;">${checkIn}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Check-out</td><td style="padding:6px 0;font-weight:600;">${checkOut}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Guests</td><td style="padding:6px 0;font-weight:600;">${guests}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Payout (est.)</td><td style="padding:6px 0;font-weight:600;color:#1f1433;">ZMW ${((amountZMW * 0.88) / 100).toFixed(2)}</td></tr>
        </table>
        <p>Review and respond from your host dashboard.</p>
      `,
            ctaLabel: 'Review Request',
            ctaUrl: `${this.frontendUrl()}/host/bookings`,
        }));
    }
    async onBookingConfirmed(opts) {
        const { guestUserId, guestEmail, guestName, hostUserId, hostEmail, hostName, bookingRef, listingId, listingName, checkIn, checkOut, guests, amountZMW } = opts;
        await this.push(guestUserId, 'BOOKING_CONFIRMED', `Booking Confirmed — ${bookingRef}`, `Your stay at ${listingName} for ${checkIn} – ${checkOut} is confirmed. Check-in instructions are ready.`, { actionUrl: `/trips/${bookingRef}`, actionLabel: 'View Trip Receipt', metadata: { bookingRef, listingId, amountZMW } });
        await this.push(hostUserId, 'BOOKING_CONFIRMED', `Booking Confirmed — ${listingName}`, `${guestName}'s booking ${bookingRef} is confirmed for ${checkIn} – ${checkOut}. You'll receive your payout after checkout.`, { actionUrl: '/host/bookings', actionLabel: 'View Bookings', metadata: { bookingRef, listingId, amountZMW, senderName: guestName } });
        await this.send(guestEmail, `Booking Confirmed ✅ — ${bookingRef} | Nearby Escapes`, this.tpl({
            name: guestName,
            heading: '✅ Booking Confirmed',
            body: `
        <p>Great news! Your booking at <strong>${listingName}</strong> is <strong>confirmed</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#666;">Booking Ref</td><td style="padding:6px 0;font-weight:600;">${bookingRef}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Check-in</td><td style="padding:6px 0;font-weight:600;">${checkIn}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Check-out</td><td style="padding:6px 0;font-weight:600;">${checkOut}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Guests</td><td style="padding:6px 0;font-weight:600;">${guests}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Total Paid</td><td style="padding:6px 0;font-weight:600;color:#1f1433;">ZMW ${(amountZMW / 100).toFixed(2)}</td></tr>
        </table>
        <p>Get ready for your escape! 🌿</p>
      `,
            ctaLabel: 'View Trip Receipt',
            ctaUrl: `${this.frontendUrl()}/trips/${bookingRef}`,
        }));
        await this.send(hostEmail, `New Confirmed Booking — ${bookingRef} | Nearby Escapes`, this.tpl({
            name: hostName,
            heading: '📋 Confirmed Booking',
            body: `
        <p><strong>${guestName}</strong>'s booking for <strong>${listingName}</strong> is now <strong>confirmed</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#666;">Booking Ref</td><td style="padding:6px 0;font-weight:600;">${bookingRef}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Check-in</td><td style="padding:6px 0;font-weight:600;">${checkIn}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Check-out</td><td style="padding:6px 0;font-weight:600;">${checkOut}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Guests</td><td style="padding:6px 0;font-weight:600;">${guests}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Est. Payout</td><td style="padding:6px 0;font-weight:600;color:#1f1433;">ZMW ${((amountZMW * 0.88) / 100).toFixed(2)}</td></tr>
        </table>
      `,
            ctaLabel: 'View Dashboard',
            ctaUrl: `${this.frontendUrl()}/host/bookings`,
        }));
    }
    async onBookingCancelled(opts) {
        const { guestUserId, guestEmail, guestName, hostUserId, hostEmail, hostName, bookingRef, listingId, listingName, refundAmountNgwee, cancelledBy } = opts;
        const refundStr = refundAmountNgwee > 0
            ? `ZMW ${(refundAmountNgwee / 100).toFixed(2)} refund will be processed.`
            : 'No refund is applicable per the cancellation policy.';
        const cancellerLabel = cancelledBy === 'guest' ? 'you' : cancelledBy === 'host' ? 'the host' : 'Nearby Escapes support';
        await this.push(guestUserId, 'BOOKING_CANCELLED', `Booking Cancelled — ${bookingRef}`, `Your booking at ${listingName} was cancelled by ${cancellerLabel}. ${refundStr}`, { actionUrl: `/trips/${bookingRef}`, actionLabel: 'View Booking', metadata: { bookingRef, listingId, amountZMW: refundAmountNgwee } });
        await this.push(hostUserId, 'BOOKING_CANCELLED', `Booking Cancelled — ${bookingRef}`, `${guestName}'s booking ${bookingRef} at ${listingName} has been cancelled by ${cancellerLabel}.`, { actionUrl: '/host/bookings', actionLabel: 'View Bookings', metadata: { bookingRef, listingId, senderName: guestName } });
        await this.send(guestEmail, `Booking Cancelled — ${bookingRef} | Nearby Escapes`, this.tpl({
            name: guestName,
            heading: '❌ Booking Cancelled',
            body: `
        <p>Your booking <strong>${bookingRef}</strong> at <strong>${listingName}</strong> has been cancelled by ${cancellerLabel}.</p>
        <p>${refundStr}</p>
        <p>Need help? Contact our support team anytime.</p>
      `,
            ctaLabel: 'View Booking',
            ctaUrl: `${this.frontendUrl()}/trips/${bookingRef}`,
        }));
        await this.send(hostEmail, `Booking Cancelled — ${bookingRef} | Nearby Escapes`, this.tpl({
            name: hostName,
            heading: '❌ Booking Cancelled',
            body: `
        <p><strong>${guestName}</strong>'s booking <strong>${bookingRef}</strong> at <strong>${listingName}</strong> was cancelled by ${cancellerLabel}.</p>
        ${refundAmountNgwee > 0 ? `<p>A refund of ZMW ${(refundAmountNgwee / 100).toFixed(2)} has been issued to the guest.</p>` : ''}
      `,
            ctaLabel: 'View Bookings',
            ctaUrl: `${this.frontendUrl()}/host/bookings`,
        }));
    }
    async onPayoutCleared(opts) {
        const { hostUserId, hostEmail, hostName, bookingRef, payoutRef, amountZMW, method } = opts;
        await this.push(hostUserId, 'PAYOUT', `Payout Cleared — ZMW ${(amountZMW / 100).toFixed(2)}`, `Funds for booking ${bookingRef} have cleared into your ${method}.`, { actionUrl: '/host/finances', actionLabel: 'View Payout Ledger', metadata: { bookingRef, payoutRef, amountZMW } });
        await this.send(hostEmail, `Payout Cleared 💰 — ${payoutRef} | Nearby Escapes`, this.tpl({
            name: hostName,
            heading: '💰 Payout Cleared',
            body: `
        <p>Your payout for booking <strong>${bookingRef}</strong> has been sent.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#666;">Payout Ref</td><td style="padding:6px 0;font-weight:600;">${payoutRef}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Amount</td><td style="padding:6px 0;font-weight:600;color:#1f1433;">ZMW ${(amountZMW / 100).toFixed(2)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Method</td><td style="padding:6px 0;font-weight:600;">${method}</td></tr>
        </table>
      `,
            ctaLabel: 'View Payout Ledger',
            ctaUrl: `${this.frontendUrl()}/host/finances`,
        }));
    }
    async onReviewReceived(opts) {
        const { hostUserId, hostEmail, hostName, listingId, listingSlug, rating, reviewText, guestName } = opts;
        const stars = '⭐'.repeat(Math.min(5, rating));
        await this.push(hostUserId, 'REVIEW_RECEIVED', `New ${rating}-Star Review Received`, `${guestName} left a ${rating}-star review: "${reviewText.substring(0, 120)}${reviewText.length > 120 ? '…' : ''}"`, { actionUrl: `/stays/${listingSlug}#reviews`, actionLabel: 'View Review', metadata: { listingId, rating, senderName: guestName } });
        await this.send(hostEmail, `New ${rating}-Star Review | Nearby Escapes`, this.tpl({
            name: hostName,
            heading: `${stars} New Review`,
            body: `
        <p><strong>${guestName}</strong> left a <strong>${rating}-star</strong> review on your listing.</p>
        <blockquote style="border-left:3px solid #1f1433;padding:8px 16px;margin:16px 0;color:#444;font-style:italic;">
          "${reviewText}"
        </blockquote>
      `,
            ctaLabel: 'View Review',
            ctaUrl: `${this.frontendUrl()}/stays/${listingSlug}#reviews`,
        }));
    }
    async onListingStatusChanged(opts) {
        const { hostUserId, hostEmail, hostName, listingId, listingName, approved, reason } = opts;
        const type = approved ? 'LISTING_APPROVED' : 'LISTING_REJECTED';
        await this.push(hostUserId, type, approved ? 'Listing Verified & Published' : 'Listing Requires Corrections', approved
            ? `"${listingName}" has been verified by our compliance team and is now live in search results.`
            : `"${listingName}" requires corrections before it can be published. ${reason || 'Please review the feedback in your dashboard.'}`, {
            actionUrl: approved ? '/host/inventory' : `/host/listings/${listingId}`,
            actionLabel: approved ? 'Manage Inventory' : 'Fix Listing',
            metadata: { listingId },
        });
        await this.send(hostEmail, approved ? `✅ Listing Approved — ${listingName} | Nearby Escapes` : `⚠️ Listing Requires Correction — ${listingName} | Nearby Escapes`, this.tpl({
            name: hostName,
            heading: approved ? '✅ Listing Verified & Published' : '⚠️ Listing Requires Corrections',
            body: approved
                ? `<p><strong>${listingName}</strong> has passed our compliance review and is now live in search results. Guests can start booking!</p>`
                : `<p><strong>${listingName}</strong> requires corrections before it can go live.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}<p>Please log in to your dashboard and address the issues.</p>`,
            ctaLabel: approved ? 'View in Inventory' : 'Fix Listing',
            ctaUrl: approved ? `${this.frontendUrl()}/host/inventory` : `${this.frontendUrl()}/host/listings/${listingId}`,
        }));
    }
    async sendPasswordReset(to, name, resetUrl) {
        await this.send(to, 'Reset Your Password — Nearby Escapes', this.tpl({
            name,
            heading: '🔐 Password Reset',
            body: `
        <p>You requested a password reset. Click the button below — this link expires in <strong>1 hour</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
            ctaLabel: 'Reset Password',
            ctaUrl: resetUrl,
        }));
    }
    async sendBookingPending(to, name, bookingRef) {
        await this.send(to, `Booking Received — ${bookingRef} | Nearby Escapes`, this.tpl({
            name,
            heading: '🏕️ Booking Received',
            body: `<p>Your booking <strong>${bookingRef}</strong> has been received and is awaiting host confirmation.</p>`,
            ctaLabel: 'View Booking',
            ctaUrl: `${this.frontendUrl()}/trips/${bookingRef}`,
        }));
    }
    async sendBookingStatusUpdate(to, name, bookingRef, status) {
        const label = status === 'CONFIRMED' ? '✅ Confirmed' : status === 'PENDING' ? '⏳ Pending' : '❌ Rejected';
        await this.send(to, `Booking ${label} — ${bookingRef} | Nearby Escapes`, this.tpl({
            name,
            heading: `Booking ${label}`,
            body: `<p>Your booking <strong>${bookingRef}</strong> status has been updated to <strong>${label}</strong>.</p>`,
            ctaLabel: 'View Booking',
            ctaUrl: `${this.frontendUrl()}/trips/${bookingRef}`,
        }));
    }
    async sendHostBookingRequest(to, hostName, bookingRef, travelerName) {
        await this.send(to, `New Booking Request — ${bookingRef} | Nearby Escapes`, this.tpl({
            name: hostName,
            heading: '📬 New Booking Request',
            body: `<p><strong>${travelerName}</strong> has requested booking <strong>${bookingRef}</strong>. Please review from your dashboard.</p>`,
            ctaLabel: 'Review Request',
            ctaUrl: `${this.frontendUrl()}/host/bookings`,
        }));
    }
    async sendCancellationConfirmation(to, name, bookingRef, refundAmount) {
        const refundMsg = refundAmount > 0
            ? `A refund of <strong>ZMW ${(refundAmount / 100).toFixed(2)}</strong> will be processed shortly.`
            : 'No refund is applicable per the cancellation policy.';
        await this.send(to, `Booking Cancelled — ${bookingRef} | Nearby Escapes`, this.tpl({
            name,
            heading: '❌ Booking Cancelled',
            body: `<p>Your booking <strong>${bookingRef}</strong> has been cancelled.</p><p>${refundMsg}</p>`,
            ctaLabel: 'View Booking',
            ctaUrl: `${this.frontendUrl()}/trips/${bookingRef}`,
        }));
    }
    async sendPaymentReceipt(to, name, bookingRef, amount) {
        await this.send(to, `Payment Receipt — ${bookingRef} | Nearby Escapes`, this.tpl({
            name,
            heading: '🧾 Payment Receipt',
            body: `
        <p>Your payment of <strong>ZMW ${(amount / 100).toFixed(2)}</strong> for booking <strong>${bookingRef}</strong> was successful.</p>
        <p>Thank you for choosing Nearby Escapes! 🌍</p>
      `,
            ctaLabel: 'View Trip Receipt',
            ctaUrl: `${this.frontendUrl()}/trips/${bookingRef}`,
        }));
    }
    frontendUrl() {
        return this.config.get('FRONTEND_URL') ?? 'http://localhost:3000';
    }
    tpl(opts) {
        return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${opts.heading}</title></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <tr><td style="background:linear-gradient(135deg,#1f1433 0%,#3b2a6b 100%);padding:32px 40px;text-align:center;">
        <p style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Nearby Escapes</p>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Your gateway to Zambia's hidden gems</p>
      </td></tr>
      <tr><td style="padding:40px;">
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1f1433;">${opts.heading}</h1>
        <p style="margin:0 0 12px;color:#555;font-size:14px;">Hi ${opts.name},</p>
        <div style="color:#444;font-size:14px;line-height:1.6;">${opts.body}</div>
        ${opts.ctaUrl ? `
        <div style="margin:32px 0 0;text-align:center;">
          <a href="${opts.ctaUrl}" style="display:inline-block;background:#1f1433;color:#fff;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">${opts.ctaLabel ?? 'View'}</a>
        </div>` : ''}
      </td></tr>
      <tr><td style="padding:24px 40px;border-top:1px solid #f0eef9;text-align:center;">
        <p style="margin:0;color:#aaa;font-size:11px;">© ${new Date().getFullYear()} Nearby Escapes. All rights reserved.<br>Lusaka, Zambia 🇿🇲</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
    }
    async send(to, subject, html) {
        const recipient = this.config.get('NODE_ENV') !== 'production'
            ? (this.config.get('MAIL_DEV_OVERRIDE') ?? to)
            : to;
        try {
            await this.transporter.sendMail({
                from: this.config.get('MAIL_FROM'),
                to: recipient,
                subject,
                html,
            });
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${recipient}: ${err.message}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map