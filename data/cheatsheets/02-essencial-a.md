# Bioestatística I, SQL, Algoritmos, Genômica, NGS, Metodologia

@@ EST1:0
> **O que esperar:** resumir dados numéricos e categóricos antes de qualquer teste — tendência, dispersão, forma e outliers. Base: OpenIntro cap. 2, StatQuest (histogramas, quantis, normal).

### Conceitos
- **Tendência:** média (sensível a outliers), mediana (robusta), moda.
- **Dispersão:** variância s² = Σ(x−x̄)²/(n−1), desvio-padrão s, **IQR** = Q3 − Q1, MAD.
- **Quantis/percentis:** mediana = Q2 = p50. **Boxplot:** caixa Q1–Q3, bigodes até 1,5×IQR; pontos além = possíveis outliers.
- **Forma:** assimetria à direita (cauda longa: média > mediana) é típica de expressão e contagens → log.
- Normal: ~68% em ±1σ, ~95% em ±2σ, 99,7% em ±3σ.
- Categóricos: tabelas de frequência e contingência, proporções.

### Código
```r
library(NHANES); summary(NHANES$BMI); quantile(NHANES$BMI, c(.25,.5,.75), na.rm = TRUE)
IQR(x, na.rm = TRUE); sd(x, na.rm = TRUE); table(NHANES$Gender, NHANES$Diabetes)
ggplot(NHANES, aes(BMI)) + geom_histogram(bins = 40)
```

### Armadilhas
- Outlier não se remove por ser incômodo; investigue (erro? biologia?).
- Média ± DP para dados assimétricos engana → mediana [IQR].

@@ EST1:1
> **O que esperar:** por que estimativas variam de amostra para amostra, o Teorema Central do Limite e como interpretar um IC corretamente. Base: Seeing Theory (TCL, IC), OpenIntro 5.1–5.2, 7.1.

### Conceitos
- **Distribuição amostral:** distribuição de uma estatística (ex.: x̄) em amostras repetidas.
- **Erro padrão** SE = s/√n — incerteza da estimativa (não confundir com DP, variabilidade dos dados).
- **TCL:** com n grande, x̄ ≈ Normal(μ, σ/√n) quase qualquer que seja a distribuição original.
- **IC 95%:** x̄ ± t*·SE. Interpretação: o **procedimento** captura μ em 95% das repetições — não “95% de chance de μ estar neste intervalo”.
- Proporção: p̂ ± 1,96·√(p̂(1−p̂)/n).

### Código
```python
rng = np.random.default_rng(0)
medias = [rng.exponential(1, 30).mean() for _ in range(10000)]   # histograma ≈ normal
from scipy import stats
cob = 0
for _ in range(1000):
    a = rng.normal(10, 2, 20); ic = stats.t.interval(.95, 19, a.mean(), stats.sem(a))
    cob += ic[0] < 10 < ic[1]
cob / 1000   # ≈ 0.95
```

### Armadilhas
- Barras de erro sem dizer se são DP, SE ou IC.
- ICs de 95% que se sobrepõem não implicam ausência de diferença significativa.

@@ EST1:2
> **O que esperar:** a lógica do teste de hipóteses, erros tipo I/II, poder e o que o p-valor **não** diz. Base: OpenIntro 5.3 e 7.4, declaração da ASA 2016, Points of Significance.

### Conceitos
- H0 (sem efeito) × H1. **p-valor** = P(dados tão ou mais extremos | H0 verdadeira).
- **Erro tipo I (α):** rejeitar H0 verdadeira (falso positivo). **Tipo II (β):** não rejeitar H0 falsa. **Poder = 1 − β** (em geral mira-se 80%).
- Poder cresce com n, tamanho de efeito e α; cai com variância.
- **ASA:** p-valor não mede a probabilidade de H0 ser verdadeira, nem o tamanho/importância do efeito; p > 0,05 não prova ausência de efeito; decisões não devem depender só de um limiar.
- Relate **tamanho de efeito + IC**, não só p.

### Código
```r
library(pwr)
pwr.t.test(d = 0.5, power = 0.8, sig.level = 0.05)   # n ≈ 64 por grupo
pwr.t.test(n = 5, d = 1, sig.level = 0.05)           # poder com 5 réplicas
power.prop.test(p1 = .3, p2 = .5, power = .8)
```

### Armadilhas
- Estudos pequenos e “significativos” superestimam o efeito (maldição do vencedor).
- “Tendência à significância” (p = 0,07) não é resultado.

@@ EST1:3
> **O que esperar:** escolher o teste certo para o tipo de dado e checar pressupostos. Base: OpenIntro 6.3–6.4 e 7.1–7.3, PH525x (t-test, rank tests, association tests).

### Conceitos
| Situação | Paramétrico | Não paramétrico |
|---|---|---|
| 2 grupos independentes | t de Welch | Mann-Whitney (Wilcoxon rank-sum) |
| 2 medidas pareadas | t pareado | Wilcoxon signed-rank |
| ≥3 grupos | ANOVA | Kruskal-Wallis |
| 2 categóricas | qui-quadrado | Fisher exato (contagens < 5) |

- Pressupostos do t: independência, normalidade aproximada (ou n grande), Welch dispensa variâncias iguais.
- Não paramétricos usam **postos**: robustos a outliers, menos poder com n pequeno e efeito em escala diferente (testam distribuição/mediana).

### Código
```r
t.test(expr ~ grupo, data = d)              # Welch por padrão
t.test(antes, depois, paired = TRUE)
wilcox.test(expr ~ grupo, data = d)
chisq.test(table(d$var1, d$var2)); fisher.test(matrix(c(3, 1, 1, 3), 2))
shapiro.test(residuals(lm(expr ~ grupo, d)))   # use com cautela; prefira olhar QQ-plot
```

### Armadilhas
- Testar normalidade e escolher o teste pelo resultado é *p-hacking* leve; decida antes.
- Amostras pareadas analisadas como independentes perdem poder.
- Com n = 3 por grupo, Mann-Whitney nunca chega a p < 0,05.

