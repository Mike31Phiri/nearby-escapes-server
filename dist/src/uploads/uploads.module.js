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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const uploads_service_1 = require("./uploads.service");
const uploads_controller_1 = require("./uploads.controller");
const s3_service_1 = require("./s3.service");
const multerS3 = __importStar(require("multer-s3"));
const crypto_1 = require("crypto");
const path_1 = require("path");
const multerS3Storage = multerS3.default ?? multerS3;
let UploadsModule = class UploadsModule {
};
exports.UploadsModule = UploadsModule;
exports.UploadsModule = UploadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => {
                    const s3 = new client_s3_1.S3Client({
                        region: config.getOrThrow('AWS_REGION'),
                        credentials: {
                            accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
                            secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
                        },
                    });
                    return {
                        storage: multerS3Storage({
                            s3,
                            bucket: config.getOrThrow('AWS_S3_BUCKET'),
                            contentType: multerS3Storage.AUTO_CONTENT_TYPE,
                            key: (_req, file, cb) => cb(null, `photos/${(0, crypto_1.randomUUID)()}${(0, path_1.extname)(file.originalname)}`),
                        }),
                        fileFilter: (_req, file, cb) => {
                            if (!file.mimetype.match(/image\/(jpeg|png|webp)/)) {
                                return cb(new Error('Only jpeg, png, webp images are allowed'), false);
                            }
                            cb(null, true);
                        },
                        limits: { fileSize: 8 * 1024 * 1024 },
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [uploads_service_1.UploadsService, s3_service_1.S3Service],
        controllers: [uploads_controller_1.UploadsController],
        exports: [s3_service_1.S3Service],
    })
], UploadsModule);
//# sourceMappingURL=uploads.module.js.map