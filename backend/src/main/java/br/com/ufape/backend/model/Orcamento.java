package br.com.ufape.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "orcamentos")
public class Orcamento {

    @Id
    @SequenceGenerator(name = "orcamento_id_seq", allocationSize = 1)
    @GeneratedValue(generator = "orcamento_id_seq", strategy = GenerationType.SEQUENCE)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "descricao_necessidade", nullable = false, columnDefinition = "TEXT")
    private String descricaoNecessidade;

    @Column(name = "local_atendimento", nullable = false)
    private String localAtendimento;

    @Column(name = "data_ou_periodo_desejado", nullable = false)
    private String dataOuPeriodoDesejado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_profile_id", nullable = false)
    private ProviderProfile prestador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitante_id", nullable = false)
    private User solicitante;

    public Orcamento() {}

    public Long getId() { return id; }
    public String getDescricaoNecessidade() { return descricaoNecessidade; }
    public void setDescricaoNecessidade(String descricaoNecessidade) { this.descricaoNecessidade = descricaoNecessidade; }
    public String getLocalAtendimento() { return localAtendimento; }
    public void setLocalAtendimento(String localAtendimento) { this.localAtendimento = localAtendimento; }
    public String getDataOuPeriodoDesejado() { return dataOuPeriodoDesejado; }
    public void setDataOuPeriodoDesejado(String dataOuPeriodoDesejado) { this.dataOuPeriodoDesejado = dataOuPeriodoDesejado; }
    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }
    public ProviderProfile getPrestador() { return prestador; }
    public void setPrestador(ProviderProfile prestador) { this.prestador = prestador; }
    public User getSolicitante() { return solicitante; }
    public void setSolicitante(User solicitante) { this.solicitante = solicitante; }
}
