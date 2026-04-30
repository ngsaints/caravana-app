# Deploy com Systemd + Nginx

Este guia descreve como fazer deploy da aplicação em um servidor Linux com systemd e nginx.

## Pré-requisitos

- Ubuntu/Debian ou similar
- Nginx instalado
- Node.js 18+ (para build)
- pm2 ou criação manual do systemd service (aqui usaremos systemd puro)

## Passo 1: Build da Aplicação

```bash
cd /caminho/para/Projeto\ 08\ -\ Maps/caravana-app

# Instalar dependências
npm install

# Build de produção
npm run build
```

O output será gerado em `dist/`.

## Passo 2: Copiar arquivos para produção

```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/caravana
sudo chown -R $USER:$USER /var/www/caravana

# Copiar arquivos do build
cp -r dist/* /var/www/caravana/

# Copiar arquivos estáticos (se houver)
# cp -r src/data /var/www/caravana/  # se necessário
```

## Passo 3: Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/caravana
```

```nginx
server {
    listen 80;
    server_name caravãa.cultura.es.gov.br;  # Substitua pelo seu domínio

    root /var/www/caravana;
    index index.html;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/caravana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Passo 4: Configurar Systemd Service

```bash
sudo nano /etc/systemd/system/caravana.service
```

```ini
[Unit]
Description=Caravana da Cultura - Static File Server
Documentation=https://github.com/seu-repo/caravana
After=network.target

[Service]
Type=simple
# Para serve estático via python ou node (alternativa ao nginx)
# ExecStart=/usr/bin/python3 -m http.server 8080 --directory /var/www/caravana
WorkingDirectory=/var/www/caravana
ExecStart=/usr/bin/python3 -m http.server 8080
Restart=on-failure
RestartSec=10
User=www-data
Group=www-data

# Se usar nginx como proxy reverso, não precisa do python server
# Apenas sirva os arquivos via nginx como acima

[Install]
WantedBy=multi-user.target
```

**Nota**: Se usar nginx para servir arquivos estáticos (recomendado), não precisa do systemd service acima. O nginx já cuida disso.

## Passo 5: SSL com Let's Encrypt (opcional)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d caravana.cultura.es.gov.br
```

## Passo 6: Relacionar com Systemd (alternativa com serve)

Se preferir usar `serve` para servir os arquivos:

```bash
# Instalar serve globalmente
npm install -g serve

# Criar serviço systemd
sudo nano /etc/systemd/system/caravana.service
```

```ini
[Unit]
Description=Caravana da Cultura - Static File Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/caravana
ExecStart=/usr/local/bin/serve -s . -l 8080
Restart=always
RestartSec=5
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable caravana
sudo systemctl start caravana
```

## Verificar Status

```bash
# Status do serviço (se usar systemd com serve)
sudo systemctl status caravana

# Ver logs
sudo journalctl -u caravana -f

# Testar endpoint
curl http://localhost:8080
```

## Atualização

Para atualizar a aplicação:

```bash
cd /caminho/para/Projeto\ 08\ -\ Maps/caravana-app
npm run build
cp -r dist/* /var/www/caravana/
sudo systemctl reload nginx  # se usar nginx
# ou
sudo systemctl restart caravana  # se usar serve
```

## Troubleshooting

### Nginx retorna 404
Verifique se o `root` no nginx está correto e se os arquivos existem:
```bash
ls -la /var/www/caravana/
```

### Permissão negada
```bash
sudo chown -R www-data:www-data /var/www/caravana
```

### Problemas com Gzip
Verifique se o nginx tem o módulo gzip habilitado:
```bash
nginx -V 2>&1 | grep -o gzip
```