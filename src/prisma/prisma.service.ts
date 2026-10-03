import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    // Aiven and other managed Postgres services use self-signed TLS certs.
    // We create a pg.Pool directly so we can explicitly configure SSL —
    // passing ssl config to PrismaPg as plain config is not always respected.
    const needsSsl =
      connectionString?.includes('sslmode=require') ||
      connectionString?.includes('sslmode=verify-full') ||
      connectionString?.includes('aivencloud.com') ||
      connectionString?.includes('aiven.app');

    const pool = new pg.Pool({
      connectionString,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
