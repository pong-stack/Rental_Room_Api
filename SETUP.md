# 🚀 Quick Setup Guide

## For Your Team - Two Step Setup

After cloning this repository, your team needs to:

1. **Create the .env file** (copy from the example below)
2. **Run the application stack**

### Step 1: Create .env file

Create a `.env` file in the root directory with this content:

```bash
# Application Configuration
PORT=6000
NODE_ENV=production

# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=nestjs_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

### Step 2: Run the application

```bash
docker-compose up --build -d
```

**That's it!** No need to run `npm install` or any other setup commands.

## What This Does

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

## Database Connection Details

- **Host**: `localhost`
- **Port**: `15432`
- **Username**: `postgres`
- **Password**: `postgres123`
- **Database**: `nestjs_db`

## Stopping the Services

```bash
docker-compose down
```

## Viewing Logs

```bash
docker-compose logs -f
```

## Requirements

- Docker Desktop installed and running
- That's it! No Node.js, npm, or any other dependencies needed locally.
