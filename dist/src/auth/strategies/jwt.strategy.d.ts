import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
        id: string;
        email: string;
        resetToken: string | null;
        name: string;
        password: string;
        phone: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        homeCity: string | null;
        bio: string | null;
        isVerified: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        resetTokenExpiry: Date | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null>;
}
export {};