@@ EST1:4
> **O que esperar:** medir associação entre duas variáveis e ajustar uma reta por mínimos quadrados, checando resíduos. Base: OpenIntro cap. 8, StatQuest (Pearson, R², regressão).

### Conceitos
- **Pearson r:** associação **linear**, sensível a outliers. **Spearman ρ:** correlação de postos (monotônica, robusta).
- **Regressão:** y = β₀ + β₁x + ε; mínimos quadrados minimizam Σ resíduos². β₁ = mudança média em y por unidade de x.
- **R²** = fração da variância explicada (em regressão simples = r²).
- Pressupostos (LINE): Linearidade, Independência, Normalidade dos resíduos, variância constante (**E**qual).
- Correlação não implica causalidade.

### Código
```r
cor(x, y); cor(x, y, method = "spearman"); cor.test(x, y)
fit <- lm(geneB ~ geneA, data = d); summary(fit); confint(fit)
par(mfrow = c(2, 2)); plot(fit)    # resíduos × ajustados, QQ, leverage
```

### Armadilhas
- Quarteto de Anscombe: mesmo r, padrões totalmente diferentes → sempre plote.
- Extrapolar fora do intervalo de x observado.
- Correlação de genes induzida por lote/tamanho de biblioteca.

@@ EST1:5
> **O que esperar:** usar reamostragem para estimar incerteza e testar hipóteses sem pressupor distribuições. Base: MSMB cap. 4 (bootstrap) e cap. 6 (permutação).

### Conceitos
- **Bootstrap:** reamostrar **com reposição** do próprio dado (mesmo n), recalcular a estatística B vezes → distribuição aproximada → SE e IC (percentil 2,5–97,5%).
- **Permutação:** sob H0 os rótulos são trocáveis; embaralhar rótulos B vezes gera a distribuição nula → p = (nº de |estat_perm| ≥ |obs| + 1)/(B + 1).
- Bootstrap = incerteza da estimativa; permutação = teste de hipótese.

### Código
```python
rng = np.random.default_rng(1)
boot = [rng.choice(a, len(a)).mean() for _ in range(10000)]
np.percentile(boot, [2.5, 97.5])
obs = a.mean() - b.mean(); todos = np.r_[a, b]; n = len(a); cont = 0
for _ in range(10000):
    rng.shuffle(todos); cont += abs(todos[:n].mean() - todos[n:].mean()) >= abs(obs)
p = (cont + 1) / 10001
```

### Armadilhas
- Bootstrap com n muito pequeno subestima a incerteza.
- Permutação exige trocabilidade: se houver pareamento/lotes, permute **dentro** de pares/lotes.

@@ SQL:0
> **O que esperar:** o modelo relacional e as consultas de leitura — SELECT, WHERE, ORDER BY, GROUP BY, HAVING. Base: SQLBolt 1–5 e 10–12, SWC SQL 1–6.

### Conceitos
- Tabela = linhas (registros) × colunas (atributos com tipo). **Chave primária** identifica a linha; **chave estrangeira** aponta para outra tabela.
- **Ordem lógica de execução:** FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.
- WHERE filtra linhas antes de agrupar; HAVING filtra grupos depois.
- `NULL` = desconhecido: use `IS NULL`, nunca `= NULL`.

### Código
```sql
SELECT sample_id, tissue, read_count
FROM samples
WHERE tissue IN ('liver', 'lung') AND read_count > 1e6
ORDER BY read_count DESC
LIMIT 10;

SELECT tissue, COUNT(*) AS n, AVG(read_count) AS media
FROM samples
GROUP BY tissue
HAVING COUNT(*) >= 3;

SELECT DISTINCT project FROM runs WHERE name LIKE 'HG%';
```

### Armadilhas
- Alias definido no SELECT não pode ser usado no WHERE (é avaliado antes).
- `COUNT(col)` ignora NULL; `COUNT(*)` conta linhas.

@@ SQL:1
> **O que esperar:** combinar tabelas (JOINs), compor consultas (subqueries, CTEs) e calcular por janela sem colapsar linhas. Base: tutorial PostgreSQL 2.6 e 3.5, SQLBolt 6–9.

### Conceitos
- **INNER JOIN:** só o que casa. **LEFT JOIN:** tudo da esquerda + o que casar (NULL se não). **FULL OUTER:** tudo dos dois. Anti-join: `LEFT JOIN … WHERE b.id IS NULL`.
- **CTE** `WITH x AS (…)` deixa a consulta legível.
- **Window functions:** `função() OVER (PARTITION BY … ORDER BY …)` — calcula por grupo mas mantém cada linha (`ROW_NUMBER`, `RANK`, `LAG`, `SUM` acumulada).

### Código
```sql
WITH qc AS (
  SELECT s.sample_id, s.patient_id, r.mean_cov
  FROM samples s
  JOIN runs r ON r.sample_id = s.sample_id
)
SELECT *
FROM (
  SELECT qc.*, ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY mean_cov DESC) AS rk
  FROM qc
) t
WHERE rk = 1;                -- melhor corrida por paciente

SELECT s.* FROM samples s LEFT JOIN runs r USING (sample_id) WHERE r.sample_id IS NULL;
```

### Armadilhas
- Filtro da tabela da direita no WHERE transforma LEFT JOIN em INNER (coloque no `ON`).
- Join sem condição completa = produto cartesiano (linhas explodem).

@@ SQL:2
> **O que esperar:** desenhar um esquema que evita redundância e mantém integridade — entidades, relacionamentos, normalização, índices, views e transações. Base: tutorial PostgreSQL 2.2–2.3 e 3.2–3.4.

### Conceitos
- **Entidades** (amostra, paciente, corrida, resultado) e **cardinalidade** (1:N, N:N → tabela de ligação).
- **Formas normais:** 1FN (valores atômicos, sem listas na célula), 2FN (atributo depende da chave inteira), 3FN (sem dependência entre não-chaves). Resultado: cada fato em um só lugar.
- **Restrições:** `PRIMARY KEY`, `FOREIGN KEY … REFERENCES`, `NOT NULL`, `UNIQUE`, `CHECK`.
- **Índice** acelera busca/join na coluna (custa escrita e espaço). **View** = consulta salva. **Transação** (`BEGIN … COMMIT`/`ROLLBACK`) = tudo ou nada (ACID).

