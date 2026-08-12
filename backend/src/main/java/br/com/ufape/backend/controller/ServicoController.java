package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.ServicoRequestDto;
import br.com.ufape.backend.model.Servico;
import br.com.ufape.backend.service.ServicoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.ufape.backend.dto.ServicoResumoResponseDto;
import br.com.ufape.backend.dto.ServicoDetalheResponseDto;
import java.util.List;

@RestController
@RequestMapping("/servicos")
public class ServicoController {

    @Autowired
    private ServicoService servicoService;

    @PostMapping
    public ResponseEntity<Servico> cadastrar(@RequestBody @Valid ServicoRequestDto dto) {
        Servico servicoSalvo = servicoService.cadastrarServico(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(servicoSalvo);
    }
    

    @GetMapping
    public ResponseEntity<List<ServicoResumoResponseDto>> buscarServicos(
        @RequestParam(required = false) String categoria,
        @RequestParam(required = false) String cidade,
        @RequestParam(required = false) String bairro) {
    
        List<ServicoResumoResponseDto> resultados = servicoService.buscar(categoria, cidade, bairro);
        return ResponseEntity.ok(resultados);
}

    @GetMapping("/{id}")
    public ResponseEntity<ServicoDetalheResponseDto> buscarDetalhes(@PathVariable Long id) {    
    // Busca pelo ID, se não achar lança exceção (que o Spring converte para 404)
        ServicoDetalheResponseDto detalhe = servicoService.buscarPorId(id);
        return ResponseEntity.ok(detalhe);
}       
}