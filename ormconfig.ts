import { User } from "src/entities/user.entity";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const config: PostgresConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 15432,
    username: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
    synchronize: true,
    logging: true,
    entities: [User],
  };
  
export default config;