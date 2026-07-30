#!/bin/sh
set -e

# Configura Basic Auth se as variaveis de ambiente estiverem presentes (ex: QA)
if [ -n "$BASIC_AUTH_USER" ] && [ -n "$BASIC_AUTH_PASS" ]; then
    echo "Setting up Basic Auth for user: $BASIC_AUTH_USER"
    # Cria o arquivo .htpasswd
    htpasswd -bc /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASS"
    
    # Injeta auth_basic no arquivo de conf do NGINX (usando 's' para maior compatibilidade no Alpine)
    sed -i 's/location \/ {/location \/ {\n        auth_basic "Restricted Access";\n        auth_basic_user_file \/etc\/nginx\/.htpasswd;/g' /etc/nginx/conf.d/default.conf
else
    echo "No Basic Auth credentials found. Proceeding without Basic Auth."
fi

# Inicia o NGINX
exec nginx -g "daemon off;"
