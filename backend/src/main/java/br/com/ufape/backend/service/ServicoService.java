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
}