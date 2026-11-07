# Bioestatística II, Engenharia I, Variantes, RNA-seq, Pipelines, Metagenômica

@@ EST2:0
> **O que esperar:** escrever qualquer desenho experimental como modelo linear — matriz de design, codificação de fatores, contrastes e interações. Base: PH525x (linear models, design formula), MSMB cap. 8.

### Conceitos
- y = Xβ + ε. **Matriz de design X:** uma linha por amostra, uma coluna por parâmetro.
- **Codificação de tratamento (padrão no R):** intercepto = nível de referência; coeficiente = diferença para a referência. `relevel()` muda a referência.
- **Covariável:** `~ lote + condicao` estima a condição ajustada pelo lote.
- **Interação** `~ genotipo * tratamento`: o efeito do tratamento muda conforme o genótipo; o coeficiente de interação é a “diferença das diferenças”.
- **Contraste:** combinação linear de coeficientes (ex.: B − C quando A é a referência).
- `~ 0 + grupo`: sem intercepto, um coeficiente por grupo (cômodo para contrastes).

### Código
```r
d <- data.frame(cond = factor(c("ctl","ctl","trt","trt")), lote = factor(c(1,2,1,2)))
model.matrix(~ lote + cond, d)
model.matrix(~ geno * trat, d2)
fit <- lm(y ~ lote + cond, d); summary(fit)
library(limma); design <- model.matrix(~ 0 + grupo); makeContrasts(grupoB - grupoC, levels = design)
```

### Armadilhas
- Matriz não de posto completo (lote perfeitamente confundido com condição) → coeficientes `NA`.
- Interpretar o efeito principal na presença de interação (ele vale só no nível de referência).

@@ EST2:1
> **O que esperar:** generalizar a regressão para desfechos binários e contagens — função de ligação, máxima verossimilhança, deviance e sobredispersão. Base: StatQuest (logística, GLM, ML), MSMB cap. 8.

### Conceitos
- GLM: g(E[y]) = Xβ. **Logística:** binário, ligação logit, exp(β) = **odds ratio**. **Poisson:** contagens, ligação log, exp(β) = razão de taxas; supõe variância = média.
- **Binomial negativa:** variância = μ + α·μ² (α = dispersão) — modela réplicas biológicas de RNA-seq.
- Estimação por **máxima verossimilhança**; comparação de modelos por **deviance**/teste de razão de verossimilhança, AIC.
- **Offset** (log do tamanho da biblioteca) transforma contagem em taxa.

### Código
```r
glm(doente ~ idade + sexo, family = binomial, data = d) |> summary()
m_p <- glm(count ~ cond + offset(log(libsize)), family = poisson, data = g)
deviance(m_p) / df.residual(m_p)          # >> 1 → sobredispersão
library(MASS); m_nb <- glm.nb(count ~ cond + offset(log(libsize)), data = g)
AIC(m_p, m_nb); anova(m_reduzido, m_nb)
```

### Armadilhas
- Poisson em dados sobredispersos dá p-valores pequenos demais.
- Separação perfeita em logística → coeficientes enormes (use penalização/Firth).

@@ EST2:2
> **O que esperar:** controlar falsos positivos quando se testam milhares de hipóteses (genes, variantes, táxons). Base: MSMB cap. 6, Points of Significance (comparações múltiplas).

### Conceitos
- 20 000 testes com α = 0,05 sob H0 → ~1 000 falsos positivos.
- **FWER** (P de ≥1 falso positivo): **Bonferroni** α/m (conservador), Holm (melhor, mesmo controle).
- **FDR** (fração esperada de falsos entre os descobertos): **Benjamini-Hochberg** — ordene p, ache o maior k com p(k) ≤ k·q/m.
- **q-value:** menor FDR em que o teste seria significativo; Storey estima π₀ (fração de nulas).
- **Histograma de p-valores:** uniforme (nulas) + pico perto de 0 (sinal). Formatos estranhos indicam modelo errado.
- **Independent filtering** (filtrar genes de baixa contagem antes) aumenta poder.

### Código
```r
p.adjust(p, "bonferroni"); p.adjust(p, "holm"); padj <- p.adjust(p, "BH")
hist(p, breaks = 50)
library(qvalue); qvalue(p)$pi0
```
```python
from statsmodels.stats.multitest import multipletests
rej, padj, *_ = multipletests(p, alpha=0.05, method="fdr_bh")
```

### Armadilhas
- FDR 5% não significa que cada gene tem 5% de chance de ser falso.
- Corrigir apenas os testes “interessantes” depois de olhar os dados.

@@ EST2:3
> **O que esperar:** modelar dados com dependência (mesmo paciente medido várias vezes, lotes) usando efeitos aleatórios. Base: MSMB cap. 13 (dependência, medidas repetidas).

### Conceitos
- **Efeito fixo:** níveis de interesse em si (tratamento). **Aleatório:** níveis amostrados de uma população (paciente, lote, local), estima-se sua variância.
- Modelo misto: y = Xβ + Zu + ε, u ~ N(0, σ²ᵤ). Intercepto aleatório `(1 | paciente)`; inclinação aleatória `(tempo | paciente)`.
- **ICC** = σ²ᵤ/(σ²ᵤ + σ²) — quanto as medidas do mesmo grupo se parecem.
- Alternativas: t pareado (2 tempos), `duplicateCorrelation` (limma), `dream` (variancePartition) para RNA-seq.

### Código
```r
library(lme4); library(lmerTest)
m <- lmer(expr ~ tempo * trat + (1 | paciente), data = d)
summary(m); ranef(m); anova(m)
m2 <- lmer(expr ~ tempo + (tempo | paciente), data = d)
```

### Armadilhas
- Ignorar o agrupamento = pseudorreplicação.
- Poucos níveis (< 5) para um efeito aleatório → variância mal estimada (use fixo).
- Avisos de *singular fit* = estrutura aleatória complexa demais.

@@ EST2:4
> **O que esperar:** explorar dados de alta dimensão — PCA, MDS, distâncias, clustering e heatmaps — e não se enganar com eles. Base: MSMB caps. 5 e 7, ISLR cap. 12.

### Conceitos
- **PCA:** eixos ortogonais de variância máxima; scores (amostras) e loadings (genes); scree plot. Dados transformados (VST/log) e centrados.
- **MDS/PCoA:** representa uma matriz de **distâncias** qualquer (Bray-Curtis, 1 − correlação).
- **Distâncias:** euclidiana (magnitude), correlação (forma), Manhattan.
- **Hierárquico:** ligação complete/average/ward.D2; dendrograma; corte em k grupos. **k-means:** k pré-definido, sensível à inicialização e escala.
- Validação: silhueta, estabilidade por bootstrap, gap statistic.

### Código
```r
vsd <- vst(dds); pca <- prcomp(t(assay(vsd)[top500, ]))
summary(pca)$importance[2, 1:5]
d <- dist(t(assay(vsd)[top500, ])); hc <- hclust(d, "ward.D2"); cutree(hc, k = 3)
km <- kmeans(pca$x[, 1:10], centers = 3, nstart = 25)
cluster::silhouette(km$cluster, d) |> summary()
pheatmap::pheatmap(assay(vsd)[top50, ], scale = "row", annotation_col = as.data.frame(colData(vsd)[, "dex", drop = FALSE]))
```

### Armadilhas
- Clustering sempre devolve grupos, mesmo em dados sem estrutura.
- PC1 = lote ou tamanho de biblioteca? Colora por covariáveis técnicas.

@@ EST2:5
> **O que esperar:** o raciocínio bayesiano (prior × verossimilhança → posterior) e o *shrinkage* de modelos hierárquicos — a ideia por trás do DESeq2/limma. Base: Statistical Rethinking (aulas 1–2 e multinível).

