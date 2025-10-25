# NestJS Application with TypeORM and PostgreSQL

A NestJS application with TypeORM integration, PostgreSQL database, and Docker setup for development.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose

### 1. Create Environment File

Create a `.env` file in the root directory with this content:

```bash
# Application Configuration
PORT=6000
NODE_ENV=production



### 1. Start Everything with Docker

```bash
# Build and start all services
docker-compose up --build -d
```

This single command will:

- ✅ Install all dependencies inside Docker
- ✅ Build the NestJS application
- ✅ Start PostgreSQL database
- ✅ Start Adminer (database admin interface)
- ✅ Start your API server
- ✅ Run everything in detached mode

## Services Available

After running the command, you'll have:

- **API Server**: `http://localhost:6000`
- **Database**: `localhost:15432` (PostgreSQL)
- **Adminer**: `http://localhost:18000` (Database admin interface)

## 🛑 Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v
```

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
- **Username**: postgres
- **Password**: postgres
- **Database**: postgres

### Adminer (Database Admin)

- **URL**: http://localhost:18000
- **Server**: db
- **Username**: postgres
- **Password**: postgres
- **Database**: postgres

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
   - Check if all containers are up: `docker-compose ps`
   - Verify `.env` file exists and has correct values
   - Check container logs: `docker-compose logs api` or `docker-compose logs db`

2. **Port Already in Use**
   - Change the `PORT` in `.env` file
   - Kill the process using the port: `lsof -ti:6000 | xargs kill -9`

3. **Build Issues**
   - Clean Docker cache: `docker-compose down && docker system prune -f`
   - Rebuild: `docker-compose up --build -d`

4. **TypeORM Synchronization Issues**
   - Check `DB_SYNCHRONIZE` setting in `.env`
   - Ensure database container is running
   - Check entity imports in `ormconfig.ts`

### Reset Everything

```bash
# Stop and remove everything (clean reset)
docker-compose down -v

# Start fresh
docker-compose up --build -d
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
