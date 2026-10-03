import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    // Aiven PostgreSQL uses a self-signed CA cert. Both the Prisma query engine
    // and the pg driver need TLS verification disabled for managed cloud DBs.
    // Setting NODE_TLS_REJECT_UNAUTHORIZED before pool creation is the only
    // approach that reliably bypasses the Rust-layer TLS check in Prisma drivers.
    const needsSsl =
      connectionString?.includes('sslmode=require') ||
      connectionString?.includes('sslmode=verify-full') ||
      connectionString?.includes('aivencloud.com') ||
      connectionString?.includes('aiven.app');

    if (needsSsl) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const pool = new pg.Pool({
      connectionString,
      ...(needsSsl
        ? {
            ssl: {
              rejectUnauthorized: false,
              // checkServerIdentity override ensures pg also skips hostname verification
              checkServerIdentity: () => undefined,
            },
          }
        : {}),
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
