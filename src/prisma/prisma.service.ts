import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    // Aiven and other managed Postgres services use self-signed TLS certs.
    // The @prisma/adapter-pg does NOT parse sslmode= from the connection string,
    // so we must pass ssl config explicitly when connecting to these hosts.
    const needsSsl =
      connectionString?.includes('sslmode=require') ||
      connectionString?.includes('sslmode=verify-full') ||
      connectionString?.includes('aivencloud.com') ||
      connectionString?.includes('aiven.app');

    const adapter = new PrismaPg({
      connectionString,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
