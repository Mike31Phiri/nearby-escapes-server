import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    profile(user: User): Promise<{
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
    findOne(id: string): Promise<{
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
    update(user: User, dto: UpdateUserDto): Promise<{
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
    uploadAvatar(user: User, file: Express.Multer.File): Promise<{
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
