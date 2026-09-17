#!/bin/sh

# Optimiser Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations
php artisan migrate --force

# Démarrer PHP-FPM
php-fpm -D

# Démarrer Nginx
nginx -g "daemon off;"
