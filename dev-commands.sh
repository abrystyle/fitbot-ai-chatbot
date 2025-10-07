#!/bin/bash

# 🛑 Script para detener el entorno de desarrollo

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

case "$1" in
    "stop")
        print_info "Deteniendo servicios..."
        docker-compose down
        print_success "Servicios detenidos"
        ;;
    "restart")
        print_info "Reiniciando servicios..."
        docker-compose restart
        print_success "Servicios reiniciados"
        ;;
    "logs")
        print_info "Mostrando logs..."
        docker-compose logs -f
        ;;
    "db")
        print_info "Conectando a PostgreSQL..."
        docker-compose exec postgres psql -U fitbot -d fitness_chatbot_dev
        ;;
    "clean")
        print_info "Limpiando todo (contenedores, volúmenes, imágenes)..."
        docker-compose down -v --rmi all --remove-orphans
        print_success "Limpieza completa"
        ;;
    "status")
        print_info "Estado de los servicios:"
        docker-compose ps
        ;;
    *)
        echo "Uso: ./dev [comando]"
        echo ""
        echo "Comandos disponibles:"
        echo "  start     - Iniciar entorno completo"
        echo "  stop      - Detener servicios"
        echo "  restart   - Reiniciar servicios"
        echo "  logs      - Ver logs en tiempo real"
        echo "  db        - Conectar a PostgreSQL"
        echo "  status    - Ver estado de servicios"
        echo "  clean     - Limpiar todo completamente"
        ;;
esac