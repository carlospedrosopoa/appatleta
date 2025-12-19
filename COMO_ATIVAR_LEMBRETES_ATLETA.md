# Como o Atleta Ativa Lembretes de Agendamento

## Passo a Passo para o Atleta

### 1. Acessar o Perfil

1. Faça login no appatleta
2. Vá para **Meu Perfil** (menu ou página `/app/atleta/perfil`)

### 2. Editar Perfil do Atleta

1. Na seção **"Dados de Atleta"**, clique no botão **"Editar"** (botão verde)
2. Isso abrirá o modal de edição do perfil

### 3. Ativar Lembretes

No modal de edição, você verá:

- **Esporte Preferido** (select)
- **Esportes que Pratica** (checkboxes)
- **Aceitar receber lembretes de agendamento via WhatsApp** (checkbox) ← **AQUI!**
- **Arena mais próxima da sua casa** (select)
- **Arenas que você frequenta** (checkboxes)

**Para ativar:**
1. Marque o checkbox **"Aceitar receber lembretes de agendamento via WhatsApp"**
2. Clique em **"Salvar Alterações"**

### 4. Verificar Status

Após salvar, na visualização do perfil você verá:

- **Lembretes de Agendamento**: ✓ Ativado (verde) ou Desativado (cinza)
- Mensagem explicativa sobre o status

## Requisitos

Para receber lembretes, é necessário:

1. ✅ **Atleta deve ter ativado** `aceitaLembretesAgendamento = true`
2. ✅ **Arena deve estar configurada** para enviar lembretes:
   - `enviarLembretesAgendamento = true`
   - `antecedenciaLembrete` definido (ex: 8 horas)
   - Gzappy configurado e ativo na arena
3. ✅ **Atleta deve ter telefone cadastrado** (`atleta.fone`)
4. ✅ **Agendamento deve estar confirmado** (`status = 'CONFIRMADO'`)

## Por Padrão

- **Padrão**: `aceitaLembretesAgendamento = false` (não aceita)
- O atleta precisa **ativar manualmente** no perfil
- Isso garante que apenas quem quer receber lembretes os receberá

## Localização no Código

- **Interface**: `appatleta/src/app/app/atleta/perfil/page.tsx`
- **Modal de Edição**: Componente `ModalEditarAtleta`
- **Checkbox**: Linha ~643-655
- **Visualização**: Linha ~1009-1025

