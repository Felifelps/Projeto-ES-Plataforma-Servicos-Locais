import type { ServicoPrestadorItem } from '../../../models/servico-prestador.model';
import {
  type StatusServico,
  STATUS_SERVICO_LABELS,
  TRANSOES_PERMITIDAS,
} from '../../../models/servico-status.enum';

interface Props {
  servico: ServicoPrestadorItem;
  processandoId: number | null;
  onAtualizarStatus: (id: number, novoStatus: StatusServico) => void;
}

export default function ServicoPrestadorCard({
  servico,
  processandoId,
  onAtualizarStatus,
}: Props) {
  const transicoesPossiveis = TRANSOES_PERMITIDAS[servico.status] || [];
  const estaCarregando = processandoId === servico.id;

  return (
    <div className="servico-prestador-card">
      <div className="card-header">
        <div>
          <h3>{servico.titulo}</h3>
          <span className="categoria-badge">{servico.categoria}</span>
        </div>
        <span className={`status-tag status-${servico.status.toLowerCase()}`}>
          {STATUS_SERVICO_LABELS[servico.status] || servico.status}
        </span>
      </div>

      <div className="card-body">
        <p><strong>Localização:</strong> {servico.bairro} - {servico.cidade}</p>
        <p><strong>Forma de Cobrança:</strong> {servico.formaCobranca.replace(/_/g, ' ')}</p>
        {servico.nomeCliente && (
          <p><strong>Cliente:</strong> {servico.nomeCliente}</p>
        )}
        {servico.telefoneCliente && (
          <p><strong>Contato do Cliente:</strong> {servico.telefoneCliente}</p>
        )}
      </div>

      <div className="card-acoes">
        {transicoesPossiveis.length > 0 ? (
          transicoesPossiveis.map((proximoStatus) => (
            <button
              key={proximoStatus}
              type="button"
              className={`btn-status btn-${proximoStatus.toLowerCase()}`}
              disabled={estaCarregando}
              onClick={() => onAtualizarStatus(servico.id, proximoStatus)}
            >
              {estaCarregando
                ? 'Atualizando...'
                : `Mudar para ${STATUS_SERVICO_LABELS[proximoStatus] || proximoStatus}`}
            </button>
          ))
        ) : (
          <span className="text-muted">Nenhuma ação disponível para este status</span>
        )}
      </div>
    </div>
  );
}