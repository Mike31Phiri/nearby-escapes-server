import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { S3Service } from '../uploads/s3.service';
export declare class UsersService {
    private prisma;
    private s3?;
    constructor(prisma: PrismaService, s3?: S3Service | undefined);
    findById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findByEmail(email: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getProfile(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        role: string;
        homeCity: string | null;
        bio: string | null;
        joinedAt: Date;
        stats: {
            totalBookings: number;
            totalReviews: number;
            memberSince: string;
        };
    }>;
    getPublicProfile(id: string): Promise<{
        role: string;
        joinedAt: Date;
        id: string;
        name: string;
        avatar: string | null;
        homeCity: string | null;
        bio: string | null;
        createdAt: Date;
        host: {
            businessName: string;
            isApproved: boolean;
        } | null;
    }>;
    updateProfile(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        role: string;
        homeCity: string | null;
        bio: string | null;
        joinedAt: Date;
        stats: {
            totalBookings: number;
            totalReviews: number;
            memberSince: string;
        };
    }>;
}
