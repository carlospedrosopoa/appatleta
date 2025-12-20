// types/domain.ts
export interface Atleta {
  id: string;
  nome: string;
  dataNascimento?: string;
  genero?: string;
  fone?: string;
  categoria?: string;
  idade?: number;
  fotoUrl?: string;
  usuarioId?: string;
  pointIdPrincipal?: string | null;
  arenasFrequentes?: Array<{
    id: string;
    nome: string;
    logoUrl?: string | null;
  }>;
  arenaPrincipal?: {
    id: string;
    nome: string;
    logoUrl?: string | null;
  } | null;
}

export interface Partida {
  id: string;
  data: string;
  local: string;
  atleta1?: Atleta;
  atleta2?: Atleta;
  atleta3?: Atleta;
  atleta4?: Atleta;
  gamesTime1: number | null;
  gamesTime2: number | null;
  tiebreakTime1?: number | null;
  tiebreakTime2?: number | null;
  cardUrl?: string | null; // URL do card gerado no Google Cloud Storage (null quando não gerado ou invalidado)
  cardGeradoEm?: string | null; // Timestamp de quando o card foi gerado/atualizado
  cardVersao?: number; // Versão do card (incrementa quando regenerado)
  panelinhas?: Array<{
    id: string;
    nome: string;
    esporte?: string;
  }>; // Panelinhas vinculadas a esta partida
}



