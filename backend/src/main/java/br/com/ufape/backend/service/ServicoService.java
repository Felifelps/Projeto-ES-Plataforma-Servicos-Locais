package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.ServicoRequestDto;
import br.com.ufape.backend.model.ProviderProfile;
import br.com.ufape.backend.model.ServiceCategory;
import br.com.ufape.backend.model.Servico;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.ProviderProfileRepository;
import br.com.ufape.backend.repository.ServiceCategoryRepository;
import br.com.ufape.backend.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.stream.Collectors;
import br.com.ufape.backend.dto.ServicoResumoResponseDto;
import br.com.ufape.backend.dto.ServicoDetalheResponseDto;

@Service
public class ServicoService {

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private ServiceCategoryRepository categoryRepository;

    public Servico cadastrarServico(ServicoRequestDto dto) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        User usuarioLogado = (User) authentication.getPrincipal();

        ProviderProfile prestador = providerProfileRepository.findByUser(usuarioLogado)
                .orElseThrow(() -> new RuntimeException("Perfil de prestador não encontrado para este usuário."));

        ServiceCategory categoria = categoryRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada."));

       
        Servico servico = new Servico();
        servico.setTitulo(dto.titulo());
        servico.setDescricao(dto.descricao());
        servico.setLocalizacao(dto.localizacao());
        servico.setAreaAtendimento(dto.areaAtendimento());
        servico.setFormaCobranca(dto.formaCobranca());
        servico.setCategoria(categoria);
        servico.setPrestador(prestador);

        return servicoRepository.save(servico);
    }

    public List<ServicoResumoResponseDto> buscar(String categoria, String cidade, String bairro) {
    String categoriaLower = categoria != null ? categoria.toLowerCase() : null;
    String cidadeLike = cidade != null ? "%" + cidade.toLowerCase() + "%" : null;
    String bairroLike = bairro != null ? "%" + bairro.toLowerCase() + "%" : null;
    List<Servico> servicos = servicoRepository.buscarComFiltrosOpcionais(categoriaLower, cidadeLike, bairroLike);

    return servicos.stream().map(s -> new ServicoResumoResponseDto(
            s.getId(),
            s.getTitulo(),
            s.getCategoria().getName(),
            s.getLocalizacao(), 
            s.getAreaAtendimento(), 
            s.getPrestador().getUser().getName()
    )).collect(Collectors.toList());
}

    public ServicoDetalheResponseDto buscarPorId(Long id) {
    Servico s = servicoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado"));

    return new ServicoDetalheResponseDto(
            s.getId(),
            s.getTitulo(),
            s.getDescricao(),
            s.getCategoria().getName(),
            s.getLocalizacao(),
            s.getAreaAtendimento(),
            s.getFormaCobranca(),
            s.getPrestador().getUser().getName(),
            s.getPrestador().getPhones().isEmpty() ? "Não informado" : s.getPrestador().getPhones().get(0),
            s.getPrestador().getDescription()
    );
}

    
}