### Conceitos
- **Posterior ∝ verossimilhança × prior.** Resultado = distribuição, não só um ponto; intervalo de credibilidade.
- Prior informativo × fracamente informativo; com muitos dados a verossimilhança domina.
- **Modelos hierárquicos (multinível):** parâmetros de grupos vêm de uma distribuição comum → **partial pooling**: grupos com pouco dado “emprestam força” e são puxados à média (*shrinkage*).
- Ligação com ômicas: DESeq2 encolhe dispersões e LFC; limma modera variâncias (empirical Bayes).
- Amostragem MCMC (Stan) aproxima posteriores.

### Código
```r
# grade: proporção de água (globo) com 6 acertos em 9
p <- seq(0, 1, length.out = 1000); prior <- rep(1, 1000)
lik <- dbinom(6, 9, p); post <- lik * prior / sum(lik * prior)
p[which.max(post)]; sample(p, 1e4, TRUE, post) |> quantile(c(.055, .945))
library(brms); brm(y ~ x + (1 | grupo), data = d)
```

### Armadilhas
- Prior escolhido depois de ver os dados.
- Credibilidade 89%/95% são convenções; relate o intervalo.

@@ EST2:6
> **O que esperar:** dois tipos de dado com estatística própria — composicional (microbioma, proporções) e tempo até evento (sobrevivência). Base: Gloor et al. 2017, ISLR cap. 11.

### Conceitos
- **Composicional:** só razões entre partes têm informação (o total é arbitrário, fixado pelo sequenciador). Correlações entre proporções são espúrias.
- **CLR:** log(xᵢ / média geométrica). Exige tratar zeros (pseudocontagem/modelos). Distância de **Aitchison** = euclidiana no espaço CLR.
- **Sobrevivência:** tempo até evento com **censura** (sem evento até o fim do acompanhamento).
- **Kaplan-Meier:** S(t) em degraus; **log-rank** compara curvas. **Cox:** hazard ratio (HR > 1 = maior risco), pressupõe **riscos proporcionais** (teste de Schoenfeld).

### Código
```r
clr <- function(x) log(x) - mean(log(x)); apply(counts + 0.5, 2, clr)
library(survival); library(survminer)
fit <- survfit(Surv(tempo, evento) ~ grupo_expr, data = d); ggsurvplot(fit, pval = TRUE)
cox <- coxph(Surv(tempo, evento) ~ expr + idade + estadio, data = d); summary(cox); cox.zph(cox)
```

### Armadilhas
- Dicotomizar expressão pela mediana perde poder; escolher o corte “ótimo” infla o efeito.
- Excluir censurados ou tratá-los como eventos enviesa.

@@ ENG1:0
> **O que esperar:** escrever código científico legível e modular — funções pequenas, bons nomes e tipos. Base: Taschuk & Wilson 2017 (regras 1–5), Wilson et al. 2017 (seção Software).

### Conceitos
- **Uma função, uma responsabilidade**; curta, sem efeitos colaterais escondidos; entradas e saídas explícitas.
- **Nomes** que dizem o que é (`n_reads`, não `x2`); constantes em MAIÚSCULAS; evitar números mágicos.
- Não se repita (DRY): extraia funções após repetir 2–3 vezes.
- **Type hints** documentam e permitem checagem (mypy/pyright).
- Software para outros: controle de versão, README, `--help`, versão do programa, dependências declaradas.

### Código
```python
from pathlib import Path
from typing import Iterator

MIN_QUAL = 20

def mean_quality(qual: str, offset: int = 33) -> float:
    """Qualidade Phred média de uma read."""
    return sum(ord(c) - offset for c in qual) / len(qual)

def passing_reads(path: Path, min_q: int = MIN_QUAL) -> Iterator[str]:
    for rid, seq, qual in read_fastq(path):
        if mean_quality(qual) >= min_q:
            yield rid
```

### Armadilhas
- Funções que leem arquivo, calculam e plotam ao mesmo tempo (impossível testar).
- Estado global e caminhos fixos no meio do código.

@@ ENG1:1
> **O que esperar:** testes automatizados com pytest e testthat — unitários, fixtures, parametrização, cobertura e TDD. Base: docs do pytest (fixtures, parametrize), testthat.

### Conceitos
- **Teste unitário:** pequeno, rápido, determinístico, testa um comportamento. Inclua casos de borda (vazio, minúsculas, N, arquivo sem newline final).
- **Fixture:** prepara dados/recursos reutilizáveis (`tmp_path` para arquivos temporários).
- **Parametrização:** mesma lógica, várias entradas.
- **Cobertura** mede linhas executadas, não qualidade dos testes.
- **TDD:** escreve o teste (vermelho) → código mínimo (verde) → refatora.

### Código
```python
import pytest
from mypkg.fasta import read_fasta, gc_content

@pytest.fixture
def fasta(tmp_path):
    p = tmp_path / "x.fa"; p.write_text(">a desc\nACG\nT\n>b\nGG\n"); return p

def test_read_fasta(fasta):
    assert list(read_fasta(fasta)) == [("a", "ACGT"), ("b", "GG")]

@pytest.mark.parametrize("seq,exp", [("GC", 1.0), ("AT", 0.0), ("acgt", 0.5)])
def test_gc(seq, exp):
    assert gc_content(seq) == pytest.approx(exp)

def test_gc_vazio():
    with pytest.raises(ValueError): gc_content("")
```
```bash
pytest -q; pytest --cov=mypkg --cov-report=term-missing
```
```r
test_that("gc funciona", { expect_equal(gc("GC"), 1); expect_error(gc("")) })
```

### Armadilhas
- Testes que dependem de rede ou da ordem de execução.
- Comparar floats com `==`.

@@ ENG1:2
> **O que esperar:** documentar para usuários (README, tutoriais) e para desenvolvedores (docstrings, API) e publicar um site com MkDocs. Base: Lee 2018 (10 regras), Write the Docs, MkDocs.

### Conceitos
- **README mínimo:** o que faz e por quê, instalação, exemplo mínimo que roda, entradas/saídas, como citar, licença, contato.
- Tipos de documentação (Diátaxis): **tutorial** (aprender), **how-to** (resolver), **referência** (API), **explicação** (conceitos).
- **Docstrings** (Google/NumPy style): parâmetros, retorno, exceções, exemplo.
- **CHANGELOG** (Keep a Changelog): Added/Changed/Fixed por versão.
- Documentação junto do código, versionada e testada (exemplos executáveis).

### Código
```python
def kmer_counts(seq: str, k: int) -> dict[str, int]:
    """Conta k-mers sobrepostos.

    Args:
        seq: sequência de DNA.
        k: tamanho do k-mer (> 0).
    Returns:
        Dicionário k-mer → contagem.
    Example:
        >>> kmer_counts("AAA", 2)
        {'AA': 2}
    """
```
```bash
pip install mkdocs-material mkdocstrings[python]
mkdocs new . ; mkdocs serve ; mkdocs gh-deploy
```

### Armadilhas
- README que descreve a versão antiga; exemplos que não rodam.

@@ ENG1:3
> **O que esperar:** transformar scripts em pacote instalável com CLI e versões semânticas. Base: Python Packaging User Guide (tutorial, pyproject.toml), SemVer 2.0.0.

### Conceitos
- **Layout `src/`**: `src/mypkg/__init__.py` evita importar o código local sem instalar.
- **pyproject.toml:** `[build-system]`, `[project]` (nome, versão, dependências, `requires-python`), `[project.scripts]` (entry points → comandos).
- **CLI:** `argparse` (padrão) ou `typer`/`click`.
- **SemVer** MAJOR.MINOR.PATCH: quebra de API → MAJOR; funcionalidade compatível → MINOR; correção → PATCH. `0.x` = API instável.

