import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    me(user: User): Promise<{
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
        name: string;
        id: string;
        avatar: string | null;
        homeCity: string | null;
        bio: string | null;
        businessName: string | null;
        isApproved: boolean;
        createdAt: Date;
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
