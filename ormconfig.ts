import { User } from './src/entities/user.entity';
import { Home } from './src/entities/home.entity';
import { Room } from './src/entities/room.entity';
import { RoomRule } from './src/entities/room-rule.entity';
import { Rule } from './src/entities/rule.entity';
import { VerificationRequest } from './src/entities/verification-request.entity';
import { Invoice } from './src/entities/invoice.entity';
import { InvoiceItem } from './src/entities/invoice-item.entity';
import { RoleUpgradeRequest } from './src/entities/role-upgrade-request.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as dotenv from 'dotenv';

dotenv.config();

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [
    User,
    Home,
    Room,
    RoomRule,
    Rule,
    VerificationRequest,
    Invoice,
    InvoiceItem,
    RoleUpgradeRequest,
  ],
};

export default config;
