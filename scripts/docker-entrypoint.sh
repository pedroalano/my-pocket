#!/bin/sh
set -e

echo "Waiting for services to be ready..."
sleep 10

echo "Running database migrations..."
npm run db:migrate:deploy

echo "Attempting to seed database..."
npm run db:seed || echo "Warning: Seeding failed, but continuing with app startup"

echo "Starting NestJS application..."
exec npm run start:prod