### Código
```sql
CREATE TABLE samples (
  sample_id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(patient_id),
  collected DATE,
  tissue TEXT CHECK (tissue IN ('blood', 'tumor', 'normal'))
);
CREATE TABLE runs (
  run_id TEXT PRIMARY KEY,
  sample_id TEXT REFERENCES samples(sample_id),
  platform TEXT, reads BIGINT
);
CREATE INDEX ON runs (sample_id);
CREATE VIEW low_depth AS SELECT * FROM runs WHERE reads < 1e6;
```

### Armadilhas
- Coluna “genes = 'TP53,BRCA1'” viola 1FN.
- Desnormalizar só com motivo (performance/analítico), documentado.

@@ SQL:3
> **O que esperar:** consultar bancos a partir de Python/R com segurança e usar DuckDB para analisar arquivos grandes (Parquet/CSV) sem servidor. Base: docs DuckDB (Python/R API, Parquet).

### Conceitos
- Conexão → cursor/consulta → resultado em DataFrame. Feche conexões (`with`).
- **Parâmetros** (`?`, `%s`) em vez de formatar strings → evita SQL injection e erros de aspas.
- **DuckDB:** banco analítico embutido, colunar; lê Parquet/CSV direto, com *projection/predicate pushdown* (lê só colunas e blocos necessários).

### Código
```python
import duckdb, sqlite3, pandas as pd
con = duckdb.connect()
df = con.sql("""
  SELECT chrom, COUNT(*) n, AVG(af) af_media
  FROM 'variants/*.parquet'
  WHERE af < 0.01
  GROUP BY chrom ORDER BY n DESC
""").df()
con.execute("SELECT * FROM t WHERE gene = ?", ["TP53"]).df()
with sqlite3.connect("lab.db") as c:
    pd.read_sql("SELECT * FROM samples WHERE tissue = ?", c, params=("tumor",))
```
```r
library(DBI); con <- dbConnect(duckdb::duckdb()); dbGetQuery(con, "SELECT 42")
```

### Armadilhas
- `f"... WHERE id = '{x}'"` = vulnerável e frágil.
- Carregar o Parquet inteiro no pandas para filtrar depois desperdiça memória.

@@ SQL:4
> **O que esperar:** buscar anotações programaticamente em APIs REST (Ensembl, E-utilities) respeitando limites. Base: Ensembl REST (lookup, sequence, overlap, rate limits), E-utilities in-depth.

### Conceitos
- **REST:** recurso por URL, verbo HTTP (GET/POST), resposta JSON; códigos 200 OK, 400 erro do pedido, 404, **429 = excesso de requisições** (respeitar `Retry-After`).
- Ensembl REST: ~15 req/s; endpoints `lookup/id`, `lookup/symbol`, `sequence/id`, `overlap/region`; POST em lote (até 1000 IDs).
- E-utilities: `retmax`/`retstart` (paginação), `usehistory=y` + WebEnv/query_key para grandes resultados; `api_key`.
- BioMart / `biomaRt` para tabelas de anotação em massa.

### Código
```python
import requests, time
S = requests.Session(); S.headers.update({"Content-Type": "application/json", "Accept": "application/json"})
r = S.post("https://rest.ensembl.org/lookup/symbol/homo_sapiens", json={"symbols": ["TP53", "BRCA2"]})
r.raise_for_status(); data = r.json()
def get(url):
    while True:
        r = S.get(url)
        if r.status_code == 429: time.sleep(float(r.headers.get("Retry-After", 1))); continue
        r.raise_for_status(); return r.json()
```

### Armadilhas
- Loop de 10 mil GETs sem pausa → bloqueio do IP. Use lote, cache local e backoff.
- Registre a release do Ensembl usada (anotações mudam).

@@ ALG:0
> **O que esperar:** medir custo de algoritmos (Big-O), pensar recursivamente e conhecer busca/ordenação/hash. Base: Problem Solving with Algorithms and Data Structures (Algorithm Analysis, Recursion, Sorting and Searching).

### Conceitos
- **Big-O:** crescimento no pior caso. O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).
- **Busca linear** O(n); **binária** O(log n) exige dados **ordenados**; **hash table** (dict/set) O(1) em média.
- **Ordenação:** comparação ótima O(n log n) (merge sort, quicksort médio, Timsort no Python).
- **Recursão:** caso base + passo recursivo; cuidado com profundidade e recomputação (→ memoização / programação dinâmica).

### Código
```python
import bisect, timeit
def bsearch(a, x):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < x: lo = mid + 1
        else: hi = mid
    return lo < len(a) and a[lo] == x
bisect.bisect_left(a, x)
from functools import lru_cache
@lru_cache(None)
def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)
```

### Armadilhas
- Constantes importam em n pequeno; meça (`timeit`) antes de otimizar.
- Ordenar para buscar uma vez só não compensa (O(n log n) > O(n)).

@@ ALG:1
> **O que esperar:** algoritmos sobre strings de DNA — contar padrões, k-mers frequentes e motivos (ex.: achar a origem de replicação). Base: Bioinformatics Algorithms caps. 1–2, Rosalind BA1A–BA1D.

### Conceitos
- **Busca ingênua:** O(n·m). **KMP/Z-algorithm:** O(n + m), pré-processam o padrão para não voltar no texto.
- **k-mers frequentes:** contar todos os substrings de tamanho k com dict → O(n·k).
- **Clump finding** e **skew** (G − C acumulado): o mínimo do skew sugere a *oriC*.
- **Motivos:** matriz de perfil (PWM), consenso, entropia; busca gulosa/aleatorizada/Gibbs sampling.
- Considerar o **complemento reverso** (DnaA box nas duas fitas) e mismatches (distância de Hamming ≤ d).

### Código
```python
def pattern_count(text, pat):
    return sum(text[i:i+len(pat)] == pat for i in range(len(text) - len(pat) + 1))
def frequent_words(text, k):
    c = Counter(text[i:i+k] for i in range(len(text) - k + 1)); m = max(c.values())
    return [w for w, v in c.items() if v == m]
def skew(g):
    s = [0]
    for b in g: s.append(s[-1] + (b == "G") - (b == "C"))
    return s
```

