import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Configuração Turbopack vazia para silenciar aviso
  // next-pwa adiciona webpack config, mas Next.js 16 usa Turbopack por padrão
  turbopack: {},
  // Reduzir logs do Next.js em desenvolvimento
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

// Permite habilitar PWA em desenvolvimento através da variável ENABLE_PWA_DEV
// Por padrão, PWA fica desabilitado em dev para facilitar debug
// Para testar PWA em dev: adicione ENABLE_PWA_DEV=true no .env.local
const enablePWAInDev = process.env.ENABLE_PWA_DEV === 'true';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' && !enablePWAInDev, // Desabilita em dev, exceto se ENABLE_PWA_DEV=true
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
