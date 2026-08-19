package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.OrcamentoRequestDto;
import br.com.ufape.backend.dto.OrcamentoResponderRequestDto;
import br.com.ufape.backend.dto.OrcamentoResponseDto;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.service.OrcamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/orcamentos")
public class OrcamentoController {

    private final OrcamentoService orcamentoService;

    public OrcamentoController(OrcamentoService orcamentoService) {
        this.orcamentoService = orcamentoService;
    }

    @PostMapping
    public ResponseEntity<OrcamentoResponseDto> solicitar(
            @AuthenticationPrincipal User usuarioAutenticado,
            @RequestBody @Valid OrcamentoRequestDto dto) {

        OrcamentoResponseDto orcamento = orcamentoService.solicitar(usuarioAutenticado, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(orcamento);
    }

    // Lista as solicitações de orçamento recebidas pelo prestador autenticado
    @GetMapping("/recebidos")
    public ResponseEntity<List<OrcamentoResponseDto>> listarRecebidos(
            @AuthenticationPrincipal User usuarioAutenticado) {

        List<OrcamentoResponseDto> recebidos = orcamentoService.buscarRecebidosPorPrestador(usuarioAutenticado.getId());
        return ResponseEntity.ok(recebidos);
    }
    // responde a uma solicitaçao de orçamento 
    @PutMapping("/{id}/responder")
    public ResponseEntity<OrcamentoResponseDto> responderOrcamento(
            @PathVariable Long id,
            @AuthenticationPrincipal User usuarioAutenticado,
            @RequestBody @Valid OrcamentoResponderRequestDto dto) {
        
        OrcamentoResponseDto orcamentoRespondido = orcamentoService.responder(id, usuarioAutenticado, dto);
        
        return ResponseEntity.ok(orcamentoRespondido);
    }

    @GetMapping("/solicitados")
    //Lista as solicitações de orçamento feitas pelo cliente autenticado
    public ResponseEntity<List<OrcamentoResponseDto>> listarSolicitados(
        @AuthenticationPrincipal User usuarioAutenticado) {
    
    // Chama o service passando o ID do usuário autenticado (cliente)
    List<OrcamentoResponseDto> solicitados = orcamentoService.buscarSolicitadosPorCliente(usuarioAutenticado.getId());
    return ResponseEntity.ok(solicitados);
}
    @PutMapping("/{id}/aceitar")
    public ResponseEntity<OrcamentoResponseDto> aceitarOrcamento(
            @PathVariable Long id,
            @AuthenticationPrincipal User usuarioAutenticado) {
        
        OrcamentoResponseDto orcamentoAceito = orcamentoService.aceitar(id, usuarioAutenticado);
        return ResponseEntity.ok(orcamentoAceito);
    }

    @PutMapping("/{id}/recusar")
    public ResponseEntity<OrcamentoResponseDto> recusarOrcamento(
            @PathVariable Long id,
            @AuthenticationPrincipal User usuarioAutenticado) {
        
        OrcamentoResponseDto orcamentoRecusado = orcamentoService.recusar(id, usuarioAutenticado);
        return ResponseEntity.ok(orcamentoRecusado);
    }
}
