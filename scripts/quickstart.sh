#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FinBot WhatsApp - Quick Start Script${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating root .env file...${NC}"
    cp .env.example .env
fi

if [ ! -f backend/.env ]; then
    echo -e "${BLUE}📝 Creating backend .env file...${NC}"
    cp backend/.env.example backend/.env
fi

echo -e "${GREEN}✅ Environment files created${NC}\n"

# Start Docker Compose
echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
docker compose up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 10

# Run migrations
echo -e "${BLUE}🔄 Running database migrations...${NC}"
docker compose exec -T backend npx prisma migrate deploy

# Seed database
echo -e "${BLUE}🌱 Seeding database with sample data...${NC}"
docker compose exec -T backend npm run prisma:seed

echo -e "\n${GREEN}✅ Setup complete!${NC}\n"
echo -e "${BLUE}📱 The WhatsApp bot will start automatically${NC}"
echo -e "${BLUE}📊 View logs:${NC} docker compose logs -f"
echo -e "${BLUE}🛑 Stop services:${NC} docker compose down\n"
