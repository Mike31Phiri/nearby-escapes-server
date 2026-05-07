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
const nodemailer = __importStar(require("nodemailer"));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    config;
    transporter;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(config) {
        this.config = config;
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
        this.transporter.verify((error) => {
            if (error)
                this.logger.error(`Mail transporter error: ${error.message}`);
            else
                this.logger.log('Mail transporter ready');
        });
    }
    async sendBookingPending(to, firstName, bookingId) {
        await this.send(to, 'Booking Received – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>Your booking <strong>#${bookingId}</strong> has been received and is awaiting host confirmation.</p>
      <p>We'll notify you once the host responds.</p>
    `);
    }
    async sendBookingStatusUpdate(to, firstName, bookingId, status) {
        const label = status === 'APPROVED' ? 'confirmed ✅' : 'rejected ❌';
        await this.send(to, `Booking ${status === 'APPROVED' ? 'Confirmed' : 'Rejected'} – Nearby Escapes`, `
      <p>Hi ${firstName},</p>
      <p>Your booking <strong>#${bookingId}</strong> has been <strong>${label}</strong> by the host.</p>
      ${status === 'APPROVED' ? '<p>Get ready for your escape! 🎉</p>' : '<p>Please contact support if you have questions.</p>'}
    `);
    }
    async sendHostApprovalRequest(to, hostName, bookingId, travelerName, approveUrl, rejectUrl) {
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
    async sendCancellationConfirmation(to, firstName, bookingId, refundAmount) {
        const refundMsg = refundAmount > 0
            ? `A refund of <strong>ZMW ${refundAmount.toFixed(2)}</strong> will be processed shortly.`
            : 'Unfortunately, no refund is applicable based on the cancellation policy.';
        await this.send(to, 'Booking Cancelled – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>Your booking <strong>#${bookingId}</strong> has been cancelled.</p>
      <p>${refundMsg}</p>
    `);
    }
    async sendPasswordReset(to, firstName, resetUrl) {
        await this.send(to, 'Reset Your Password – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <p>
        <a href="${resetUrl}" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
      </p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
    `);
    }
    async sendPaymentReceipt(to, firstName, bookingId, amount) {
        await this.send(to, 'Payment Receipt – Nearby Escapes', `
      <p>Hi ${firstName},</p>
      <p>Your payment of <strong>ZMW ${amount.toFixed(2)}</strong> for booking <strong>#${bookingId}</strong> was successful.</p>
      <p>Thank you for choosing Nearby Escapes! 🌍</p>
    `);
    }
    async send(to, subject, html) {
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
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${recipient}: ${err.message}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map