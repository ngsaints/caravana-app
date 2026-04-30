#!/bin/bash

# Scraper para Centro Culturais do Espírito Santo
# Uso: ./run-scraper.sh

set -e

TOKEN="${APIFY_TOKEN:-YOUR_APIFY_TOKEN_HERE}"

# actor: Google Maps Scraper (nwua9Gu5YrADL7KDj)

# Primeiro, fazer build do código localmente para testar
# Depois, vamos criar o input correto para o Apify

echo "=== Scraper: Centro Culturais ES ==="

# Buscas específicas para ES
MUNICIPALITIES=(
    "Vitória"
    "Vila Velha"
    "Serra"
    "Cariacica"
    "Guarapari"
    "Cachoeiro de Itapemirim"
    "Colatina"
    "São Mateus"
    "Linhares"
)

QUERIES=(
    "centro cultural"
    "associação cultural"
    "espaço cultural"
    "centro comunitário"
)

for mun in "${MUNICIPALITIES[@]}"; do
    for query in "${QUERIES[@]}"; do
        echo "Buscando: $query em $mun..."

        # Chamar Google Maps Scraper actor com input correto
        curl -s -X POST "https://api.apify.com/v2/acts/nwua9Gu5YrADL7KDj/runs?token=$TOKEN" \
            -d "{
                \"searchStringsArray\": [\"$query $mun Espírito Santo\"],
                \"locationQuery\": \"$mun, Espírito Santo, Brazil\",
                \"maxCrawledPlacesPerSearch\": 20,
                \"language\": \"pt-BR\",
                \"countryCode\": \"BR\"
            }" \
            -H "Content-Type: application/json" | jq -r '.data.id' 2>/dev/null || true

        sleep 3000  # 3s entre chamadas para não sobrecarregar
    done
done

echo "=== Concluído ==="