### Código
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "kmertools"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["biopython>=1.83"]

[project.scripts]
kmertools = "kmertools.cli:main"
```
```bash
pip install -e .           # modo editável
python -m build && twine upload -r testpypi dist/*
```

### Armadilhas
- Fixar versões exatas em bibliotecas (`==`) causa conflitos; use limites (`>=`), fixe exato só em apps/lockfiles.

@@ ENG1:4
> **O que esperar:** automatizar estilo e checagens com ruff e pre-commit para não discutir formatação em code review. Base: tutorial do Ruff, pre-commit quick start.

### Conceitos
- **Linter** encontra bugs prováveis e más práticas (imports não usados, variáveis indefinidas). **Formatter** padroniza layout.
- **Ruff:** linter + formatter muito rápido (substitui flake8, isort, black). Regras por prefixo (E, F, I, B, UP…).
- **pre-commit:** roda hooks antes de cada commit; mesma configuração para todos (e no CI).

### Código
```toml
[tool.ruff]
line-length = 100
[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]
```
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks: [{id: check-added-large-files}, {id: end-of-file-fixer}]
```
```bash
ruff check --fix . && ruff format .
pre-commit install && pre-commit run --all-files
```

### Armadilhas
- Ligar todas as regras de uma vez num código antigo → milhares de avisos; adote gradualmente.

@@ ENG1:5
> **O que esperar:** medir antes de otimizar e acelerar com vetorização e paralelismo. Base: McKinney apêndices A (NumPy avançado) e B (IPython: %timeit, %prun).

### Conceitos
- “Otimização prematura é a raiz de todo mal”: **perfile** para achar o gargalo (normalmente 1–2 funções).
- `cProfile`/`%prun` (por função), `line_profiler` (por linha), `memory_profiler`.
- **Vetorização** (NumPy) troca loops Python por C.
- **Paralelismo:** `multiprocessing`/`concurrent.futures` para CPU (contorna o GIL); threads/async para I/O.
- Algoritmo/estrutura de dados certos ganham mais que micro-otimizações.

### Código
```python
%timeit kmer_counts(seq, 5)
%prun -l 10 run_all()
python -m cProfile -s cumtime script.py | head -20
from concurrent.futures import ProcessPoolExecutor
with ProcessPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(process_file, files))
gc = (arr == b"G").sum() + (arr == b"C").sum()     # vetorizado sobre np.frombuffer
```

### Armadilhas
- Paralelizar tarefas minúsculas: o custo de comunicação domina.
- Medir com um único run ou dados pequenos demais.

@@ VAR:0
> **O que esperar:** como um chamador decide genótipos a partir das reads e quais métricas separam variantes reais de artefatos. Base: GATK (HaplotypeCaller, hard-filtering), McKenna et al. 2010.

### Conceitos
- **Verossimilhança de genótipo:** P(reads | G) para G ∈ {0/0, 0/1, 1/1}, combinando qualidade de base e de mapeamento; prior → posterior.
- **HaplotypeCaller:** acha regiões ativas → **reassembla** haplótipos localmente (grafo de de Bruijn) → alinha reads aos haplótipos (PairHMM) → genotipa. Melhor para indels.
- **VCF:** QUAL (confiança de que há variante), **GQ** (confiança no genótipo), **DP**, **AD** (reads por alelo), **PL** (verossimilhanças escaladas).
- **Métricas de filtro:** **QD** (QUAL/profundidade), **FS**/**SOR** (viés de fita), **MQ** (qualidade de mapeamento), MQRankSum, ReadPosRankSum.
- Hard filters sugeridos (SNP): QD < 2, FS > 60, MQ < 40, SOR > 3.

### Comandos
```bash
bcftools view -i 'QUAL>30 && INFO/DP>10' calls.vcf.gz | bcftools stats - > stats.txt
bcftools filter -e 'QD<2 || FS>60 || MQ<40' -s LowQual -Oz -o filt.vcf.gz calls.vcf.gz
bcftools query -i 'GT="het"' -f '%CHROM\t%POS\t[%AD]\n' filt.vcf.gz | head
```

### Armadilhas
- QUAL alto com DP enorme (regiões colapsadas/repetitivas) → por isso QD.
- Variante heterozigota com AD 2/40 = provável artefato ou contaminação.

@@ VAR:1
> **O que esperar:** o fluxo GATK para variantes germinativas curtas, do BAM ao VCF filtrado, incluindo coortes. Base: GATK Best Practices (germline short variants), GTN “Calling variants in diploid systems”.

### Conceitos
1. BAM com read groups, duplicatas marcadas.
2. **BQSR:** recalibra qualidades de base usando sítios conhecidos (dbSNP, Mills) — corrige erros sistemáticos do sequenciador.
3. **HaplotypeCaller `-ERC GVCF`** por amostra (registra também blocos de referência).
4. **GenomicsDBImport/CombineGVCFs** → **GenotypeGVCFs** (**joint genotyping**: melhor sensibilidade e resolve o “N+1”).
5. **VQSR** (modelo gaussiano com recursos de verdade; precisa de muitas amostras/WGS) **ou** hard filters (poucas amostras, exoma pequeno) **ou** CNN score.

### Comandos
```bash
gatk BaseRecalibrator -I s.bam -R ref.fa --known-sites dbsnp.vcf.gz -O recal.table
gatk ApplyBQSR -I s.bam -R ref.fa --bqsr-recal-file recal.table -O s.bqsr.bam
gatk HaplotypeCaller -R ref.fa -I s.bqsr.bam -ERC GVCF -L chr20 -O s.g.vcf.gz
gatk GenomicsDBImport -V a.g.vcf.gz -V b.g.vcf.gz -V c.g.vcf.gz --genomicsdb-workspace-path db -L chr20
gatk GenotypeGVCFs -R ref.fa -V gendb://db -O trio.vcf.gz
gatk VariantFiltration -V trio.vcf.gz --filter-expression "QD < 2.0 || FS > 60.0" --filter-name snpfilt -O trio.filt.vcf.gz
```

### Armadilhas
- Separar SNPs e indels antes do hard filter (limiares diferentes).
- Trio: verifique erros mendelianos e parentesco (ex.: `bcftools +mendelian`, somalier).

@@ VAR:2
> **O que esperar:** chamadas com deep learning (DeepVariant) e como medir precisão/recall contra a verdade do GIAB. Base: docs DeepVariant (quick start, case study), GIAB (amostras HG001–HG007, regiões de benchmark).

### Conceitos
- **DeepVariant:** transforma pileups em imagens (tensores) e classifica genótipos com CNN; modelos por tecnologia (WGS, WES, PACBIO, ONT_R104). DeepTrio para trios.
- **GIAB:** amostras de referência (HG002 = filho do trio asquenaze) com **VCF de verdade** + **BED de regiões de alta confiança**; estratificações (homopolímeros, segmental duplications, MHC).
- **hap.py / vcfeval:** compara representações equivalentes de variantes; métricas por tipo (SNP/INDEL): TP, FP, FN.
- **Precisão** = TP/(TP+FP); **recall** = TP/(TP+FN); **F1** = média harmônica.

### Comandos
```bash
docker run -v $PWD:/d google/deepvariant:1.6.1 /opt/deepvariant/bin/run_deepvariant \
  --model_type=WGS --ref=/d/ref.fa --reads=/d/HG002.bam --regions chr20 \
  --output_vcf=/d/dv.vcf.gz --num_shards=8
hap.py truth.vcf.gz dv.vcf.gz -f confident.bed -r ref.fa -o happy/dv --engine vcfeval
```

### Armadilhas
- Avaliar fora das regiões confiáveis ou em outra versão do genoma.
- Comparar ferramentas só no total — erros se concentram em regiões difíceis (veja estratificações).

