#!/bin/bash
# Script de inicialización de PostgreSQL

set -e

echo "🔧 Inicializando base de datos fitness_chatbot_dev..."

# Crear extensiones necesarias si no existen
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Crear extensiones útiles para el chatbot
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";
    
    -- Crear índices para búsqueda de texto
    -- (Se crearán después de que Prisma cree las tablas)
    
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

echo "✅ Base de datos inicializada correctamente"