### Armadilhas
- `str.find` / `str.count` não conta ocorrências sobrepostas (`"AAA".count("AA") == 1`).
- Índices 0-based no Rosalind vs 1-based em algumas respostas — leia o enunciado.

@@ ALG:2
> **O que esperar:** alinhamento ótimo por programação dinâmica (global e local), matrizes de substituição, gaps afins e como o BLAST acelera. Base: Bioinformatics Algorithms cap. 5, MIT 7.91J lectures 2–3.

### Conceitos
- **Needleman-Wunsch (global):** F(i,j) = max(F(i−1,j−1)+s(a,b), F(i−1,j)+gap, F(i,j−1)+gap); borda com gaps acumulados. O(nm) tempo e memória.
- **Smith-Waterman (local):** igual, mas com **0** como opção (recomeça) e traceback a partir do maior valor da matriz.
- **Matrizes:** BLOSUM62 (blocos conservados; número maior = sequências mais próximas), PAM (evolutivas; número maior = mais distantes).
- **Gaps afins:** abertura + extensão (Gotoh, 3 matrizes) — um gap longo é mais plausível que vários curtos.
- **BLAST:** palavras (seeds) → extensão sem gaps → com gaps; **E-value** = nº de hits esperados ao acaso com aquele score (depende do tamanho do banco).

### Código
```python
def nw(a, b, match=1, mis=-1, gap=-2):
    n, m = len(a), len(b); F = [[0]*(m+1) for _ in range(n+1)]
    for i in range(1, n+1): F[i][0] = i*gap
    for j in range(1, m+1): F[0][j] = j*gap
    for i in range(1, n+1):
        for j in range(1, m+1):
            s = match if a[i-1] == b[j-1] else mis
            F[i][j] = max(F[i-1][j-1] + s, F[i-1][j] + gap, F[i][j-1] + gap)
    return F[n][m]
from Bio import Align; al = Align.PairwiseAligner(mode="local")
```

### Armadilhas
- Edit distance (Rosalind EDIT) = NW com match 0, mismatch/gap 1 minimizando.
- E-value não é p-valor; compare entre buscas no mesmo banco.

@@ ALG:3
> **O que esperar:** as estruturas de índice que permitem alinhar bilhões de reads — suffix trie/tree/array, BWT e FM-index. Base: notebooks de Ben Langmead, Li & Durbin 2009 (BWA).

### Conceitos
- **Suffix trie/tree:** todos os sufixos; busca O(m), mas memória enorme. **Suffix array:** sufixos ordenados (índices); busca binária O(m log n).
- **BWT:** última coluna da matriz de rotações ordenadas de `T$`; agrupa caracteres iguais (comprime) e é reversível.
- **LF-mapping:** a k-ésima ocorrência de c na coluna L é a k-ésima em F → permite andar para trás.
- **FM-index** = BWT + tabela C (contagem de menores) + Occ (rank) amostrados + SA amostrado → busca exata em O(m), independente do tamanho do genoma.
- BWA/Bowtie: busca *backward* com tolerância a mismatches (backtracking) e seeds.

### Código
```python
def bwt(t):
    t += "$"; rot = sorted(t[i:] + t[:i] for i in range(len(t)))
    return "".join(r[-1] for r in rot)
def sa(t): return sorted(range(len(t)), key=lambda i: t[i:])   # didático (O(n² log n))
bwt("banana")   # 'annb$aa'
```

### Armadilhas
- Construção ingênua não escala; ferramentas usam algoritmos lineares (SA-IS).
- Reads em regiões repetitivas têm múltiplos hits → MAPQ baixo.

@@ ALG:4
> **O que esperar:** como montar um genoma a partir de reads via grafos de de Bruijn e por que repetições e erros atrapalham. Base: Bioinformatics Algorithms cap. 3, Rosalind DBRU.

### Conceitos
- **Overlap-layout-consensus** (reads longas) × **de Bruijn** (reads curtas): nós = (k−1)-mers, arestas = k-mers.
- Montagem = **caminho euleriano** (passa por toda aresta uma vez) — tratável; o hamiltoniano (OLC ingênuo) é NP-difícil.
- **Erros** criam pontas (tips) e bolhas; k-mers raros são removidos. **Repetições** maiores que k (ou que a read) colapsam e quebram contigs.
- **Read-pairs** (paired de Bruijn) e reads longas resolvem repetições; scaffolding ordena contigs.
- Escolha de k: pequeno = mais conexões (mais repetições ambíguas); grande = menos cobertura de k-mers. SPAdes usa vários k.

### Código
```python
def de_bruijn(kmers):
    g = defaultdict(list)
    for km in kmers: g[km[:-1]].append(km[1:])
    return g
# Rosalind DBRU: inclua também os complementos reversos
```

### Armadilhas
- Heterozigosidade e contaminação geram bolhas e contigs duplicados.
- N50 alto não garante montagem correta (misjoins).

@@ ALG:5
> **O que esperar:** modelos ocultos de Markov para anotar sequências (Viterbi, forward) e métodos de reconstrução filogenética. Base: Bioinformatics Algorithms vol. II caps. 7 e 10, MIT 7.91J lecture 10.

### Conceitos
- **HMM:** estados ocultos (ex.: ilha CpG / não ilha), probabilidades de **transição** e de **emissão**.
- **Viterbi:** caminho de estados mais provável (programação dinâmica, use log-probabilidades). **Forward:** probabilidade total da sequência (soma sobre caminhos). Baum-Welch treina parâmetros.
- Usos: predição gênica, perfis de famílias (Pfam/HMMER), CNV.
- **Filogenia:** distância (UPGMA supõe relógio molecular; **Neighbor-Joining** não); **parcimônia**; **máxima verossimilhança** (modelos de substituição, ex.: GTR+G); bayesiana.
- **Bootstrap filogenético:** reamostrar colunas do alinhamento; suporte do ramo = % das árvores que o contêm.