@@ VAR:3
> **O que esperar:** anotar consequências de variantes e frequências populacionais para priorizar candidatas. Base: Ensembl VEP, SnpEff, ClinVar, gnomAD, dbSNP.

### Conceitos
- **Consequência** depende do **transcrito**: use MANE Select / canônico. Termos Sequence Ontology: `missense_variant`, `stop_gained`, `frameshift_variant`, `splice_donor_variant`, `synonymous_variant`…
- **Impacto** (VEP/SnpEff): HIGH, MODERATE, LOW, MODIFIER.
- **HGVS:** `NM_000546.6:c.743G>A` (cDNA) / `p.Arg248Gln` (proteína).
- **Frequência:** gnomAD AF/grpmax; filtro típico para doença rara dominante AF < 0,1%.
- **Preditores:** CADD, REVEL (missense), SpliceAI (splicing), AlphaMissense.
- **ClinVar:** classificações submetidas + estrelas de revisão. **dbSNP:** IDs rs (não implicam patogenicidade).

### Comandos
```bash
vep -i filt.vcf.gz --cache --offline --assembly GRCh38 --everything --pick --vcf -o ann.vcf \
    --plugin REVEL,revel.tsv.gz --custom gnomad.vcf.gz,gnomAD,vcf,exact,0,AF
filter_vep -i ann.vcf --filter "IMPACT in HIGH,MODERATE and (gnomAD_AF < 0.001 or not gnomAD_AF)" -o cand.vcf
snpEff -v GRCh38.105 filt.vcf.gz > snpeff.vcf
```

### Armadilhas
- Consequência no transcrito errado muda tudo (“stop” num transcrito que não é expresso).
- Ausência no gnomAD ≠ patogênica; checar cobertura da região no gnomAD.

@@ VAR:4
> **O que esperar:** classificar variantes com os critérios ACMG/AMP e escrever um laudo com limitações. Base: Richards et al. 2015 (ACMG/AMP), recomendações ClinGen.

### Conceitos
- Cinco classes: **Patogênica, Provavelmente patogênica, VUS, Provavelmente benigna, Benigna**.
- Critérios patogênicos: **PVS1** (LoF em gene onde LoF é mecanismo), **PS** fortes (PS1 mesma troca de aa conhecida, PS2 *de novo* confirmada, PS3 estudo funcional, PS4 prevalência em casos), **PM** moderados (PM2 ausente/raríssima em controles, PM1 hotspot, PM5…), **PP** de suporte (PP3 preditores).
- Critérios benignos: **BA1** (AF > 5%), **BS** fortes, **BP** de suporte.
- **Combinação** (ex.: P = 1 PVS1 + ≥1 PS; LP = 1 PVS1 + 1 PM). Modelo bayesiano de pontos do ClinGen e ajustes por gene (VCEPs).
- **Laudo:** dados do paciente/indicação, método e cobertura, variante (HGVS, zigosidade), classificação com evidências, interpretação, recomendações (segregação, aconselhamento), **limitações** (regiões não cobertas, CNV/SV não avaliados).

### Armadilhas
- Contar a mesma evidência duas vezes (ex.: PP3 + PM… com o mesmo preditor).
- VUS não deve orientar conduta clínica; reavaliar periodicamente.

@@ VAR:5
> **O que esperar:** chamar mutações adquiridas em tumores e interpretar VAF, pureza e TMB. Base: GATK Mutect2 (tutorial somático).

### Conceitos
- **Tumor-normal pareado** remove variantes germinativas; **tumor-only** depende de *Panel of Normals* (PoN) + gnomAD (com mais falsos positivos).
- **PoN:** artefatos técnicos recorrentes em normais. **Germline resource** (gnomAD AF) informa o prior germinativo.
- **VAF** = reads alt/total. Heterozigota clonal num tumor com pureza p e diploide ≈ p/2. Subclonais têm VAF menor.
- **Pureza/ploidia** (FACETS, PURPLE, ASCAT) alteram a VAF esperada.
- Artefatos: FFPE (C>T por desaminação), oxoG (G>T), contaminação cruzada (`CalculateContamination`), orientação de leitura (`LearnReadOrientationModel`).
- **TMB** = mutações somáticas codificantes/Mb (depende do painel e filtros).

### Comandos
```bash
gatk Mutect2 -R ref.fa -I tumor.bam -I normal.bam -normal NORMAL_SM \
  --germline-resource af-only-gnomad.vcf.gz --panel-of-normals pon.vcf.gz \
  --f1r2-tar-gz f1r2.tar.gz -O unfilt.vcf.gz
gatk LearnReadOrientationModel -I f1r2.tar.gz -O rom.tar.gz
gatk FilterMutectCalls -R ref.fa -V unfilt.vcf.gz --ob-priors rom.tar.gz --contamination-table cont.table -O somatic.vcf.gz
```

### Armadilhas
- Usar o chamador germinativo em tumor (assume VAF 0,5/1).
- CHIP (hematopoiese clonal) aparece no “normal” de sangue.

@@ VAR:6
> **O que esperar:** detectar variantes estruturais e de número de cópias e por que long reads mudaram essa área. Base: docs de Sniffles2/Manta, IGV.

### Conceitos
- **SV** ≥ 50 pb: deleção, duplicação, inversão, inserção, translocação. **CNV** = ganho/perda de cópias.
- **Sinais em reads curtas:** pares discordantes (distância/orientação), **split reads** (read dividida entre loci), **profundidade** (CNV), montagem local. Ferramentas: Manta, Delly, GRIDSS; CNV: CNVkit, GATK gCNV.
- **Long reads:** a read atravessa o evento → Sniffles2, cuteSV, pbsv; muito maior sensibilidade em repetições e inserções.
- VCF de SV: `SVTYPE`, `SVLEN`, `END`, alelos simbólicos `<DEL>`, BND para breakends.
- Benchmark: GIAB HG002 SV v0.6, Truvari.

### Comandos
```bash
sniffles --input ont.bam --vcf svs.vcf.gz --reference ref.fa --threads 8
configManta.py --bam s.bam --referenceFasta ref.fa --runDir manta && manta/runWorkflow.py -j 8
truvari bench -b truth.vcf.gz -c svs.vcf.gz -o truvari/ --includebed conf.bed
```

### Armadilhas
- SVs em segmental duplications geram muitos falsos positivos com reads curtas.
- Breakpoints imprecisos: compare com tolerância (Truvari), não por posição exata.

@@ RNA:0
> **O que esperar:** decisões de desenho que determinam o que um RNA-seq consegue responder. Base: Conesa et al. 2016 (experimental design), Stark et al. 2019.

### Conceitos
- **Réplicas biológicas:** mínimo 3, ideal 4–6+; mais réplicas > mais profundidade para DE.
- **Profundidade:** 20–30 M reads para DE de genes; mais para isoformas/genes pouco expressos.
- **Seleção de RNA:** **poly-A** (mRNA maduro; exige RNA íntegro — RIN alto) × **ribodepleção** (inclui não poliadenilados e pré-mRNA; melhor para FFPE/degradado).
- **Stranded** (dUTP) mantém a fita → resolve genes sobrepostos antissenso; indique `strandedness` na quantificação.
- Single × paired-end; comprimento de read; spike-ins (ERCC); UMIs.
- **Lote:** distribuir condições entre lotes de extração/biblioteca/corrida; registrar todos os metadados.

### Armadilhas
- Condição confundida com lote, sexo ou dia de coleta.
- Strandedness errada na contagem → perde metade das reads ou conta a fita errada (confira com `infer_experiment.py` ou Salmon `lib_format_counts.json`).

