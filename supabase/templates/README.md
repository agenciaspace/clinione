# 📧 Templates de E-mail Personalizados - Clini.One

Este diretório contém os templates de e-mail personalizados para o sistema de autenticação do Supabase, seguindo a identidade visual da marca Clini.One.

## 🎨 Templates Disponíveis

### 1. Reset de Senha (Password Recovery)
- **Arquivo completo**: `reset-password.html`
- **Versão simplificada**: `reset-password-simple.html`

## 🚀 Como Aplicar os Templates

### Opção 1: Via Dashboard do Supabase (Recomendada)

1. **Acesse o Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Navegue até seu projeto**: `tfkchwuphjaauyfqptbk`

3. **Vá para Authentication**: 
   - Sidebar → **Authentication** → **Email Templates**

4. **Selecione "Reset Password"**

5. **Configure o template**:
   - **Subject**: `Redefinir sua senha - Clini.One`
   - **Body**: Copie o conteúdo de `reset-password-simple.html`

6. **Salve as alterações**

### Opção 2: Via Desenvolvimento Local

1. **Configure o config.toml** (já configurado):
   ```toml
   [auth.email.template.recovery]
   subject = "Redefinir sua senha - Clini.One"
   content_path = "./supabase/templates/reset-password.html"
   ```

2. **Reinicie o Supabase local**:
   ```bash
   supabase stop && supabase start
   ```

### Opção 3: Via API Management

```bash
# Configure suas variáveis
export SUPABASE_ACCESS_TOKEN="seu-access-token"
export PROJECT_REF="tfkchwuphjaauyfqptbk"

# Atualize o template via API
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_recovery": "Redefinir sua senha - Clini.One",
    "mailer_templates_recovery_content": "CONTEÚDO_DO_TEMPLATE_AQUI"
  }'
```

## 🎯 Características do Template

### Design
- ✅ **Cores da marca**: #FFD600 (amarelo) e #FFFAE6 (bege)
- ✅ **Typography**: Sistema de fontes moderno
- ✅ **Layout responsivo**: Funciona em desktop e mobile
- ✅ **Gradientes**: Efeitos visuais elegantes

### Funcionalidades
- ✅ **Logo da marca**: Clini.One em destaque
- ✅ **Botão CTA**: Call-to-action bem visível
- ✅ **Aviso de segurança**: Informações sobre validade do link
- ✅ **Link alternativo**: Para casos onde o botão não funciona
- ✅ **Footer profissional**: Links úteis e copyright

### Variáveis do Supabase
- ✅ `{{ .SiteURL }}`: URL da aplicação
- ✅ `{{ .Token }}`: Token de recuperação
- ✅ `{{ .TokenHash }}`: Hash do token (se necessário)

## 🔗 URLs Importantes

- **Site URL**: `https://clini.one`
- **Reset URL**: `{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery`

## 📱 Compatibilidade

- ✅ **Gmail**
- ✅ **Outlook**
- ✅ **Apple Mail**
- ✅ **Thunderbird**
- ✅ **Webmail clients**

## 🔒 Segurança

- ✅ **Expiração**: Links válidos por 1 hora
- ✅ **Uso único**: Cada link pode ser usado apenas uma vez
- ✅ **Verificação**: Sistema valida tokens automaticamente

## 🛠️ Personalização

Para personalizar outros templates (signup, magic link, etc.), siga o mesmo padrão:

1. Copie o arquivo `reset-password.html`
2. Adapte o conteúdo para o novo tipo
3. Configure no `config.toml` ou Dashboard
4. Teste o funcionamento

## 📞 Suporte

Em caso de dúvidas sobre a implementação dos templates, consulte:
- [Documentação oficial do Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Guia de desenvolvimento local](https://supabase.com/docs/guides/local-development/customizing-email-templates) 