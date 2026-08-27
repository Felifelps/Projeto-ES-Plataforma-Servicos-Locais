package br.com.ufape.backend.model;

import java.math.BigDecimal;

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
    // resposta do prestador para o solicitante
    @Column(name = "valor_resposta", precision = 10, scale = 2)
    private BigDecimal valorResposta;

    @Column(name = "descricao_resposta", columnDefinition = "TEXT")
    private String descricaoResposta;

    @Column(name = "status_resposta", nullable = false, length = 20)
    private String statusResposta = "PENDENTE";

    public Orcamento() {
        // Construtor vazio exigido pelo JPA}
    }    
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
    public BigDecimal getValorResposta() { return valorResposta; }
    public void setValorResposta(BigDecimal valorResposta) { this.valorResposta = valorResposta; }
    public String getDescricaoResposta() { return descricaoResposta; }
    public void setDescricaoResposta(String descricaoResposta) { this.descricaoResposta = descricaoResposta; }
    public String getStatusResposta() { return statusResposta; }
    public void setStatusResposta(String statusResposta) { this.statusResposta = statusResposta; }  
}