@@ RNA:1
> **O que esperar:** os dois caminhos de quantificação (alinhamento + contagem × pseudoalinhamento) e as unidades de expressão. Base: docs STAR/featureCounts, Salmon, kallisto, tximport.

### Conceitos
- **STAR + featureCounts:** alinha ao genoma (splice-aware) → conta reads por gene (GTF). Permite visualizar, achar novas junções.
- **Salmon/kallisto:** mapeamento seletivo/pseudoalinhamento ao **transcriptoma**; modelo EM distribui reads ambíguas entre isoformas; rápido; corrige viés de GC/posição (Salmon `--gcBias`). Use transcriptoma + genoma como *decoy*.
- **Unidades:** contagens (para DE), **TPM** (normaliza comprimento e depois profundidade; soma 10⁶ por amostra), FPKM (evite).
- **tximport:** soma transcritos → gene com *offset* de comprimento, para DESeq2/edgeR.

### Comandos
```bash
salmon index -t gentrome.fa.gz -d decoys.txt -i salmon_idx -k 31
salmon quant -i salmon_idx -l A -1 R1.fq.gz -2 R2.fq.gz --validateMappings --gcBias -p 8 -o quant/S1
featureCounts -T 8 -p --countReadPairs -s 2 -a genes.gtf -o counts.txt *.bam
```
```r
library(tximport); tx2gene <- read_tsv("tx2gene.tsv")
txi <- tximport(files, type = "salmon", tx2gene = tx2gene)
dds <- DESeqDataSetFromTximport(txi, colData = meta, design = ~ cell + dex)
```

### Armadilhas
- Usar TPM como entrada do DESeq2.
- Versões do GTF e do transcriptoma diferentes entre índice e tx2gene.

@@ RNA:2
> **O que esperar:** normalização entre amostras e o modelo de expressão diferencial do DESeq2, edgeR e limma-voom. Base: vinhetas DESeq2/edgeR/limma, MSMB cap. 8.

### Conceitos
- **Normalização:** DESeq2 = **size factors** (mediana das razões à média geométrica); edgeR = **TMM** (média aparada de log-razões). Corrigem profundidade **e** composição.
- **DESeq2:** NB por gene; dispersão encolhida para a tendência média-dispersão; teste de **Wald** (ou LRT para vários níveis/tempo); **independent filtering** e Cook's distance para outliers.
- **Shrinkage de LFC** (`lfcShrink`, apeglm/ashr): LFC de genes pouco expressos fica realista — use para ranquear e plotar.
- **edgeR:** QL F-test (`glmQLFit`/`glmQLFTest`). **limma-voom:** transforma em log-CPM com pesos de precisão → modelos lineares + empirical Bayes; ótimo com muitas amostras/desenhos complexos.
- Resultado: `baseMean`, `log2FoldChange`, `pvalue`, **`padj` (BH)**.

### Código
```r
dds <- DESeqDataSet(airway, design = ~ cell + dex)
dds$dex <- relevel(dds$dex, "untrt")
dds <- dds[rowSums(counts(dds) >= 10) >= 3, ]
dds <- DESeq(dds); resultsNames(dds)
res <- results(dds, name = "dex_trt_vs_untrt", alpha = 0.05); summary(res)
resLFC <- lfcShrink(dds, coef = "dex_trt_vs_untrt", type = "apeglm")
plotMA(resLFC); plotDispEsts(dds)
library(edgeR); y <- DGEList(counts(dds)); y <- normLibSizes(y)
design <- model.matrix(~ cell + dex, colData(dds)); y <- estimateDisp(y, design)
fit <- glmQLFit(y, design); topTags(glmQLFTest(fit, coef = ncol(design)))
v <- voom(y, design); topTable(eBayes(lmFit(v, design)), coef = ncol(design))
```

### Armadilhas
- Referência do fator errada → sinais de LFC invertidos.
- Usar dados normalizados/VST como entrada do DESeq2 (exige contagens brutas).

@@ RNA:3
> **O que esperar:** diagnosticar e lidar com variação técnica — covariáveis no modelo, fatores ocultos e quando não corrigir. Base: vinhetas sva/RUVSeq/ComBat-seq, Leek et al. 2010.

### Conceitos
- **Primeira opção:** incluir o lote conhecido na fórmula (`~ lote + condicao`) — o teste já controla.
- **Fatores ocultos:** **SVA** (variáveis substitutas a partir dos resíduos), **RUV** (genes controle/réplicas) → adicione as variáveis ao design.
- **ComBat-seq:** ajusta contagens por lote (para visualização ou ferramentas que não aceitam covariável). `limma::removeBatchEffect` só para gráficos.
- **Quando não corrigir:** lote **confundido** com condição — nenhuma correção separa os dois.
- Diagnóstico: PCA colorido por lote e condição, correlação dos PCs com covariáveis, histograma de p-valores, dispersão.

### Código
```r
library(sva)
mod <- model.matrix(~ dex, colData(dds)); mod0 <- model.matrix(~ 1, colData(dds))
sv <- svaseq(counts(dds, normalized = TRUE), mod, mod0, n.sv = 2)
dds$SV1 <- sv$sv[, 1]; design(dds) <- ~ SV1 + dex
adj <- ComBat_seq(counts(dds), batch = dds$lote, group = dds$dex)
plotPCA(vsd, intgroup = c("lote", "dex"))
```

### Armadilhas
- Corrigir com ComBat e depois **também** pôr lote no modelo (dupla correção).
- SVA sem proteger a variável de interesse no `mod` remove o sinal.

@@ RNA:4
> **O que esperar:** transformar uma lista de genes em biologia — ORA × GSEA, bancos de vias e armadilhas de interpretação. Base: clusterProfiler/fgsea, MSigDB, GO/KEGG/Reactome.

### Conceitos
- **ORA (over-representation):** genes significativos × universo → teste hipergeométrico/Fisher por conjunto. Depende do limiar de corte.
- **Universo correto:** genes **testados/expressos**, não o genoma inteiro (senão tudo de tecido aparece).
- **GSEA:** usa **todos** os genes ranqueados (ex.: estatística de Wald ou LFC encolhido) → escore de enriquecimento (NES) por conjunto; detecta mudanças pequenas e coordenadas.
- Bancos: **GO** (BP, MF, CC; hierárquico, redundante), **KEGG**, **Reactome**, **MSigDB Hallmark** (50 conjuntos não redundantes).
- Redundância: `simplify()` para GO, mapas de enriquecimento.
- Viés de comprimento (genes longos têm mais poder) → goseq.

### Código
```r
library(clusterProfiler); library(org.Hs.eg.db)
sig <- rownames(res)[which(res$padj < .05)]; univ <- rownames(res)[!is.na(res$padj)]
ego <- enrichGO(sig, OrgDb = org.Hs.eg.db, keyType = "ENSEMBL", ont = "BP", universe = univ)
dotplot(simplify(ego))
library(fgsea); rk <- sort(setNames(res$stat, res$symbol), decreasing = TRUE)
hall <- msigdbr::msigdbr(species = "Homo sapiens", category = "H") |> split(x = _$gene_symbol, f = _$gs_name)
fgsea(hall, rk, minSize = 15, maxSize = 500)
```

### Armadilhas
- Enriquecimento não prova ativação/inibição da via.
- Comparar resultados de bancos com versões diferentes.

@@ RNA:5
> **O que esperar:** além do nível de gene — mudanças de uso de isoformas, splicing alternativo e RNA de leitura longa. Base: DRIMSeq/DEXSeq, rMATS, IsoQuant.

