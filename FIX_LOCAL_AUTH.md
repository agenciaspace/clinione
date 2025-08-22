# Guia para Resolver Problema de Autenticação Local

## Situação Atual
A aplicação está rodando em http://localhost:8080 mas está conectada **diretamente ao banco de produção do Supabase**, não a um banco local.

## Problema
Você não consegue fazer login com suas credenciais de produção (leonhatori@gmail.com).

## Soluções

### Solução 1: Resetar Senha no Supabase de Produção (Mais Rápido)

1. **Via Aplicação:**
   - Acesse http://localhost:8080/forgot-password
   - Digite seu email: leonhatori@gmail.com
   - Verifique seu email e siga as instruções

2. **Via Painel do Supabase:**
   - Acesse https://supabase.com/dashboard
   - Vá para seu projeto: tfkchwuphjaauyfqptbk
   - Navigate para Authentication > Users
   - Encontre leonhatori@gmail.com
   - Clique em "Send password reset"

### Solução 2: Usar Banco Local (Recomendado para Desenvolvimento)

#### Pré-requisitos:
- Docker Desktop instalado e rodando
- Supabase CLI instalado (`npm install -g supabase`)

#### Passos:

1. **Iniciar Docker Desktop**
   ```bash
   # No macOS, abra o Docker Desktop via Applications
   open -a Docker
   ```

2. **Inicializar Supabase Local**
   ```bash
   cd /Users/leonhatori/Documents/GitHub/Untitled
   npx supabase init (se ainda não foi inicializado)
   npx supabase start
   ```

3. **Criar arquivo .env**
   ```bash
   # Copie o arquivo de exemplo
   cp env.example .env
   
   # Edite o arquivo .env e descomente as linhas do Supabase LOCAL:
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   ```

4. **Reiniciar a aplicação**
   ```bash
   # Pare o servidor atual (Ctrl+C)
   # Reinicie
   npm run dev
   ```

5. **Sincronizar dados de produção (Opcional)**
   ```bash
   # Este comando copiará todos os dados de produção para seu banco local
   ./sync-prod-to-local.sh
   ```

6. **Criar usuário local para teste**
   ```bash
   # Conectar ao banco local
   psql "postgresql://postgres:postgres@localhost:54322/postgres"
   
   # Executar o script SQL
   \i scripts/set-leonhatori-password.sql
   ```

### Solução 3: Verificar Logs de Erro

Se ainda tiver problemas, verifique:

1. **Console do navegador** (F12 > Console)
   - Procure por erros de autenticação
   - Verifique mensagens do Supabase

2. **Network tab** (F12 > Network)
   - Veja as requisições para o Supabase
   - Verifique os status codes (401, 403, etc)

3. **Logs do Supabase**
   ```bash
   # Se usando Supabase local
   npx supabase logs auth
   npx supabase logs db
   ```

## Credenciais Conhecidas

### Produção
- Email: leonhatori@gmail.com
- Senha: (sua senha de produção - tente 'euteamo12!' se foi configurada)

### Local (após sincronização)
- Email: leonhatori@gmail.com
- Senha: euteamo12! (conforme script set-leonhatori-password.sql)

## Comandos Úteis

```bash
# Verificar status do Supabase local
npx supabase status

# Ver URL e chaves do Supabase local
npx supabase status | grep -E "API URL|anon key"

# Resetar banco local
npx supabase db reset

# Aplicar migrações
npx supabase migration up
```

## Troubleshooting

### "Cannot connect to Docker daemon"
- Certifique-se que o Docker Desktop está rodando
- No macOS: `open -a Docker`

### "Invalid email or password"
- Verifique se está usando o email correto
- Tente resetar a senha via forgot-password
- Se usando banco local, execute o script SQL de reset

### "Network error"
- Verifique se o servidor está rodando: http://localhost:8080
- Verifique as variáveis de ambiente no .env
- Reinicie o servidor após mudanças no .env
