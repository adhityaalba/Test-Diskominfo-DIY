FROM php:8.3-cli-alpine

# Install system dependencies & PostgreSQL dev tools
RUN apk add --no-repeat --no-cache \
    postgresql-dev \
    git \
    unzip \
    zip \
    bash

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql pdo

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy files
COPY . .

# Install dependencies
RUN composer install --no-interaction --optimize-autoloader

# Expose port
EXPOSE 8000

# Start server
CMD php artisan serve --host=0.0.0.0 --port=8000