### Conceitos
- **DGE:** muda a expressão total do gene. **DTE:** muda a expressão de um transcrito. **DTU:** muda a **proporção** entre isoformas (o total pode ficar igual).
- **Eventos de splicing:** exon skipping (SE), 5'/3' alternativo (A5SS/A3SS), intron retention (RI), exons mutuamente exclusivos (MXE). **PSI** (percent spliced in) e ΔPSI.
- Ferramentas: **DRIMSeq** (Dirichlet-multinomial, DTU), **DEXSeq** (uso de exons/bins), **rMATS** (eventos a partir de BAM), **IsoformSwitchAnalyzeR**, **stageR** (controle de FDR em dois estágios).
- **Long-read RNA** (PacBio Iso-Seq, ONT): isoformas completas sem inferência; **IsoQuant**, FLAIR, SQANTI3 (qualidade/classificação).

### Código
```r
library(DRIMSeq)
d <- dmDSdata(counts = cts, samples = samps)
d <- dmFilter(d, min_samps_gene_expr = 6, min_gene_expr = 10, min_samps_feature_expr = 3, min_feature_prop = .1)
d <- dmPrecision(d, design = model.matrix(~ condition, samps)); d <- dmFit(d, design = ...); d <- dmTest(d, coef = "conditionB")
```
```bash
rmats.py --b1 g1.txt --b2 g2.txt --gtf genes.gtf -t paired --readLength 150 --od rmats/ --tmp tmp/
isoquant.py --reference ref.fa --genedb genes.gtf --fastq ont.fq.gz --data_type nanopore -o isoquant/
```

### Armadilhas
- Reads curtas não resolvem bem isoformas parecidas (incerteza alta na quantificação).
- Filtrar transcritos pouco expressos antes do DTU, senão sobra ruído.

@@ WF:0
> **O que esperar:** ambientes reprodutíveis com conda/mamba e Bioconda, e como travar versões com lockfiles. Base: Bioconda Usage/FAQs, conda-lock.

### Conceitos
- **Canais:** conda-forge (base) + bioconda (ferramentas), `channel_priority: strict`. Nunca misture `defaults` com conda-forge sem necessidade.
- **mamba/micromamba:** resolvedor rápido (conda ≥ 23 usa libmamba).
- **Um ambiente por etapa/ferramenta** evita conflitos (padrão em pipelines: um env/container por regra/processo).
- **environment.yml** (intenção) × **conda-lock** (resolução exata por plataforma).

### Código
```yaml
# envs/qc.yml
channels: [conda-forge, bioconda]
dependencies:
  - fastqc=0.12.1
  - fastp=0.23.4
  - multiqc=1.25
```
```bash
mamba env create -f envs/qc.yml -n qc
conda-lock lock -f envs/qc.yml -p linux-64 -p osx-arm64
conda-lock install -n qc conda-lock.yml
micromamba create -f envs/qc.yml -y
```

### Armadilhas
- Bioconda não tem builds para Windows nem para todas as ferramentas em osx-arm64.
- `pip install` dentro do env conda sem registrar no yml quebra a reprodução.

@@ WF:1
> **O que esperar:** empacotar ferramentas em containers (Docker, Apptainer) e usar imagens prontas (BioContainers). Base: docs Docker/Apptainer, BioContainers.

### Conceitos
- **Imagem** (modelo imutável, em **camadas**) × **container** (instância em execução).
- **Dockerfile:** `FROM` base, `RUN` instala, `COPY`, `WORKDIR`, `ENTRYPOINT/CMD`. Ordem das camadas afeta cache.
- **Volumes/bind mounts:** `-v $PWD:/data` para dados (não coloque dados na imagem).
- **Tags imutáveis:** use versão específica ou **digest** (`@sha256:…`), nunca `latest` em pipelines.
- **Apptainer/Singularity:** roda sem root em HPC; converte imagens Docker (`.sif`).
- **BioContainers:** imagem para cada pacote Bioconda (`quay.io/biocontainers/samtools:1.20--h50ea8bc_0`).

### Código
```dockerfile
FROM mambaorg/micromamba:1.5.8
COPY --chown=$MAMBA_USER:$MAMBA_USER env.yml /tmp/env.yml
RUN micromamba install -y -n base -f /tmp/env.yml && micromamba clean -a -y
COPY . /app
RUN pip install --no-deps /app
ENTRYPOINT ["kmertools"]
```
```bash
docker build -t kmertools:0.1.0 .
docker run --rm -v "$PWD":/data -w /data kmertools:0.1.0 --help
apptainer pull samtools.sif docker://quay.io/biocontainers/samtools:1.20--h50ea8bc_0
apptainer exec samtools.sif samtools --version
```

### Armadilhas
- Rodar como root e criar arquivos com dono root nos volumes (`--user $(id -u):$(id -g)`).
- Imagens gigantes por não limpar caches na mesma camada `RUN`.

@@ WF:2
> **O que esperar:** escrever pipelines em Snakemake — regras por arquivos de saída, wildcards, configs, ambientes por regra e execução em cluster. Base: tutorial oficial do Snakemake.

### Conceitos
- Pensa **de trás para frente**: você pede o alvo (`rule all`), o Snakemake monta o **DAG** a partir dos padrões de arquivos.
- **Wildcards** `{sample}` inferidos dos nomes; `expand()` gera listas.
- `input`, `output`, `params`, `threads`, `resources`, `log`, `conda:`/`container:`.
- **config.yaml** + samplesheet; **checkpoints** quando saídas só são conhecidas em tempo de execução.
- **Perfis** (`--profile slurm`) configuram executores e recursos.
- Reexecuta só o que mudou (timestamps/código/params).

### Código
```python
configfile: "config.yaml"
SAMPLES = config["samples"]

rule all:
    input: expand("results/{s}.bam.bai", s=SAMPLES)

rule bwa:
    input: r1="data/{s}_R1.fq.gz", r2="data/{s}_R2.fq.gz", ref=config["ref"]
    output: "results/{s}.bam"
    threads: 8
    log: "logs/bwa/{s}.log"
    conda: "envs/align.yml"
    shell: "(bwa mem -t {threads} {input.ref} {input.r1} {input.r2} | samtools sort -o {output}) 2> {log}"

rule index:
    input: "results/{s}.bam"
    output: "results/{s}.bam.bai"
    shell: "samtools index {input}"
```
```bash
snakemake -n -p; snakemake --dag | dot -Tsvg > dag.svg
snakemake --use-conda -j 8; snakemake --profile slurm
```

### Armadilhas
- Wildcards ambíguos (duas regras produzem o mesmo padrão) → `wildcard_constraints`.
- Esquecer `log:` deixa erros sem rastro.

@@ WF:3
> **O que esperar:** o modelo de *dataflow* do Nextflow DSL2 — processos, canais, operadores, módulos e configuração por perfis. Base: Nextflow Training (fundamentos), docs DSL2.

### Conceitos
- **Processo:** unidade de execução isolada num *work dir* (`input`, `output`, `script`, diretivas `cpus`, `memory`, `container`, `publishDir`).
- **Canais** ligam processos; valores fluem assim que disponíveis (paralelismo automático). Fábricas: `Channel.fromPath`, `fromFilePairs`, `of`.
- **Operadores:** `map`, `filter`, `join`, `combine`, `groupTuple`, `collect`, `mix`, `splitCsv`.
- **DSL2:** `workflow {}` compõe processos; **módulos** (`include { FASTQC } from './modules/fastqc'`) e **subworkflows**.
- `nextflow.config`: `params`, `process` (`withName:`), **profiles** (`docker`, `singularity`, `slurm`, `test`).
- `-resume` reaproveita tarefas em cache.

