# NestJS Application with TypeORM and PostgreSQL

A NestJS application with TypeORM integration, PostgreSQL database, and Docker setup for development.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=15432
DB_USERNAME=myuser
DB_PASSWORD=mypassword
DB_NAME=mydatabase
DB_SYNCHRONIZE=true
DB_LOGGING=true

# Application Configuration
PORT=6000
```

### 3. Start Database

```bash
# Start PostgreSQL and Adminer using Docker Compose
docker-compose up -d
```

This will start:

- PostgreSQL database on port `15432`
- Adminer (database admin interface) on port `18000`

### 4. Run the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at `http://localhost:6000`

## 🗄️ Database Migration

### Automatic Synchronization

The application is configured with `DB_SYNCHRONIZE=true`, which means TypeORM will automatically:

- Create tables based on your entities
- Update table schemas when you modify entities
- Handle database migrations automatically

### Manual Migration (Optional)

If you prefer manual migrations, you can:

1. Set `DB_SYNCHRONIZE=false` in your `.env` file
2. Generate migrations:

```bash
# Generate migration files
npx typeorm migration:generate -d ormconfig.ts src/migrations/InitialMigration

# Run migrations
npx typeorm migration:run -d ormconfig.ts
```

## 🛠️ Available Scripts

```bash
# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugging

# Production
npm run build         # Build the application
npm run start:prod    # Start production server

# Testing
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
npm run test:e2e      # Run end-to-end tests

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

## 🐳 Docker Services

### PostgreSQL Database

- **Port**: 15432
- **Username**: myuser
- **Password**: mypassword
- **Database**: mydatabase

### Adminer (Database Admin)

- **URL**: http://localhost:18000
- **Server**: db
- **Username**: myuser
- **Password**: mypassword
- **Database**: mydatabase

## 🔧 Configuration

### TypeORM Configuration

The database configuration is in `ormconfig.ts`:

```typescript
const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User, Topic, Comment],
};
```

### Application Configuration

- **Port**: 6000 (configurable via `PORT` environment variable)
- **Validation**: Global validation pipes enabled
- **CORS**: Configured for development

## 🧪 Testing the Application

### Health Check

```bash
curl http://localhost:6000
# Expected: "Hello World!"
```



## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure Docker is running
   - Check if PostgreSQL container is up: `docker-compose ps`
   - Verify environment variables in `.env`

2. **Port Already in Use**
   - Change the `PORT` in `.env` file
   - Kill the process using the port: `lsof -ti:6000 | xargs kill -9`

3. **TypeORM Synchronization Issues**
   - Check `DB_SYNCHRONIZE` setting
   - Ensure database exists and is accessible
   - Check entity imports in `ormconfig.ts`

### Reset Database

```bash
# Stop and remove containers
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 📝 Development Notes

- The application uses bcrypt for password hashing
- Entity relationships are properly configured
- Global validation pipes are enabled
- TypeORM decorators are used for entity mapping
- Docker Compose provides isolated development environment

## 🔒 Security Considerations

- Passwords are hashed using bcrypt
- Environment variables are used for sensitive configuration
- Database credentials should be changed in production
- Consider using connection pooling for production

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
