package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.OrcamentoRequestDto;
import br.com.ufape.backend.dto.OrcamentoResponseDto;
import br.com.ufape.backend.model.Orcamento;
import br.com.ufape.backend.model.ProviderProfile;
import br.com.ufape.backend.model.Servico;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.OrcamentoRepository;
import br.com.ufape.backend.repository.ServicoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OrcamentoService {

    private final OrcamentoRepository orcamentoRepository;
    private final ServicoRepository servicoRepository;

    public OrcamentoService(OrcamentoRepository orcamentoRepository, ServicoRepository servicoRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.servicoRepository = servicoRepository;
    }

    public OrcamentoResponseDto solicitar(User usuarioAutenticado, OrcamentoRequestDto dto) {
        Servico servico = servicoRepository.findById(dto.servicoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado"));

        ProviderProfile prestador = servico.getPrestador();
        if (prestador == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prestador não encontrado");
        }

        Orcamento orcamento = new Orcamento();
        orcamento.setDescricaoNecessidade(dto.descricaoNecessidade());
        orcamento.setLocalAtendimento(dto.localAtendimento());
        orcamento.setDataOuPeriodoDesejado(dto.dataOuPeriodoDesejado());
        orcamento.setServico(servico);
        orcamento.setPrestador(prestador);
        orcamento.setSolicitante(usuarioAutenticado);

        return toResponseDto(orcamentoRepository.save(orcamento));
    }

    public List<OrcamentoResponseDto> buscarRecebidosPorPrestador(Long usuarioId) {
        return orcamentoRepository.findByPrestadorUserId(usuarioId).stream()
                .map(this::toResponseDto)
                .toList();
    }

    private OrcamentoResponseDto toResponseDto(Orcamento o) {
        return new OrcamentoResponseDto(
                o.getId(),
                o.getDescricaoNecessidade(),
                o.getLocalAtendimento(),
                o.getDataOuPeriodoDesejado(),
                o.getServico().getId(),
                o.getServico().getTitulo(),
                o.getPrestador().getUser().getName(),
                o.getSolicitante().getName(),
                o.getSolicitante().getEmail()
        );
    }
}
