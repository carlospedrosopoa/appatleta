# 📱 Implementação PWA - Passo a Passo

## 🎯 Objetivo

Transformar o App Atleta em um Progressive Web App (PWA) instalável no smartphone.

---

## 📦 Passo 1: Instalar Dependências

```bash
npm install next-pwa
```

---

## ⚙️ Passo 2: Configurar next.config.ts

```typescript
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Desabilita em dev para facilitar debug
});

export default pwaConfig(nextConfig);
```

---

## 📄 Passo 3: Criar manifest.json

Criar arquivo `public/manifest.json`:

```json
{
  "name": "App Atleta",
  "short_name": "Atleta",
  "description": "App para gerenciar agendamentos e partidas de tênis",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 🎨 Passo 4: Criar Ícones

Precisa criar dois ícones:
- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)

**Ferramentas para criar ícones:**
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Design no Figma/Photoshop e exportar

---

## 📱 Passo 5: Atualizar Layout com Meta Tags Mobile

Atualizar `src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import MenuWrapper from "@/components/MenuWrapper";

export const metadata: Metadata = {
  title: "App Atleta",
  description: "App para gerenciar agendamentos e partidas de tênis",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "App Atleta",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="App Atleta" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <MenuWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🧪 Passo 6: Testar

1. **Build do projeto:**
   ```bash
   npm run build
   npm start
   ```

2. **Acessar no mobile:**
   - Abra o navegador no smartphone
   - Acesse a URL do app
   - Deve aparecer opção "Adicionar à tela inicial" ou "Instalar app"

3. **Verificar instalação:**
   - App deve aparecer como ícone na tela inicial
   - Deve abrir em modo standalone (sem barra do navegador)

---

## ✅ Checklist de Implementação

- [ ] Instalar `next-pwa`
- [ ] Configurar `next.config.ts`
- [ ] Criar `public/manifest.json`
- [ ] Criar ícones (192x192 e 512x512)
- [ ] Atualizar `layout.tsx` com meta tags
- [ ] Testar build (`npm run build`)
- [ ] Testar instalação no mobile
- [ ] Verificar Service Worker funcionando

---

## 🐛 Troubleshooting

### Service Worker não registra
- Verifique se está em HTTPS ou localhost
- Verifique console do navegador para erros

### Ícone não aparece
- Verifique se os arquivos estão em `public/`
- Verifique se os caminhos no manifest.json estão corretos

### App não instala
- Verifique se manifest.json está válido
- Verifique se Service Worker está registrado
- Teste em diferentes navegadores (Chrome, Safari)

---

## 📚 Próximos Passos

Após PWA básico funcionando:
1. **Bottom Navigation** - Navegação mobile-friendly
2. **Offline Mode** - Cache de dados essenciais
3. **Push Notifications** - Notificações de agendamentos
4. **Performance** - Otimizações mobile

