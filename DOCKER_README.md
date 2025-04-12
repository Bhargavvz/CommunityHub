# Docker Deployment Guide

This project uses Docker to deploy both the frontend and backend services in a single container.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### 1. Environment Setup

Before building the Docker image, make sure to set up your environment variables:

```bash
# Copy the example .env file
cp backend/.env.example backend/.env

# Edit the .env file with your configuration
nano backend/.env
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the containers
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### 3. Stopping the Application

```bash
docker-compose down
```

## Configuration

### Ports

By default, the application exposes:
- Port 3000 for the frontend
- Port 8000 for the backend API

To change these ports, modify the `docker-compose.yml` file.

### Environment Variables

Additional environment variables can be added in the `docker-compose.yml` file under the `environment` section.

## Structure

The Docker setup uses a multi-stage build process:
1. Build the frontend React application
2. Build the backend TypeScript application
3. Create a production image with both services

## Logs

Backend logs are persisted to your host machine through a volume mount at `./backend/logs`. 