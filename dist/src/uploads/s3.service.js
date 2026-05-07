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
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
let S3Service = S3Service_1 = class S3Service {
    config;
    s3;
    bucket;
    logger = new common_1.Logger(S3Service_1.name);
    constructor(config) {
        this.config = config;
        this.s3 = new client_s3_1.S3Client({
            region: config.getOrThrow('AWS_REGION'),
            credentials: {
                accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
                secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
            },
        });
        this.bucket = config.getOrThrow('AWS_S3_BUCKET');
    }
    async deleteMany(urls) {
        if (!urls.length)
            return;
        const keys = urls.map((url) => ({ Key: this.extractKey(url) }));
        try {
            await this.s3.send(new client_s3_1.DeleteObjectsCommand({
                Bucket: this.bucket,
                Delete: { Objects: keys },
            }));
        }
        catch (err) {
            this.logger.error(`Failed to delete S3 objects: ${err.message}`);
        }
    }
    async deleteOne(url) {
        try {
            await this.s3.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: this.extractKey(url),
            }));
        }
        catch (err) {
            this.logger.error(`Failed to delete S3 object: ${err.message}`);
        }
    }
    extractKey(url) {
        try {
            return new URL(url).pathname.slice(1);
        }
        catch {
            return url;
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map