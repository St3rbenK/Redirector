# REDIRECTOR - Smart Group Distribution (All-in-One)

## 🚀 Deploy no Dokploy (Application)

Siga estes passos simples:

### 1. Banco de Dados
- Crie um serviço de **PostgreSQL** no Dokploy.
- Copie a `DATABASE_URL`.

### 2. Aplicação Redirector
- Crie uma aplicação no Dokploy.
- **Build Type:** Dockerfile
- **Context:** `.` (ou `redirector` se o repo tiver a pasta)
- **Dockerfile Path:** `Dockerfile` (ou `redirector/Dockerfile`)
- **Port:** `3000` (Certifique-se que o Dokploy aponta para a porta 3000 interna).

### 3. Variáveis de Ambiente
- `DATABASE_URL`: URL do seu Postgres.
- `JWT_SECRET`: Uma senha forte.
- `PORT`: 3000

## 🔑 Acesso Padrão
- **Email:** `admin@admin.com`
- **Senha:** `admin123`
