#!/bin/bash

# Script para atualizar o template de e-mail de reset de senha no Supabase
# Uso: ./scripts/update-email-template.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
PROJECT_REF="tfkchwuphjaauyfqptbk"
TEMPLATE_FILE="supabase/templates/reset-password-simple.html"

echo -e "${YELLOW}🚀 Atualizando template de e-mail de reset de senha...${NC}"

# Verificar se o arquivo de template existe
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ Erro: Arquivo de template não encontrado: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Verificar se o token de acesso está definido
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Erro: SUPABASE_ACCESS_TOKEN não está definido${NC}"
    echo -e "${YELLOW}💡 Configure com: export SUPABASE_ACCESS_TOKEN=\"seu-token\"${NC}"
    echo -e "${YELLOW}💡 Obtenha seu token em: https://supabase.com/dashboard/account/tokens${NC}"
    exit 1
fi

# Ler o conteúdo do template e escapar para JSON
TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE" | sed 's/"/\\"/g' | tr -d '\n' | tr -d '\r')

# Fazer a requisição para atualizar o template
echo -e "${YELLOW}📤 Enviando template para o Supabase...${NC}"

RESPONSE=$(curl -s -w "%{http_code}" -X PATCH \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"mailer_subjects_recovery\": \"Redefinir sua senha - Clini.One\",
    \"mailer_templates_recovery_content\": \"$TEMPLATE_CONTENT\"
  }")

# Extrair o código de status HTTP
HTTP_CODE="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

# Verificar se a requisição foi bem-sucedida
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Template atualizado com sucesso!${NC}"
    echo -e "${GREEN}📧 Assunto: Redefinir sua senha - Clini.One${NC}"
    echo -e "${GREEN}🎨 Template aplicado com identidade visual da marca${NC}"
    echo ""
    echo -e "${YELLOW}🔗 Para testar:${NC}"
    echo -e "   1. Acesse: https://clini.one/forgot-password"
    echo -e "   2. Digite um e-mail válido"
    echo -e "   3. Verifique a caixa de entrada"
    echo ""
else
    echo -e "${RED}❌ Erro ao atualizar template (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}Resposta: $RESPONSE_BODY${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Processo concluído!${NC}" 