### Código
```groovy
params.reads = "data/*_{R1,R2}.fq.gz"
process FASTP {
    tag "$id"
    container 'quay.io/biocontainers/fastp:0.23.4--hadf994f_2'
    publishDir 'results/fastp', mode: 'copy'
    input: tuple val(id), path(reads)
    output: tuple val(id), path("${id}_*.trim.fq.gz"), emit: reads
    script:
    """
    fastp -i ${reads[0]} -I ${reads[1]} -o ${id}_1.trim.fq.gz -O ${id}_2.trim.fq.gz -w $task.cpus
    """
}
workflow {
    ch = Channel.fromFilePairs(params.reads, checkIfExists: true)
    FASTP(ch)
    FASTP.out.reads.view()
}
```
```bash
nextflow run main.nf -profile docker -resume
```

### Armadilhas
- Canal de valor × fila: um canal fila consumido uma vez esvazia.
- Caminhos absolutos no script em vez de `path` inputs (quebra em nuvem/containers).

@@ WF:4
> **O que esperar:** usar pipelines nf-core prontos (samplesheet, parâmetros, perfis), entender o template e testar módulos com nf-test. Base: docs nf-core, nf-core/rnaseq, nf-test.

### Conceitos
- **nf-core:** pipelines revisados pela comunidade, com padrões (módulos compartilhados, containers, MultiQC, testes, documentação de saídas).
- Entrada por **samplesheet CSV** (`sample,fastq_1,fastq_2,strandedness`), parâmetros por `-params-file params.yaml`.
- **Perfil `test`** roda com dados mínimos — sempre teste antes.
- `nf-core tools`: `nf-core pipelines create`, `nf-core modules install`, `lint`.
- **nf-test:** testes de processos/workflows com *snapshots* (`.nf.test` + `snap`).

### Código
```bash
nextflow run nf-core/rnaseq -r 3.14.0 -profile test,docker --outdir test_out
nextflow run nf-core/rnaseq -r 3.14.0 -profile docker --input samplesheet.csv \
  --genome GRCh38 --aligner star_salmon --outdir results -resume
nf-core modules install fastp
nf-test test modules/local/kmer/tests/main.nf.test
```
```groovy
nextflow_process {
    name "Test KMER"; script "../main.nf"; process "KMER"
    test("conta k-mers") {
        when { process { """ input[0] = [ [id:'t'], file('tests/x.fa') ] """ } }
        then { assert process.success; assert snapshot(process.out).match() }
    }
}
```

### Armadilhas
- Não fixar a versão (`-r`) → resultados mudam entre execuções.
- iGenomes (`--genome`) tem anotações antigas; para produção forneça FASTA/GTF.

@@ WF:5
> **O que esperar:** conhecer WDL e CWL o suficiente para ler e rodar pipelines em plataformas como Terra e ambientes clínicos. Base: specs OpenWDL e CWL.

### Conceitos
- **WDL** (Broad/Terra): `task` (command, runtime, inputs/outputs) + `workflow` (chamadas, `scatter`). Executores: **Cromwell**, miniwdl. Muito usado em GATK e Terra/AnVIL.
- **CWL:** padrão declarativo em YAML/JSON, portável entre executores (cwltool, Toil, Arvados); verboso, forte em proveniência.
- **Comparação:** Nextflow/Snakemake = DSLs com linguagem completa e grande comunidade bioinfo; WDL = legível, ligado ao ecossistema Broad; CWL = padrão aberto, interoperabilidade.
- GA4GH **WES** (Workflow Execution Service) padroniza a execução remota.

### Código
```wdl
version 1.0
task count_reads {
  input { File fq }
  command <<< echo $(( $(zcat ~{fq} | wc -l) / 4 )) >>>
  output { Int n = read_int(stdout()) }
  runtime { docker: "ubuntu:22.04" memory: "1 GB" }
}
workflow qc { input { Array[File] fqs }
  scatter (f in fqs) { call count_reads { input: fq = f } } }
```
```bash
miniwdl run qc.wdl fqs=a.fq.gz fqs=b.fq.gz
```

### Armadilhas
- Escolher a linguagem pela moda e não pelo ambiente de execução onde o pipeline vai viver.

@@ META:0
> **O que esperar:** desenhar estudos de microbioma — escolher marcador ou shotgun, controles, contaminação e metadados. Base: revisões de métodos de microbioma, padrões MIxS.

### Conceitos
- **Amplicon:** 16S rRNA (bactérias/arqueias; regiões V3–V4, V4), **ITS** (fungos), 18S (eucariotos). Barato, gênero confiável, espécie limitada, sem função direta.
- **Shotgun:** todo o DNA → espécie/cepa, genes e vias, MAGs; mais caro, sofre com DNA do hospedeiro.
- **Controles:** negativos de extração e de PCR (*blanks*), **mock community** (composição conhecida) para medir viés e erro.
- **Baixa biomassa** (pele, tecido, ar, leite): contaminantes de reagentes (*kitome*) podem dominar → **decontam**, mais controles.
- **Metadados MIxS:** checklist mínimo (ambiente, local, data, profundidade, pH…); registre também extração, kit e lote.

### Armadilhas
- Viés de extração (Gram+ difíceis de lisar) muda a composição; padronize o kit.
- Sem controles negativos não dá para distinguir sinal de contaminação.

@@ META:1
> **O que esperar:** do FASTQ de amplicon à tabela de ASVs com taxonomia — DADA2 e QIIME 2. Base: tutorial DADA2, QIIME 2 “Moving Pictures”, SILVA.

### Conceitos
- **OTU** (agrupamento por 97% de identidade) × **ASV** (variantes exatas inferidas por modelo de erro) — ASVs são reprodutíveis entre estudos.
- **DADA2:** filtrar/cortar (qualidade, primers) → **aprender erros** → inferir ASVs → juntar pares → remover **quimeras** (bimera) → atribuir taxonomia (naive Bayes contra SILVA/GTDB/UNITE).
- Acompanhar reads em cada etapa (tabela de *tracking*).
- **QIIME 2:** artefatos `.qza` com proveniência; visualizações `.qzv`.

### Código
```r
library(dada2)
filterAndTrim(fnF, filtF, fnR, filtR, truncLen = c(240, 160), maxEE = c(2, 2), trimLeft = c(19, 20), multithread = TRUE)
errF <- learnErrors(filtF, multithread = TRUE); errR <- learnErrors(filtR, multithread = TRUE)
dadaF <- dada(filtF, err = errF); dadaR <- dada(filtR, err = errR)
seqtab <- makeSequenceTable(mergePairs(dadaF, filtF, dadaR, filtR))
seqtab <- removeBimeraDenovo(seqtab, method = "consensus")
tax <- assignTaxonomy(seqtab, "silva_nr99_v138.1_train_set.fa.gz", multithread = TRUE)
```
```bash
qiime dada2 denoise-paired --i-demultiplexed-seqs demux.qza --p-trunc-len-f 240 --p-trunc-len-r 160 \
  --o-table table.qza --o-representative-sequences rep.qza --o-denoising-stats stats.qza
qiime feature-classifier classify-sklearn --i-classifier silva-138-99-nb.qza --i-reads rep.qza --o-classification tax.qza
```

### Armadilhas
- `truncLen` curto demais impede a sobreposição dos pares (sem merge).
- Primers não removidos geram ASVs falsas.

@@ META:2
> **O que esperar:** medir diversidade dentro (alfa) e entre amostras (beta), ordenar e testar diferenças de composição. Base: phyloseq/vegan, Anderson (PERMANOVA), debate sobre rarefação.

### Conceitos
- **Alfa:** riqueza observada, Chao1, **Shannon**, Simpson, Faith PD (filogenética). Depende da profundidade.
- **Rarefação:** subamostrar à mesma profundidade — simples, mas descarta dados (McMurdie & Holmes 2014); alternativas: modelagem, curvas de rarefação, iNEXT.
- **Beta:** **Bray-Curtis** (abundância), Jaccard (presença), **UniFrac** (filogenética; weighted/unweighted), **Aitchison** (CLR + euclidiana; composicional).
- **Ordenação:** PCoA, NMDS (stress < 0,2).
- **PERMANOVA (adonis2):** diferença de centróides entre grupos; pressupõe dispersões semelhantes → checar **betadisper** (senão o resultado pode refletir dispersão).

