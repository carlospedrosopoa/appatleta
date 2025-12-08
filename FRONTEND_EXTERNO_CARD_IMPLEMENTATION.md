# Implementação de Cards de Partida - Frontend Externo

## Visão Geral

Este documento descreve a implementação completa da funcionalidade de visualização e download de cards promocionais de partidas no frontend externo.

## Endpoint da API

### GET /api/card/partida/[id]

**URL Completa:**
```
https://sua-api.vercel.app/api/card/partida/[ID-DA-PARTIDA]
```

**Autenticação:**
- Requerida
- Header: `Authorization: Bearer [SEU_TOKEN_JWT]`

**Parâmetros:**
- `id` (path): ID da partida
- `refresh` (query, opcional): `"true"` para forçar regeneração (ignora cache)

**Resposta:**
- Content-Type: `image/png`
- Body: Blob/Buffer da imagem PNG (1080x1920px)

## Componente Implementado

### CardPartidaModal

Componente React reutilizável localizado em `src/components/CardPartidaModal.tsx`.

**Props:**
```typescript
interface CardPartidaModalProps {
  isOpen: boolean;
  partidaId: string;
  onClose: () => void;
  forceRefresh?: boolean; // Se true, força regeneração do card
}
```

**Funcionalidades Implementadas:**

✅ **Funcionalidades Obrigatórias:**
- [x] Exibir card em modal/overlay
- [x] Botão de download (salvar PNG)
- [x] Botão para abrir em nova aba
- [x] Loading state durante geração
- [x] Tratamento de erros (401, 404, 400, 500)
- [x] Cleanup de blob URLs (`URL.revokeObjectURL`)

✅ **Funcionalidades Opcionais:**
- [x] Botão "Regenerar Card" (usa `?refresh=true`)
- [ ] Compartilhamento em redes sociais (futuro)
- [ ] Cache local (sessionStorage) (futuro)
- [ ] Preview em miniatura na lista (futuro)

## Tratamento de Erros

O componente trata os seguintes códigos de erro HTTP:

| Código | Tratamento |
|--------|------------|
| **401** | Token inválido/expirado → Mostra mensagem e opção para redirecionar ao login após 2 segundos |
| **404** | Partida não encontrada → Mostra mensagem específica |
| **400** | Partida inválida (menos de 2 atletas) → Mostra mensagem específica |
| **500** | Erro no servidor → Mostra mensagem genérica com opção de tentar novamente |

## Cache

- **Por padrão:** Cache de 1 hora (cards carregam rápido do GCS)
- **Com `?refresh=true`:** Sem cache (força regeneração)
- **Use refresh quando:**
  - Atualizar dados da partida
  - Mudar template do card
  - Debugging

## Dimensões do Card

- **Tamanho:** 1080x1920px (formato vertical/portrait)
- **Formato:** PNG
- **Peso:** ~100-500KB (depende do template e fotos)

## Uso nos Componentes

### MinhasPartidas.tsx

```typescript
import CardPartidaModal from './CardPartidaModal';

// Estado
const [showCardId, setShowCardId] = useState<string | null>(null);

// Botão para abrir modal
<button onClick={() => setShowCardId(p.id)}>
  Ver Card
</button>

// Modal
<CardPartidaModal
  isOpen={showCardId !== null}
  partidaId={showCardId || ''}
  onClose={() => setShowCardId(null)}
  forceRefresh={false}
/>
```

### MinhasPartidasCompacta.tsx

Mesma implementação que `MinhasPartidas.tsx`.

## Exemplo de Uso Completo

```typescript
'use client';

import { useState } from 'react';
import CardPartidaModal from '@/components/CardPartidaModal';

export default function MinhaComponente() {
  const [cardPartidaId, setCardPartidaId] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  return (
    <div>
      {/* Botão para abrir card */}
      <button onClick={() => setCardPartidaId('partida-123')}>
        Ver Card da Partida
      </button>

      {/* Botão para regenerar card */}
      <button onClick={() => {
        setForceRefresh(true);
        setCardPartidaId('partida-123');
      }}>
        Regenerar Card
      </button>

      {/* Modal do Card */}
      <CardPartidaModal
        isOpen={cardPartidaId !== null}
        partidaId={cardPartidaId || ''}
        onClose={() => {
          setCardPartidaId(null);
          setForceRefresh(false);
        }}
        forceRefresh={forceRefresh}
      />
    </div>
  );
}
```

## Função de Carregamento (Interna)

O componente usa internamente a função `loadCard`:

```typescript
const loadCard = async (id: string, refresh = false) => {
  setLoading(true);
  setError(null);
  
  try {
    const endpoint = `/card/partida/${id}${refresh ? '?refresh=true' : ''}`;
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'image/png' });
    const imageUrl = URL.createObjectURL(blob);
    setCardUrl(imageUrl);
  } catch (err: any) {
    // Tratamento de erros específicos
    const status = err.status || err.response?.status || 500;
    // ... tratamento por código de status
  } finally {
    setLoading(false);
  }
};
```

## Gerenciamento de Memória

O componente gerencia automaticamente os blob URLs para evitar vazamentos de memória:

```typescript
// Cleanup quando componente desmonta ou fecha
useEffect(() => {
  return () => {
    if (cardUrl) {
      URL.revokeObjectURL(cardUrl);
    }
  };
}, [cardUrl]);

// Cleanup ao fechar modal
const handleClose = () => {
  if (cardUrl) {
    URL.revokeObjectURL(cardUrl);
    setCardUrl(null);
  }
  onClose();
};
```

## Integração com API Client

O componente usa o cliente API existente (`src/lib/api.ts`) que já suporta:
- Autenticação automática via JWT
- Tratamento de blob responses
- Headers apropriados

## Estados do Componente

| Estado | Descrição |
|-------|-----------|
| `loading` | Card está sendo gerado/carregado |
| `error` | Mensagem de erro (se houver) |
| `errorCode` | Código HTTP do erro |
| `cardUrl` | Blob URL do card carregado |

## Melhorias Futuras

1. **Compartilhamento em Redes Sociais:**
   - Integração com Web Share API
   - Botões específicos para WhatsApp, Instagram, etc.

2. **Cache Local:**
   - Usar `sessionStorage` para cachear cards durante a sessão
   - Reduzir requisições repetidas

3. **Preview em Miniatura:**
   - Mostrar thumbnail do card na lista de partidas
   - Carregar card completo ao clicar

4. **Otimizações:**
   - Lazy loading de imagens
   - Progressive image loading
   - Compressão adicional no frontend (se necessário)

## Documentação Relacionada

- **API Completa:** `API_DOCUMENTATION.md`
- **Implementação Backend:** `IMPLEMENTACAO_CARD_URL.md`
- **Migração Banco de Dados:** `MIGRACAO_CARD_URL.sql`

## Notas Técnicas

- O componente é totalmente client-side (`'use client'`)
- Usa Tailwind CSS para estilização
- Compatível com React 19 e Next.js 16
- Suporta responsividade mobile e desktop
- Animações suaves com Tailwind `animate-in`