### Código
```python
def viterbi(obs, states, start, trans, emit):
    V = [{s: np.log(start[s]) + np.log(emit[s][obs[0]]) for s in states}]; back = []
    for o in obs[1:]:
        col, bp = {}, {}
        for s in states:
            p, prev = max((V[-1][r] + np.log(trans[r][s]), r) for r in states)
            col[s] = p + np.log(emit[s][o]); bp[s] = prev
        V.append(col); back.append(bp)
    s = max(V[-1], key=V[-1].get); path = [s]
    for bp in reversed(back): s = bp[s]; path.append(s)
    return path[::-1]
```

### Armadilhas
- Multiplicar probabilidades causa underflow → some logs.
- Árvore sem raiz/outgroup não diz direção evolutiva; bootstrap < 70% = ramo pouco suportado.

@@ BIO2:0
> **O que esperar:** como genomas de procariotos e eucariotos se organizam e como a cromatina regula o acesso aos genes. Base: Genomes (Brown) caps. 7–10.

### Conceitos
- **Procariotos:** cromossomo circular (+ plasmídeos), genoma compacto (~88% codificante), genes em **operons**, sem íntrons; transferência horizontal (ilhas genômicas).
- **Eucariotos:** cromossomos lineares, telômeros, centrômeros; genes com **íntrons**; grande fração não codificante; **repetições** (~50% no humano): elementos transponíveis (LINEs, SINEs/Alu, retrotransposons LTR, transposons de DNA), repetições em tandem (satélites, micro/minissatélites).
- **Organelas:** mtDNA (~16,5 kb no humano, herança materna), cloroplasto.
- **Cromatina:** nucleossomo (DNA em octâmero de histonas); eucromatina (aberta, ativa) × heterocromatina (compacta); marcas de histona (H3K4me3 promotor ativo, H3K27ac enhancer ativo, H3K27me3/H3K9me3 repressão); TADs e alças.

### Armadilhas
- Repetições causam mapeamento ambíguo e quebra de montagens.
- Anotação bacteriana (Prokka/Bakta) e humana (GENCODE) têm convenções diferentes de IDs e features.

@@ BIO2:1
> **O que esperar:** como cada plataforma de sequenciamento funciona, seus erros típicos e quando usar reads curtas ou longas. Base: Goodwin et al. 2016, Biostar Handbook (Illumina, PacBio, Nanopore).

### Conceitos
| Plataforma | Química | Read | Erro típico |
|---|---|---|---|
| Sanger | ddNTP | ~800 pb | baixo; caro por base |
| Illumina | SBS, terminadores reversíveis, clusters em flowcell | 50–300 pb (paired) | substituições, ~0,1%; queda no fim da read |
| PacBio HiFi | SMRT, leitura circular consenso | 15–25 kb | <0,1% (HiFi) |
| Nanopore | corrente iônica no poro | kb até >1 Mb | indels em homopolímeros (melhorou muito) |

- **Curtas:** baratas, alta acurácia → variantes pequenas, RNA-seq de contagem, amplicon.
- **Longas:** repetições, SVs, montagem *de novo*, isoformas completas, metilação direta (Nanopore/PacBio).
- Illumina: paired-end, índices (barcodes) para multiplexar, *index hopping* em flowcells padronizadas.

### Comandos
```bash
seqkit stats -a illumina_R1.fq.gz nanopore.fq.gz
NanoPlot --fastq nanopore.fq.gz -o nanoplot/
```

### Armadilhas
- Q-score de Nanopore e Illumina não são diretamente comparáveis entre gerações de basecaller.
- Read longa ≠ read precisa (confira a química/basecaller).

@@ BIO2:2
> **O que esperar:** planejar quantos dados gerar — cobertura, profundidade, réplicas e multiplexação. Base: Biostar Handbook (coverage), Conesa et al. 2016 (experimental design).

### Conceitos
- **Cobertura média** C = N·L/G (N reads, L comprimento, G genoma). Ex.: 30× WGS humano ≈ 90 Gb.
- **Lander-Waterman:** fração do genoma não coberta ≈ e^(−C) (para cobertura de Poisson). 
- **Profundidade** em um locus ≠ cobertura média; na prática a distribuição é mais larga (GC, mapeabilidade).
- Recomendações típicas: WGS germinativo 30×; exoma 100× no alvo; somático 60–100×+ no tumor; RNA-seq DE 20–30 M reads/amostra com ≥3 réplicas biológicas.
- **Multiplexação:** amostras/flowcell = rendimento ÷ reads necessárias por amostra.
- Réplicas biológicas > profundidade para DE.

### Código
```python
def cobertura(n_reads, read_len, genome, paired=True):
    return n_reads * read_len * (2 if paired else 1) / genome
def reads_necessarios(cov, read_len, genome, paired=True):
    return cov * genome / (read_len * (2 if paired else 1))
reads_necessarios(30, 150, 3.1e9)   # ≈ 310 M pares
```

### Armadilhas
- Duplicatas de PCR inflam a cobertura aparente.
- Desenho com todas as amostras de um grupo num lote/corrida confunde lote e grupo.

@@ BIO2:3
> **O que esperar:** um mapa das ômicas além do genoma — o que cada técnica mede e que tipo de dado gera. Base: Stark et al. 2019 (RNA-seq), Stephens et al. 2015 (Big Data).

### Conceitos
- **RNA-seq bulk:** média de expressão do tecido (contagens por gene/transcrito; isoformas).
- **Single-cell (scRNA-seq):** expressão por célula → tipos/estados celulares; dados esparsos, muitos zeros.
- **Espacial (Visium, Xenium, MERFISH):** expressão + coordenadas no tecido.
- **ChIP-seq:** onde uma proteína (TF, histona marcada) se liga. **ATAC-seq:** cromatina acessível (Tn5). **Metilação:** bisulfito (WGBS/RRBS), arrays (EPIC) ou leitura direta em long reads.
- Outras: proteômica (MS), metabolômica, Hi-C (3D), metagenômica.
- **Escala:** genômica compete com astronomia e YouTube em volume de dados → armazenamento e computação viram parte do desenho.

