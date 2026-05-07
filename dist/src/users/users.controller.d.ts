import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import type { User } from '@prisma/client';
export declare class UsersController {
    private usersService;
    private authService;
    constructor(usersService: UsersService, authService: AuthService);
    me(user: User): any;
    update(user: User, dto: UpdateUserDto): Promise<{
        fullName: string;
        role: string;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatarUrl: string | null;
        location: string | null;
        bio: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
