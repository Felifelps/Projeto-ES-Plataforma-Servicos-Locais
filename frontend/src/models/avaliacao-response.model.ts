export interface AvaliacaoResponse {
  id: number;
  nota: number;
  comentario?: string | null;
  servicoId: number;
  prestadorId: number;
  usuarioId: number;
  createdAt: string;
}