### Armadilhas
- Bulk mistura tipos celulares: mudança de expressão pode ser mudança de **composição**.
- Cada ômica tem viés e ruído próprios; integrar exige normalização específica.

@@ BIO2:4
> **O que esperar:** variação genética entre populações, frequência alélica e como GWAS e escores poligênicos associam variantes a traços. Base: 1000 Genomes/IGSR, gnomAD (AF, grpmax, constraint), GWAS Catalog.

### Conceitos
- **AF (frequência alélica)** varia por ancestralidade; gnomAD dá AF global e por grupo (**grpmax/popmax** = maior AF entre grupos — usado para filtrar variantes comuns).
- **Constraint (gnomAD):** genes intolerantes a perda de função (LOEUF baixo; pLI alto) → variantes LoF mais suspeitas.
- **GWAS:** testa milhões de SNPs × traço; limiar genômico **p < 5×10⁻⁸**; efeito como **OR** (caso-controle) ou **β** (quantitativo); Manhattan plot; o SNP líder marca um **locus em LD**, não o gene causal.
- **Herdabilidade:** fração da variância fenotípica atribuível a genética (h² de SNPs < h² de gêmeos — “herdabilidade perdida”).
- **PRS:** soma ponderada de alelos de risco; transfere mal entre ancestralidades (estudos majoritariamente europeus).

### Armadilhas
- Variante rara no gnomAD geral pode ser comum em uma população sub-representada.
- Associação GWAS ≠ causalidade nem gene mais próximo.

@@ NGS:0
> **O que esperar:** ler e decodificar os formatos que você vai usar todo dia — FASTA/FASTQ, SAM/BAM/CRAM, VCF, BED e GFF/GTF. Base: especificação SAMv1 e VCFv4, Biostar Handbook.

### Conceitos
- **FASTQ:** 4 linhas (`@id`, sequência, `+`, qualidade). **Phred:** Q = −10·log10(P_erro) → Q20 = 1%, Q30 = 0,1%; ASCII − 33.
- **SAM (11 colunas):** QNAME, **FLAG**, RNAME, POS (1-based), **MAPQ**, **CIGAR**, RNEXT, PNEXT, TLEN, SEQ, QUAL + tags (`NM`, `MD`, `RG`).
- **FLAG (bits):** 1 pareada, 2 par correto, 4 não mapeada, 16 fita reversa, 64/128 R1/R2, 256 secundária, 1024 duplicata, 2048 suplementar.
- **CIGAR:** M (alinhado), I, D, N (íntron), S (soft clip), H, = / X. Ex.: `5S90M2I53M`.
- **MAPQ:** confiança do local de mapeamento (0 = multimapeada).
- **Coordenadas:** BED **0-based meia-aberta** `[start, end)`; SAM, VCF, GFF/GTF **1-based fechadas**.
- **VCF:** CHROM POS ID REF ALT QUAL FILTER INFO FORMAT amostras (`GT:AD:DP:GQ`).

### Comandos
```bash
samtools view -H aln.bam | head; samtools view aln.bam | head -3
samtools flags 99            # decodifica
samtools view -c -F 4 aln.bam    # mapeadas; -f inclui, -F exclui
samtools view -q 30 -F 0x904 aln.bam chr1:1000-2000
bcftools view -h calls.vcf.gz | tail -1; bcftools query -f '%CHROM\t%POS\t%REF\t%ALT[\t%GT]\n' calls.vcf.gz
```

### Armadilhas
- Erro off-by-one ao converter BED ↔ GFF.
- CRAM precisa da **mesma referência** para ser lido.

@@ NGS:1
> **O que esperar:** interpretar relatórios de QC de reads e limpar adaptadores/baixa qualidade sem exagero. Base: FastQC Help (11 módulos), MultiQC, fastp README, GTN “Quality Control”.

### Conceitos
- Módulos-chave do FastQC: **per base quality** (queda no fim é normal no Illumina), per sequence quality, **per base content** (viés nos primeiros ~10 pb é normal em RNA-seq por priming aleatório), **GC content** (pico extra = contaminação), **duplication** (alta em RNA-seq/amplicon é esperado), **overrepresented sequences** e **adapter content**.
- “FAIL” não é necessariamente problema — depende do tipo de biblioteca.
- **fastp:** detecção automática de adaptador (PE por sobreposição), corte por qualidade em janela, filtros de comprimento/N, polyG (NovaSeq), relatório HTML/JSON.
- **MultiQC** agrega relatórios de muitas ferramentas/amostras.

### Comandos
```bash
fastqc -t 4 -o qc/ raw/*.fastq.gz
fastp -i R1.fq.gz -I R2.fq.gz -o R1.trim.fq.gz -O R2.trim.fq.gz \
      --detect_adapter_for_pe --cut_right --length_required 36 \
      -j S1.fastp.json -h S1.fastp.html -w 8
multiqc qc/ fastp/ -o multiqc/
```

### Armadilhas
- Trimming agressivo reduz mapeamento e cria viés; muitos alinhadores fazem soft-clip.
- Não deduplicar RNA-seq por sequência (duplicatas são em grande parte biológicas).

@@ NGS:2
> **O que esperar:** escolher e rodar o alinhador certo para cada tipo de dado (DNA curto, long reads, RNA com splicing). Base: Li & Durbin 2009, README do minimap2, Data Carpentry (bwa mem).

### Conceitos
| Dado | Ferramenta |
|---|---|
| DNA curto (WGS/WES) | **BWA-MEM** (bwa-mem2) |
| DNA curto, ChIP/ATAC | Bowtie2 |
| Long reads (ONT/HiFi), assembly-to-ref | **minimap2** (`-ax map-ont`, `map-hifi`, `asm5`) |
| RNA-seq (splice-aware) | **STAR**, HISAT2; long-read RNA: `minimap2 -ax splice` |

- Indexar a referência uma vez; incluir **read group** (`@RG` com ID, SM, PL) — exigido pelo GATK.
- Saída SAM → ordenar e converter para BAM em pipe.

