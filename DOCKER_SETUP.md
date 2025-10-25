# Docker Setup for NestJS API

This document explains how to run the NestJS API using Docker and Docker Compose.

## Files Created

- `Dockerfile` - Container configuration for the NestJS API
- `docker-compose.yml` - Production setup with all services
- `docker-compose.dev.yml` - Development setup with hot reload
- `.dockerignore` - Files to exclude from Docker build

## Services

### 1. API Service (NestJS)

- **Port**: 6000
- **Environment**: Production/Development
- **Dependencies**: PostgreSQL database

### 2. Database Service (PostgreSQL)

- **Port**: 15432 (mapped from 5432)
- **Database**: mydatabase
- **User**: myuser
- **Password**: mypassword

### 3. Adminer (Database Admin)

- **Port**: 18000
- **Purpose**: Web-based database administration

## Usage

### Production Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Development Setup

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Individual Service Management

```bash
# Start only database
docker-compose up -d db

# Rebuild API service
docker-compose build api
docker-compose up -d api

# View specific service logs
docker-compose logs -f db
```

## Environment Variables

The following environment variables are configured:

- `NODE_ENV`: production/development
- `DB_HOST`: db (Docker service name)
- `DB_PORT`: 5432
- `DB_USERNAME`: myuser
- `DB_PASSWORD`: mypassword
- `DB_DATABASE`: mydatabase
- `JWT_SECRET`: your-jwt-secret-key

## Database Access

### Via Adminer

1. Open http://localhost:18000
2. Server: `db`
3. Username: `myuser`
4. Password: `mypassword`
5. Database: `mydatabase`

### Via Direct Connection

- Host: localhost
- Port: 15432
- Database: mydatabase
- Username: myuser
- Password: mypassword

## API Endpoints

Once running, your API will be available at:

- Base URL: http://localhost:6000
- Health Check: http://localhost:6000/health (if implemented)
- API Documentation: http://localhost:6000/api (if Swagger is configured)

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Make sure ports 6000, 15432, and 18000 are not in use
2. **Database Connection**: Ensure the database service is running before starting the API
3. **Build Issues**: Try rebuilding the API service: `docker-compose build api`

### Useful Commands

```bash
# Check running containers
docker ps

# Check service status
docker-compose ps

# Rebuild without cache
docker-compose build --no-cache api

# Remove all containers and volumes
docker-compose down -v

# View container logs
docker logs <container_name>
```

## Development vs Production

### Development (docker-compose.dev.yml)

- Hot reload enabled
- Source code mounted as volume
- Development dependencies included
- Auto-restart on file changes

### Production (docker-compose.yml)

- Optimized build
- Production dependencies only
- Compiled TypeScript
- Better performance
