import { SetMetadata } from '@nestjs/common';

export type SecurityLevelType = 'RESTRICTED' | 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';

export const SECURITY_LEVEL_KEY = 'security_level';
export const SecurityLevel = (level: SecurityLevelType) => SetMetadata(SECURITY_LEVEL_KEY, level);