### Comandos
```bash
bwa index ref.fa
bwa mem -t 8 -R '@RG\tID:S1\tSM:S1\tPL:ILLUMINA' ref.fa R1.fq.gz R2.fq.gz | samtools sort -@4 -o S1.bam
samtools index S1.bam
minimap2 -ax map-ont -t 8 ref.fa ont.fq.gz | samtools sort -o ont.bam
STAR --runMode genomeGenerate --genomeDir idx --genomeFastaFiles ref.fa --sjdbGTFfile genes.gtf
STAR --genomeDir idx --readFilesIn R1.fq.gz R2.fq.gz --readFilesCommand zcat --outSAMtype BAM SortedByCoordinate
```

### Armadilhas
- Alinhar RNA-seq com BWA perde reads que atravessam junções.
- Versão da referência (hg38 com/sem alt contigs, decoy) muda resultados; registre-a.

@@ NGS:3
> **O que esperar:** preparar e medir o BAM — ordenar, indexar, marcar duplicatas e calcular métricas de alinhamento e cobertura. Base: manual do samtools, Danecek et al. 2021.

### Conceitos
- Ordenação por coordenada + índice (`.bai`/`.csi`) permite acesso por região.
- **Duplicatas** de PCR/ópticas: mesmas posições de início/fim no par. `samtools markdup` (após `fixmate -m` em BAM ordenado por nome) ou Picard MarkDuplicates.
- Métricas: % mapeado, % pareado corretamente, taxa de duplicação, tamanho de inserto, erro, **cobertura média e uniformidade** (% bases ≥ 20×).

### Comandos
```bash
samtools sort -n -o ns.bam in.bam && samtools fixmate -m ns.bam fm.bam
samtools sort -o pos.bam fm.bam && samtools markdup pos.bam md.bam && samtools index md.bam
samtools flagstat md.bam; samtools stats md.bam > md.stats; plot-bamstats -p plots/ md.stats
samtools idxstats md.bam; samtools depth -a -r chr1:1-1000 md.bam | head
mosdepth -t 4 --by 500 --thresholds 1,10,20,30 S1 md.bam
```

### Armadilhas
- `samtools depth` sem `-a` omite posições com 0 (média fica inflada).
- Duplicação alta = baixa complexidade da biblioteca (pouco DNA de entrada).

@@ NGS:4
> **O que esperar:** inspecionar alinhamentos visualmente no IGV para confirmar ou descartar variantes e artefatos. Base: IGV Desktop User Guide “Viewing Alignments”.

### Conceitos
- **Tracks:** referência, genes, cobertura (histograma), reads.
- **Cores de base:** mismatches coloridos (A verde, C azul, G laranja, T vermelho); qualidade baixa fica transparente.
- **Reads:** cinza claro/branco = MAPQ 0 (multimapeadas); cores de par indicam **insert size** anormal (vermelho = maior que o esperado → deleção; azul = menor → inserção) ou **orientação** anômala (inversões, duplicações); outra cor de cromossomo = translocação.
- Ferramentas: agrupar/colorir por fita, por tag, por par; “sort by base”; ver soft-clips.

### Comandos
```bash
igv.sh     # File > Load: ref.fa, S1.bam (+ .bai), calls.vcf.gz
# Navegação: chr17:7,673,000-7,676,000 ou nome do gene (TP53)
# Batch: new / genome hg38 / load S1.bam / goto chr1:100-200 / snapshot var.png
```

### Armadilhas
- Variante só em reads de uma fita, no fim das reads ou com MAPQ baixo → suspeite de artefato.
- Região de baixa mapeabilidade (segmental duplications) parece ter variantes falsas.

@@ NGS:5
> **O que esperar:** montar um genoma (curto, longo, híbrido) e avaliar contiguidade e completude. Base: GTN “Introduction to Genome Assembly” e MRSA (Illumina), Bioinformatics Algorithms cap. 3.

### Conceitos
- **Curtas:** SPAdes (de Bruijn multi-k) → muitos contigs. **Longas:** Flye, Canu, hifiasm → quase cromossomos completos. **Híbrida:** Unicycler (Illumina + ONT) ou montar longo + polir com curtas (Polypolish/Pilon).
- **Métricas:** nº de contigs, tamanho total, **N50** (comprimento tal que contigs ≥ ele somam 50% da montagem), L50, maior contig; erros vs referência (QUAST).
- **Completude:** BUSCO (genes ortólogos de cópia única esperados na linhagem): C (S/D), F, M. CheckM para bactérias (completude/contaminação).

### Comandos
```bash
spades.py --isolate -1 R1.fq.gz -2 R2.fq.gz -t 8 -o spades/
flye --nano-hq ont.fq.gz --genome-size 5m -t 8 -o flye/
quast.py spades/contigs.fasta flye/assembly.fasta -r ref.fa -o quast/
busco -i flye/assembly.fasta -l bacillales_odb10 -m genome -o busco_flye
```

### Armadilhas
- N50 não mede corretude; compare com QUAST e BUSCO.
- BUSCO “D” (duplicados) alto = haplótipos não colapsados ou contaminação.

@@ MCI:0
> **O que esperar:** classificar a pergunta científica antes de escolher dados e método. Base: Leek & Peng 2015 “What is the question?”.

### Conceitos
- **Descritiva:** resumir (quantos, qual a distribuição) — sem interpretar.
- **Exploratória:** procurar padrões/hipóteses — não confirma nada.
- **Inferencial:** o padrão vale para a população? (amostra → população, incerteza).
- **Preditiva:** prever o desfecho em novos indivíduos (não importa o porquê).
- **Causal:** mudar X muda Y em média? (randomização ou desenho causal).
- **Mecanística:** como exatamente X muda Y.
- Erro mais comum: tratar análise exploratória ou preditiva como causal.

### Armadilhas
- “Biomarcador preditivo” encontrado num dataset sem validação externa é exploratório.
- Correlação entre microbioma e doença (inferencial) ≠ microbioma causa doença.

### Autoteste
- “Genes diferencialmente expressos entre tumor e normal” é qual tipo? E “o fármaco reduz a expressão de X”?

@@ MCI:1
> **O que esperar:** os princípios de desenho que tornam um experimento analisável — controles, réplicas, randomização e blocagem. Base: Points of Significance (Replication, Sources of variation, Designing comparative experiments, Blocking), MSMB cap. 13.

