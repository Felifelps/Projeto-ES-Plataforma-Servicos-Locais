package br.com.ufape.backend.controller;

import br.com.ufape.backend.dto.ServicoRequestDto;
import br.com.ufape.backend.model.Servico;
import br.com.ufape.backend.service.ServicoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}