# REDIRECTOR - Smart Group Distribution (All-in-One)

Versão unificada do **Redirector**: Frontend e Backend rodando no mesmo serviço para máxima simplicidade.

## 💎 Diferenciais
- **Mono-Container:** Tudo roda em um único serviço (Node.js).
- **Auto-Hosting:** O Express serve o Frontend React automaticamente.
- **Configuração Zero:** Não é necessário lidar com CORS em produção ou domínios separados.

## 🚀 Deploy no Dokploy (Application)

Siga estes passos simples para rodar o Redirector v3:

### 1. Banco de Dados
- No Dokploy, crie um serviço de **PostgreSQL**.
- Anote a `DATABASE_URL`.

### 2. Aplicação Redirector
- Crie uma aplicação no Dokploy.
- **Configuração do Docker:**
  - Build Type: `Dockerfile`
  - Docker Context: `redirector`
  - Dockerfile Path: `redirector/Dockerfile`
- **Variáveis de Ambiente:**
  - `DATABASE_URL`: URL de conexão do seu Postgres.
  - `JWT_SECRET`: Uma chave secreta segura.
  - `PORT`: 3001
- **Domínio:** Configure seu domínio principal (ex: `meuredirecionador.com`).

O Dokploy fará o build do Frontend, unificará com o Backend e iniciará o serviço.

## 🔑 Acesso Padrão
- **Email:** `admin@admin.com`
- **Senha:** `admin123`