### Conceitos
- **Réplica biológica** (indivíduos/culturas independentes) mede a variabilidade que importa; **técnica** (mesma amostra medida 2×) só o ruído do método.
- **Pseudorreplicação:** tratar medidas não independentes como réplicas (células do mesmo animal; poços da mesma cultura) → p-valores falsamente pequenos.
- **Controles:** negativo, positivo, veículo; em sequenciamento, controles de extração/PCR e *spike-ins*.
- **Randomização** distribui fatores desconhecidos; **blocagem** controla fatores conhecidos (lote, dia, operador): cada bloco tem todos os tratamentos.
- **Unidade experimental** = o que recebe o tratamento de forma independente.

### Armadilhas
- Todas as amostras tratadas extraídas num dia e as controle em outro = lote **confundido** com tratamento (irrecuperável).
- n = número de unidades experimentais, não de medidas.

@@ MCI:2
> **O que esperar:** identificar vieses, confundidores e efeitos de lote, e usar DAGs para pensar causalidade. Base: Leek et al. 2010 (batch effects), Hernán & Robins “Causal Inference: What If” caps. 1–3 e 6.

### Conceitos
- **Viés de seleção** (quem entra no estudo), **de informação/medida** (erro diferencial), **confundimento** (causa comum de exposição e desfecho).
- **Batch effect:** variação técnica (data, reagente, corrida, operador) que pode superar a biológica; diagnostique com PCA colorido por lote.
- **Efeito causal:** comparação de desfechos potenciais (Y¹ vs Y⁰) na mesma população; randomização torna os grupos trocáveis.
- **DAG:** nós = variáveis, setas = causas. Ajustar por **confundidor** (garfo X←Z→Y) fecha o caminho espúrio; **não** ajustar por **mediador** (X→M→Y) se quer o efeito total, nem por **colisor** (X→C←Y) — abre viés.

### Código
```r
library(dagitty)
g <- dagitty("dag { Idade -> Microbioma; Idade -> Doenca; Antibiotico -> Microbioma; Microbioma -> Doenca }")
adjustmentSets(g, exposure = "Microbioma", outcome = "Doenca")
```

### Armadilhas
- Ajustar por tudo que estiver disponível pode introduzir viés (colisores).
- Correção de lote quando lote e grupo estão confundidos remove o sinal biológico.

@@ MCI:3
> **O que esperar:** por que tantos achados não se reproduzem e como práticas abertas (pré-registro, dados e código) ajudam. Base: Ioannidis 2005, Button et al. 2013, COS Preregistration, Sandve et al. 2013.

### Conceitos
- **PPV de um achado** depende de: probabilidade prévia da hipótese, poder, α e viés. Baixo poder + muitas hipóteses testadas + flexibilidade → maioria falsos positivos.
- Corolários de Ioannidis: estudos pequenos, efeitos pequenos, muitas relações testadas, flexibilidade de desenho, interesses e campos “quentes” → menos confiável.
- **Baixo poder** (Button): reduz chance de achar efeitos reais **e** reduz o PPV dos achados e infla efeitos.
- **Garden of forking paths / p-hacking:** escolhas analíticas dependentes dos dados (outliers, covariáveis, subgrupos).
- **Pré-registro:** hipóteses, desfechos e plano de análise antes de ver os dados; separa confirmatório de exploratório.

### Código
```python
# p-hacking em dados nulos: testar 20 desfechos
rng = np.random.default_rng(0); achados = 0
for _ in range(1000):
    ps = [stats.ttest_ind(rng.normal(size=20), rng.normal(size=20)).pvalue for _ in range(20)]
    achados += min(ps) < .05
achados / 1000   # ≈ 0.64
```

### Armadilhas
- Pré-registro não proíbe exploração — exige rotulá-la.

@@ MCI:4
> **O que esperar:** um roteiro para ler artigos criticamente e detectar alegações mal sustentadas. Base: Calling Bullshit (Spotting bullshit, Causality), Statistics Done Wrong (significância, poder, pseudorreplicação).

### Roteiro de leitura (ficha)
1. **Pergunta:** qual tipo (MCI:0)? A conclusão responde à pergunta feita?
2. **Desenho:** unidade experimental, n real, réplicas biológicas, controles, lotes, randomização.
3. **Dados:** origem, critérios de inclusão, disponibilidade (GEO/SRA/ENA), metadados.
4. **Análise:** métodos e versões, correção de múltiplos testes, validação independente, código disponível.
5. **Resultados:** tamanho de efeito + incerteza, não só p; figuras mostram dados brutos?
6. **Conclusão:** extrapola (causal a partir de associação; humano a partir de camundongo)?
7. **Alternativas:** confundidores, viés de seleção, artefatos técnicos.

### Sinais de alerta
- Barras sem n; p-valores logo abaixo de 0,05; pseudorreplicação; “tendência”; muitos subgrupos; ausência de validação; conflitos de interesse.

@@ MCI:5
> **O que esperar:** pesar evidências de muitas fontes — hierarquia de evidência, revisões sistemáticas, meta-análises e vieses de publicação. Base: Calling Bullshit (Publication bias, Predatory publishing).

### Conceitos
- **Hierarquia (aprox.):** opinião/relato de caso < estudos in vitro/animais < caso-controle < coorte < ECR < **revisão sistemática/meta-análise** de ECRs. Qualidade do estudo pesa tanto quanto o tipo.
- **Revisão sistemática:** pergunta definida (PICO), busca reprodutível, critérios de inclusão, avaliação de risco de viés (PRISMA).
- **Meta-análise:** combina efeitos ponderando pela precisão; efeito fixo × aleatório; heterogeneidade (I²); **forest plot**.
- **Viés de publicação:** resultados positivos publicados mais → **funnel plot** assimétrico.
- **Periódicos predatórios:** cobram sem revisão real; confira indexação e editorial.

### Armadilhas
- Meta-análise de estudos ruins continua ruim (“garbage in, garbage out”).
- Associação em vários estudos observacionais com o mesmo confundidor não vira causalidade.
