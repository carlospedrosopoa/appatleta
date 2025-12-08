# 🧪 Como Testar PWA Durante o Desenvolvimento

## 📋 Resumo

**Por padrão:** PWA está **desabilitado** em desenvolvimento (`npm run dev`) para facilitar o debug.

**Para testar PWA em dev:** Você pode habilitar adicionando uma variável de ambiente.

---

## 🚀 Opção 1: Testar PWA em Desenvolvimento (Recomendado para testes rápidos)

### Passo 1: Adicionar variável no `.env.local`

Adicione esta linha no arquivo `.env.local`:

```env
ENABLE_PWA_DEV=true
```

### Passo 2: Reiniciar o servidor

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

### Passo 3: Testar

1. Acesse `http://localhost:3001`
2. Abra DevTools (F12) → **Application** → **Service Workers**
3. Você deve ver o Service Worker registrado
4. No mobile, acesse pelo IP da sua máquina (ex: `http://192.168.1.X:3001`)
5. Deve aparecer opção para instalar o app

**⚠️ Importante:**
- Service Worker pode causar cache durante desenvolvimento
- Se tiver problemas, desabilite removendo `ENABLE_PWA_DEV=true` do `.env.local`

---

## 🏗️ Opção 2: Testar PWA em Build de Produção (Recomendado para testes finais)

### Passo 1: Fazer build

```bash
npm run build
```

### Passo 2: Iniciar servidor de produção

```bash
npm start
```

### Passo 3: Testar

1. Acesse `http://localhost:3001`
2. Service Worker estará ativo automaticamente
3. No mobile, acesse pelo IP da sua máquina
4. Deve aparecer opção para instalar o app

**✅ Vantagens:**
- Comportamento idêntico à produção
- Sem problemas de cache durante desenvolvimento
- Melhor para testes finais antes do deploy

---

## 📱 Como Testar no Mobile

### Android (Chrome)

1. **Descobrir IP da máquina:**
   ```bash
   # Windows PowerShell
   ipconfig
   # Procure por "IPv4 Address" (ex: 192.168.1.100)
   ```

2. **No smartphone:**
   - Abra Chrome
   - Acesse `http://SEU_IP:3001` (ex: `http://192.168.1.100:3001`)
   - Deve aparecer banner "Adicionar à tela inicial"
   - Ou menu (3 pontos) → "Instalar app"

### iOS (Safari)

1. **Descobrir IP da máquina:**
   ```bash
   # Windows PowerShell
   ipconfig
   # Procure por "IPv4 Address"
   ```

2. **No iPhone:**
   - Abra Safari
   - Acesse `http://SEU_IP:3001`
   - Compartilhar (ícone de compartilhar) → "Adicionar à Tela de Início"

---

## 🔍 Verificações

### Service Worker está funcionando?

1. Abra DevTools (F12)
2. Vá em **Application** → **Service Workers**
3. Deve mostrar: "Service Worker is running and registered"

### Manifest está carregando?

1. DevTools → **Application** → **Manifest**
2. Deve mostrar informações do app (nome, ícones, etc.)

### App pode ser instalado?

1. DevTools → **Application** → **Manifest**
2. Verifique se não há erros
3. No mobile, deve aparecer opção de instalação

---

## ⚠️ Troubleshooting

### Service Worker não registra em dev

**Causa:** PWA pode estar desabilitado

**Solução:**
1. Verifique se `ENABLE_PWA_DEV=true` está no `.env.local`
2. Reinicie o servidor (`npm run dev`)
3. Limpe cache do navegador (Ctrl+Shift+Delete)

### Erro "Service Worker registration failed"

**Causa:** Pode ser problema de HTTPS/localhost

**Solução:**
- Use `localhost` ou `127.0.0.1` (não use IP externo em dev)
- Em produção, use HTTPS

### App não instala no mobile

**Verificações:**
1. ✅ Service Worker está registrado?
2. ✅ Manifest.json está válido?
3. ✅ Ícones existem (`icon-192x192.png` e `icon-512x512.png`)?
4. ✅ Está acessando via HTTPS ou localhost/IP local?

### Cache persistente durante desenvolvimento

**Solução:**
1. Desabilite PWA em dev (remova `ENABLE_PWA_DEV=true`)
2. Ou limpe cache: DevTools → **Application** → **Storage** → **Clear site data**

---

## 📝 Recomendações

### Durante Desenvolvimento Normal
- ✅ **Mantenha PWA desabilitado** (padrão)
- ✅ Use `npm run dev` normalmente
- ✅ Desabilite cache no DevTools (Network → "Disable cache")

### Quando Precisar Testar PWA
- ✅ **Opção 1:** Adicione `ENABLE_PWA_DEV=true` e use `npm run dev`
- ✅ **Opção 2:** Use `npm run build && npm start` (mais próximo da produção)

### Antes do Deploy
- ✅ **Sempre teste com build de produção** (`npm run build && npm start`)
- ✅ Teste instalação no mobile
- ✅ Verifique Service Worker funcionando

---

## 🎯 Resumo Rápido

| Situação | Comando | PWA Ativo? |
|----------|---------|------------|
| Desenvolvimento normal | `npm run dev` | ❌ Não (padrão) |
| Testar PWA em dev | `ENABLE_PWA_DEV=true` + `npm run dev` | ✅ Sim |
| Teste final antes deploy | `npm run build && npm start` | ✅ Sim |
| Produção (Vercel) | Deploy automático | ✅ Sim |

---

**✅ Agora você pode testar PWA durante o desenvolvimento quando necessário!**