### Código
```r
library(phyloseq); library(vegan)
estimate_richness(ps, measures = c("Observed", "Shannon"))
ord <- ordinate(ps, "PCoA", "bray"); plot_ordination(ps, ord, color = "grupo")
d <- phyloseq::distance(ps, "bray"); md <- data.frame(sample_data(ps))
adonis2(d ~ grupo + idade, data = md, permutations = 999, by = "margin")
anova(betadisper(d, md$grupo))
```

### Armadilhas
- PERMANOVA significativa com betadisper significativo → não dá para afirmar diferença de localização.
- Comparar Shannon entre amostras de profundidades muito diferentes sem tratamento.

@@ META:3
> **O que esperar:** encontrar táxons diferencialmente abundantes respeitando a natureza composicional — e por que os métodos discordam. Base: Gloor et al. 2017, ALDEx2, ANCOM-BC, MaAsLin2, Nearing et al. 2022.

### Conceitos
- Proporções somam 1: o aumento de um táxon “diminui” os demais. Testar proporções com t/Wilcoxon gera falsos positivos.
- **ALDEx2:** amostra instâncias de Dirichlet → CLR → testes; conservador.
- **ANCOM-BC(2):** estima e corrige o viés de amostragem (fração amostrada) em modelo linear log.
- **MaAsLin2/3:** modelos lineares (multivariáveis) com normalização/transformação configuráveis; bom para covariáveis.
- Outros: DESeq2/edgeR (supõem a maioria dos táxons inalterada), corncob, LinDA.
- Nearing et al. 2022: métodos dão listas muito diferentes nos mesmos dados → use **consenso de vários** e relate a sensibilidade.
- Zeros (estruturais × amostrais) e prevalência: filtre táxons raros (ex.: presentes em ≥10% das amostras).

### Código
```r
library(ALDEx2); x <- aldex(otu_counts, conds, mc.samples = 128, test = "t", effect = TRUE)
library(ANCOMBC); out <- ancombc2(data = ps, fix_formula = "grupo + idade", group = "grupo", p_adj_method = "BH")
library(Maaslin2); Maaslin2(input_data = otu, input_metadata = meta, output = "maaslin", fixed_effects = c("grupo", "idade"))
```

### Armadilhas
- Afirmar “aumento absoluto” a partir de dados relativos (precisa de carga absoluta: qPCR, spike-in, citometria).

@@ META:4
> **O que esperar:** perfis taxonômicos e funcionais de metagenomas shotgun sem montar. Base: docs Kraken2/Bracken, MetaPhlAn 4, HUMAnN 3.

### Conceitos
- **Pré-processamento:** QC (fastp) + **remoção do hospedeiro** (Bowtie2/KneadData contra o genoma humano).
- **Kraken2:** k-mers exatos → LCA no banco; rápido; resultado depende muito do banco (Standard, PlusPF, GTDB). **Bracken** reestima abundâncias por espécie.
- **MetaPhlAn 4:** genes marcadores clado-específicos → abundância relativa de espécies (inclui SGBs não cultivados); menos falsos positivos.
- **HUMAnN 3:** famílias gênicas (UniRef90) e **vias** (MetaCyc) estratificadas por espécie; unidades RPK → normalizar para CPM/relab.
- Kraken = proporção de reads; MetaPhlAn = abundância de genomas → não são diretamente comparáveis.

### Comandos
```bash
kraken2 --db k2_standard --threads 8 --paired --report S1.k2report --output S1.k2 S1_1.fq.gz S1_2.fq.gz
bracken -d k2_standard -i S1.k2report -o S1.bracken -r 150 -l S
metaphlan S1_1.fq.gz,S1_2.fq.gz --input_type fastq --nproc 8 --bowtie2out S1.bt2 -o S1.mpa.txt
merge_metaphlan_tables.py *.mpa.txt > merged.txt
humann --input S1.fq.gz --output humann/ --threads 8
humann_renorm_table -i S1_pathabundance.tsv -o S1_path_cpm.tsv -u cpm
```

### Armadilhas
- Banco Kraken pequeno → muitas reads atribuídas a táxons errados próximos.
- Esquecer a remoção do hospedeiro (privacidade e falsos positivos).

@@ META:5
> **O que esperar:** reconstruir genomas a partir de metagenomas (MAGs) — montagem, binning, qualidade e taxonomia. Base: docs MEGAHIT/metaSPAdes, MetaBAT2, CheckM2, GTDB-Tk, MIMAG.

### Conceitos
- **Montagem:** **MEGAHIT** (leve, rápido) ou **metaSPAdes** (melhor contiguidade, mais memória); co-assembly × por amostra.
- **Binning:** agrupar contigs pelo mesmo genoma usando **composição** (tetranucleotídeos) + **cobertura** em várias amostras (MetaBAT2, MaxBin2, CONCOCT; refino com DAS Tool).
- **Qualidade (MIMAG):** alta = completude > 90%, contaminação < 5% + rRNAs + ≥18 tRNAs; média = ≥ 50% e < 10%. Medir com **CheckM2**.
- **Taxonomia:** **GTDB-Tk** (ANI + árvore de marcadores na taxonomia GTDB).
- Desreplicação (dRep, 95% ANI) entre amostras.

### Comandos
```bash
megahit -1 S1_1.fq.gz -2 S1_2.fq.gz -t 16 -o megahit_S1
bowtie2-build megahit_S1/final.contigs.fa idx && bowtie2 -x idx -1 ... -2 ... | samtools sort -o S1.bam
jgi_summarize_bam_contig_depths --outputDepth depth.txt *.bam
metabat2 -i final.contigs.fa -a depth.txt -o bins/bin -m 1500
checkm2 predict -i bins -x fa -o checkm2 --threads 16
gtdbtk classify_wf --genome_dir bins -x fa --out_dir gtdbtk --cpus 16
```

### Armadilhas
- MAG = genoma de população (mosaico de cepas), não de um isolado.
- Elementos móveis/plasmídeos raramente vão para o bin certo.

@@ META:6
> **O que esperar:** aplicações de metagenômica — genes de resistência (resistoma), vírus (viroma) e microbiomas de saúde, agro e solo. Base: CARD/RGI, ferramentas de viroma, literatura de microbioma de solo.

### Conceitos
- **Resistoma:** genes de resistência a antimicrobianos (ARGs). **CARD** + **RGI** (Perfect/Strict/Loose; modelos de homologia, variantes de proteína, rRNA), AMRFinderPlus (NCBI), ResFinder. Vigilância One Health (esgoto, hospitais, animais).
- Contexto importa: ARG em plasmídeo/integron/transposon = potencial de transferência horizontal.
- **Viroma:** vírus/bacteriófagos; detecção com geNomad, VirSorter2; qualidade com **CheckV**; poucos genes universais → difícil classificar.
- **Solo/agro:** ciclos de N, P e C; promotores de crescimento; supressividade; alta diversidade e muitos táxons não descritos (ver módulos comerciais GGS/GGA).

### Comandos
```bash
rgi main -i mag.fa -o rgi_mag -t contig -a DIAMOND --clean -n 8
amrfinder -n mag.fa -o amr.tsv --plus
genomad end-to-end contigs.fa genomad_out genomad_db
checkv end_to_end virus.fa checkv_out -d checkv-db -t 8
```

### Armadilhas
- Hit “Loose” do RGI não é evidência de resistência.
- Gene presente ≠ fenótipo resistente (expressão, mutações, contexto).
