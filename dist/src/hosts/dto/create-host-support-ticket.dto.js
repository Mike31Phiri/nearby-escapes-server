"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHostSupportTicketDto = exports.TicketStatus = exports.TicketTopic = void 0;
const class_validator_1 = require("class-validator");
var TicketTopic;
(function (TicketTopic) {
    TicketTopic["PAYOUT"] = "payout";
    TicketTopic["CALENDAR"] = "calendar";
    TicketTopic["GUEST"] = "guest";
    TicketTopic["VERIFICATION"] = "verification";
    TicketTopic["OTHER"] = "other";
})(TicketTopic || (exports.TicketTopic = TicketTopic = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "open";
    TicketStatus["IN_PROGRESS"] = "in_progress";
    TicketStatus["RESOLVED"] = "resolved";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
class CreateHostSupportTicketDto {
    topic;
    subject;
    message;
    bookingRef;
    listingId;
}
exports.CreateHostSupportTicketDto = CreateHostSupportTicketDto;
__decorate([
    (0, class_validator_1.IsEnum)(TicketTopic, {
        message: 'topic must be one of: payout, calendar, guest, verification, other',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHostSupportTicketDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateHostSupportTicketDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateHostSupportTicketDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHostSupportTicketDto.prototype, "bookingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHostSupportTicketDto.prototype, "listingId", void 0);
//# sourceMappingURL=create-host-support-ticket.dto.js.map