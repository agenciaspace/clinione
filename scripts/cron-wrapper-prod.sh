#!/bin/bash

# Wrapper para cron deploy prod
# Configura ambiente completo antes de executar

# Configurar PATH completo
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH"

# Configurar Node.js (se usando nvm)
if [[ -f "$HOME/.nvm/nvm.sh" ]]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use node 2>/dev/null || true
fi

# Configurar variáveis de ambiente
if [[ -f "$HOME/.zshrc" ]]; then
    source "$HOME/.zshrc" 2>/dev/null || true
fi

if [[ -f "$HOME/.bashrc" ]]; then
    source "$HOME/.bashrc" 2>/dev/null || true
fi

# Executar o script real
cd "/Users/leonhatori/Documents/GitHub/Untitled"
exec bash "/Users/leonhatori/Documents/GitHub/Untitled/scripts/cron-deploy-prod.sh" "$@"
