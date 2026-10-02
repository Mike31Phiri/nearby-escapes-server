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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wishlist_service_1 = require("./wishlist.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let SavedController = class SavedController {
    wishlistService;
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    async getSaved(user, page, limit) {
        return this.wishlistService.getSavedListings(user.id, page, limit);
    }
    async toggleSaved(user, listingId) {
        return this.wishlistService.toggleSavedListing(user.id, listingId);
    }
    async removeSaved(user, listingId) {
        return this.wishlistService.removeSavedListing(user.id, listingId);
    }
};
exports.SavedController = SavedController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all saved listings with pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of saved listings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SavedController.prototype, "getSaved", null);
__decorate([
    (0, common_1.Post)('toggle'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle listing in saved collection (1-click save/unsave)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing save state toggled' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SavedController.prototype, "toggleSaved", null);
__decorate([
    (0, common_1.Delete)(':listingId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove listing from saved collection' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing removed from saved collection' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SavedController.prototype, "removeSaved", null);
exports.SavedController = SavedController = __decorate([
    (0, swagger_1.ApiTags)('Saved Listings'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('saved'),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService])
], SavedController);
//# sourceMappingURL=saved.controller.js.map