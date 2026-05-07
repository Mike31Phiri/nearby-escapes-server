import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        resetToken: string | null;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatarUrl: string | null;
        location: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.Role;
        resetTokenExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findByEmail(email: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        resetToken: string | null;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatarUrl: string | null;
        location: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.Role;
        resetTokenExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateUser(id: string, dto: UpdateUserDto, role: Role): Promise<{
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
