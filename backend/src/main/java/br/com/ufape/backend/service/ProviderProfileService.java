package br.com.ufape.backend.service;

import br.com.ufape.backend.dto.ProviderProfileRequestDto;
import br.com.ufape.backend.dto.ProviderProfileResponseDto;
import br.com.ufape.backend.enums.UserRole;
import br.com.ufape.backend.exception.InvalidServiceCategoryException;
import br.com.ufape.backend.exception.ProviderProfileAlreadyExistsException;
import br.com.ufape.backend.exception.UserNotFoundException; // Certifique-se de importar ou tratar a exceção
import br.com.ufape.backend.model.ProviderProfile;
import br.com.ufape.backend.model.ServiceCategory;
import br.com.ufape.backend.model.User;
import br.com.ufape.backend.repository.ProviderProfileRepository;
import br.com.ufape.backend.repository.ServiceCategoryRepository;
import br.com.ufape.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProviderProfileService {

    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final UserRepository userRepository;

    public ProviderProfileService(
            ProviderProfileRepository providerProfileRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            UserRepository userRepository
    ) {
        this.providerProfileRepository = providerProfileRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional // Garante que o perfil E a role do usuário sejam persistidos juntos no banco
    public ProviderProfileResponseDto criar(User usuarioAutenticado, ProviderProfileRequestDto dto) {
        validatePerfilInexistente(usuarioAutenticado.getId());

        // Busca a instância gerenciada (managed) do usuário no banco para garantir o UPDATE do papel
        User userManaged = userRepository.findById(usuarioAutenticado.getId())
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        ProviderProfile profile = new ProviderProfile();
        profile.setUser(userManaged);
        profile.setDocument(dto.document());
        profile.setPhones(dto.phones());
        profile.setServiceAreas(dto.serviceAreas());
        profile.setDescription(dto.description());
        profile.setCategories(resolveCategories(dto.categories()));

        profile = providerProfileRepository.save(profile);

        userManaged.setRole(UserRole.PRESTADOR);
        userRepository.save(userManaged);

        return ProviderProfileResponseDto.fromEntity(profile);
    }

    private void validatePerfilInexistente(Long userId) {
        if (providerProfileRepository.existsByUserId(userId)) {
            throw new ProviderProfileAlreadyExistsException();
        }
    }

    private Set<ServiceCategory> resolveCategories(List<String> categoryNames) {
        List<ServiceCategory> found = serviceCategoryRepository.findByNameIn(categoryNames);

        Set<String> foundNames = found.stream()
                .filter(Objects::nonNull)
                .map(category -> category.getName())
                .collect(Collectors.toSet());

        for (String name : categoryNames) {
            if (!foundNames.contains(name)) {
                throw new InvalidServiceCategoryException(name);
            }
        }

        return new HashSet<>(found);
    }
}