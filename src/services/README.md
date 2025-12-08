# 📦 Serviços do Frontend

Este diretório contém serviços centralizados para comunicação com a API externa, baseados na documentação `DOCUMENTACAO_API_FRONTEND_EXTERNO.md`.

## 📚 Serviços Disponíveis

### 1. `partidaService.ts`
Serviço para gerenciar partidas de tênis.

```typescript
import { partidaService } from '@/services/partidaService';

// Listar todas as partidas
const partidas = await partidaService.listar();

// Criar nova partida
const novaPartida = await partidaService.criar({
  data: '2024-01-15T14:00:00.000Z',
  local: 'Arena Exemplo - Quadra 1',
  atleta1Id: 'uuid',
  atleta2Id: 'uuid',
});

// Atualizar placar
const partidaAtualizada = await partidaService.atualizarPlacar(partidaId, {
  gamesTime1: 6,
  gamesTime2: 4,
});

// Obter card da partida
const cardBlob = await partidaService.obterCard(partidaId, false);
```

### 2. `atletaService.ts`
Serviço para gerenciar perfis de atletas.

```typescript
import { atletaService } from '@/services/atletaService';

// Obter perfil do atleta logado
const meuPerfil = await atletaService.obterMeuPerfil();
// Retorna null se não tiver atleta cadastrado (status 204)

// Criar perfil de atleta
const novoAtleta = await atletaService.criar({
  nome: 'João Silva',
  dataNascimento: '1990-01-01',
  categoria: 'A',
  genero: 'MASCULINO',
});

// Atualizar perfil
const atletaAtualizado = await atletaService.atualizar(atletaId, {
  categoria: 'B',
});

// Listar atletas para seleção (em formulários)
const atletas = await atletaService.listarParaSelecao('João');
```

### 3. `agendamentoService.ts`
Serviço para gerenciar agendamentos, arenas e quadras.

```typescript
import { 
  agendamentoService, 
  pointService, 
  quadraService 
} from '@/services/agendamentoService';

// Listar arenas ativas (sempre use apenasAtivos=true)
const arenas = await pointService.listar(true);

// Listar quadras de uma arena
const quadras = await quadraService.listar(arenaId);

// Listar agendamentos
const agendamentos = await agendamentoService.listar({
  pointId: arenaId,
  apenasMeus: true,
  status: 'CONFIRMADO',
});

// Criar agendamento
const novoAgendamento = await agendamentoService.criar({
  quadraId: 'uuid',
  dataHora: '2024-01-15T14:00',
  duracao: 60,
});
```

## 🔄 Migração de Componentes

**Antes (chamadas diretas):**
```typescript
const res = await api.get('/partida/listarPartidas');
const partidas = res.data;
```

**Depois (usando serviços):**
```typescript
import { partidaService } from '@/services/partidaService';
const partidas = await partidaService.listar();
```

## ✅ Benefícios

1. **Centralização**: Todas as chamadas de API em um só lugar
2. **Documentação**: Cada método tem comentários explicando o endpoint
3. **Type Safety**: TypeScript com tipos bem definidos
4. **Manutenibilidade**: Fácil atualizar quando a API mudar
5. **Consistência**: Padrão único para todas as chamadas

## 📖 Referência

Para detalhes completos dos endpoints, consulte:
- `DOCUMENTACAO_API_FRONTEND_EXTERNO.md` (raiz do projeto)

