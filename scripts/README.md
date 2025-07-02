# Scripts de Deploy

## 🚀 Como usar

### 1. Deploy Interativo (Recomendado)
```bash
npm run deploy
```
- Pergunta se quer commitar mudanças
- Permite escolher mensagem de commit
- Verifica branch atual
- Faz push e deploy na Vercel

### 2. Deploy Simples
```bash
npm run deploy:simple
```
- Commita automaticamente com mensagem padrão
- Muda para branch clarissa
- Faz push e deploy

### 3. Deploy Automático
```bash
npm run deploy:auto
```
- Totalmente automático
- Usa mensagem de commit padrão
- Ideal para CI/CD

### 4. Deploy com Mensagem Customizada
```bash
./scripts/deploy-simple.sh "feat: nova funcionalidade"
```

## 📋 O que os scripts fazem:

1. ✅ **Verificam mudanças** não commitadas
2. ✅ **Fazem commit** (se necessário)
3. ✅ **Mudam para branch clarissa** (se necessário)
4. ✅ **Push para git** repository
5. ✅ **Instalam Vercel CLI** (se necessário)
6. ✅ **Deploy na Vercel** em produção
7. ✅ **Mostram URLs** finais

## 🛠️ Pré-requisitos:

- Git configurado
- Node.js e npm instalados
- Acesso ao repositório GitHub
- Conta Vercel configurada (será solicitado login na primeira vez)

## 🎯 Resultado:

Após executar qualquer script:
- 🌐 Site atualizado em: https://clini.one
- 📊 Dashboard: https://vercel.com/dashboard 