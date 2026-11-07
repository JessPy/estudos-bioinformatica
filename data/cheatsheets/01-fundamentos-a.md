# Fase 1 — Linux, Biologia I, Python I, R I, Matemática, Git
# Cada bloco começa com "@@ MÓDULO:índice_do_tópico". Rode `node tools/build-cheats.js` após editar.

@@ LNX:0
> **O que esperar:** como o shell enxerga arquivos (árvore a partir de `/`), andar entre pastas e ler/alterar permissões. Base: Software Carpentry Shell (lições 1–3), Missing Semester aula 1, TLCL.

### Conceitos
- **Caminho absoluto** começa em `/` (`/home/ana/dados`); **relativo** parte do diretório atual (`../raw`). `~` = home, `.` = aqui, `..` = pai.
- Tudo é arquivo; nomes sem espaço (use `_` ou `-`). Extensão é só convenção.
- **Permissões** `rwx` para dono / grupo / outros. `ls -l` → `-rwxr-x---`. Octal: r=4, w=2, x=1 → `750`.
- Diretório precisa de `x` para entrar e `r` para listar.

### Comandos
```bash
pwd; ls -lah; cd -          # onde estou, listar tudo, voltar ao anterior
mkdir -p proj/{data/raw,data/processed,scripts,results}
cp -r origem destino; mv a b; rm -i arq   # rm não tem lixeira!
chmod u+x script.sh; chmod 640 dados.tsv; chown user:grupo arq
man ls; ls --help; tldr tar              # ajuda
```

### Armadilhas
- `rm -rf` com variável vazia (`rm -rf $DIR/`) pode apagar a partir de `/`.
- Espaços em nomes quebram scripts → sempre aspas: `"$arquivo"`.
- `data/raw` deve ser **somente leitura** (`chmod -R a-w data/raw`).

### Autoteste
- Diferença entre `cd ../data` e `cd /data`? O que significa `chmod 755`?

@@ LNX:1
> **O que esperar:** combinar ferramentas pequenas com pipes e filtrar texto (FASTA/FASTQ/TSV) com grep, sed, awk, sort e uniq. Base: SWC lição 4, Missing Semester “Data Wrangling”, Data Carpentry redirection.

### Conceitos
- 3 fluxos: **stdin (0)**, **stdout (1)**, **stderr (2)**. `>` sobrescreve, `>>` acrescenta, `2>` erros, `&>` ambos, `|` liga stdout→stdin.
- **Regex básica:** `^` início, `$` fim, `.` qualquer, `*` 0+, `[ACGT]` classe; `-E` para `+ ? | ()`.
- awk processa por **linha** e **campo** (`$1`, `$NF`, `NR`, `-F'\t'`).

### Comandos
```bash
grep -c '^>' seqs.fa                         # nº de sequências
zcat r1.fq.gz | echo $(( $(wc -l) / 4 ))     # nº de reads
grep -v '^#' tab.tsv | cut -f1,3 | sort | uniq -c | sort -nr | head
sed 's/chr//' a.bed; sed -n '2~4p' r.fq      # substituir; linhas de sequência do FASTQ
awk -F'\t' '$5 > 30 {print $1, $5}' t.tsv
awk '/^>/{if(id)print id,len; id=$1; len=0; next}{len+=length($0)} END{print id,len}' seqs.fa
cmd > out.txt 2> err.log
```

### Armadilhas
- `grep '>'` sem `^` casa `>` no meio da linha. Em FASTQ, não conte `^@`: a linha de qualidade também pode começar com `@` — conte linhas ÷ 4.
- `uniq` só junta linhas **adjacentes** → `sort` antes.
- `sort` numérico precisa de `-n` (ou `-g`); TSV com cabeçalho → `tail -n +2`.

@@ LNX:2
> **O que esperar:** transformar comandos repetidos em scripts robustos: variáveis, loops, if, argumentos e códigos de saída. Base: SWC lições 5–6, TLCL “Writing Shell Scripts”.

### Conceitos
- Shebang `#!/usr/bin/env bash` + **modo estrito** `set -euo pipefail` (sai no erro, variável indefinida = erro, falha em qualquer parte do pipe).
- Argumentos: `$1..$9`, `$@` (todos, use `"$@"`), `$#` (quantidade), `$0` (script). Código de saída: `$?` (0 = sucesso).
- Teste: `[[ -f arq ]]` arquivo, `-d` diretório, `-z` string vazia, `-eq/-lt` números.

### Código
```bash
#!/usr/bin/env bash
set -euo pipefail
usage(){ echo "Uso: $0 <dir_fastq>" >&2; exit 1; }
[[ $# -eq 1 && "${1:-}" != "--help" ]] || usage
dir="$1"; [[ -d "$dir" ]] || { echo "Diretório não existe" >&2; exit 2; }
for f in "$dir"/*.fastq.gz; do
  n=$(( $(zcat "$f" | wc -l) / 4 ))
  printf "%s\t%d\n" "$(basename "$f" .fastq.gz)" "$n"
done
while read -r id path; do echo "$id"; done < samples.tsv
```

### Armadilhas
- Sem aspas, `$f` com espaço vira 2 argumentos. Sempre `"$var"`.
- Loop em `*.gz` sem arquivos itera o literal `*.gz` → `shopt -s nullglob`.
- `for x in $(cat lista)` quebra em espaços; prefira `while read -r`.
- Use `shellcheck script.sh` para achar bugs.

@@ LNX:3
> **O que esperar:** controlar processos longos, trabalhar em servidores remotos (SSH, tmux) e instalar ferramentas com conda/mamba + Bioconda. Base: Missing Semester aula 5, página Usage do Bioconda.

### Conceitos
- Processo: PID, foreground/background (`&`, `Ctrl+Z`, `bg`, `fg`, `jobs`). Sinais: `SIGTERM` (15, educado), `SIGKILL` (9, força).
- `nohup` / **tmux** mantêm o trabalho vivo após desconectar.
- SSH com **chave** (privada fica com você; pública em `~/.ssh/authorized_keys`).
- Bioconda exige canais na ordem **conda-forge > bioconda** com `channel_priority strict`.

### Comandos
```bash
htop; ps aux | grep samtools; kill PID; kill -9 PID
nohup ./pipeline.sh > log.txt 2>&1 &
ssh-keygen -t ed25519; ssh-copy-id user@host; ssh user@host
scp arq user@host:~/; rsync -avP dados/ user@host:dados/
tmux new -s ngs  | Ctrl+b d (desanexar) | tmux attach -t ngs | Ctrl+b c / n (janelas)
conda config --add channels bioconda --add channels conda-forge --set channel_priority strict
mamba create -n qc seqkit samtools fastp -y && conda activate qc
conda env export --from-history > environment.yml
seqkit stats -a *.fastq.gz
```

### Armadilhas
- Instalar tudo no ambiente `base` → conflitos. Um ambiente por projeto/etapa.
- `kill -9` não deixa o programa limpar arquivos temporários.
- Nunca compartilhe a chave **privada**.

@@ BIO1:0
> **O que esperar:** a lógica DNA → RNA → proteína e como sequência determina estrutura e função. Base: Alberts (caps. 3–4), MIT 7.01SC, Khan Academy.

### Conceitos
- **DNA:** dupla hélice antiparalela (5'→3'), pares A–T (2 pontes H) e G–C (3 pontes H; GC alto = mais estável). Desoxirribose.
- **RNA:** fita simples, ribose, U no lugar de T; tipos: mRNA, tRNA, rRNA, miRNA, lncRNA.
- **Dogma central:** replicação (DNA→DNA), transcrição (DNA→RNA), tradução (RNA→proteína); exceções: transcrição reversa (retrovírus), RNA→RNA.
- **Código genético:** códons de 3 nt, 64 códons → 20 aa + 3 stops (UAA, UAG, UGA); AUG = Met/início. Degenerado (redundante) e quase universal.
- **Proteínas:** estrutura primária (sequência) → secundária (α-hélice, folha β) → terciária (dobra 3D) → quaternária (subunidades). Função depende da forma (domínios, sítio ativo).

### Armadilhas
- Fita molde ≠ fita codificante: o mRNA tem a sequência da fita **codificante** (com U).
- Gene ≠ proteína: um gene pode gerar várias isoformas.

### Autoteste
- Por que uma mutação no 3º nucleotídeo do códon muitas vezes é silenciosa?

@@ BIO1:1
> **O que esperar:** como a célula copia o DNA, transcreve, processa e traduz o RNA e controla quais genes são expressos. Base: Alberts caps. 5–7, MIT 7.01SC.

### Conceitos
- **Replicação:** semiconservativa; DNA polimerase só sintetiza 5'→3' → fita contínua (leading) e fragmentos de Okazaki (lagging); primase, ligase, helicase.
- **Transcrição:** RNA polimerase liga ao **promotor** (TATA box em eucariotos) com **fatores de transcrição**; enhancers/silencers atuam à distância.
- **Processamento (eucariotos):** cap 5', cauda poli-A, **splicing** remove íntrons (spliceossomo; sítios GT…AG) → **splicing alternativo** gera isoformas.
- **Tradução:** ribossomo lê mRNA 5'→3'; tRNA com anticódon; sítios A-P-E; termina no stop. Procariotos: transcrição e tradução acopladas, operons, Shine-Dalgarno.
- **Regulação:** cromatina (acetilação abre, metilação de CpG em promotor silencia), miRNA (degrada/bloqueia mRNA), estabilidade do mRNA, modificações pós-traducionais.

### Código (prática)
```python
from Bio.Seq import Seq
cds = Seq("ATGGCCATTGTAATGGGCCGCTGA")
cds.transcribe(); cds.translate(to_stop=True)   # MAIVMGR
cds.reverse_complement()
```

### Armadilhas
- Tradução no frame errado ou da fita reversa dá proteína errada — confira com o UniProt.
- Tabela de códons diferente para mitocôndria/bactérias (`table=11` em Biopython).

@@ BIO1:2
> **O que esperar:** herança mendeliana e o vocabulário de variantes usado em todo laudo e VCF. Base: Learn.Genetics, NHGRI Talking Glossary, Khan Academy.

### Conceitos
- **Alelo, genótipo** (AA/Aa/aa), **fenótipo**; homozigoto × heterozigoto; dominante, recessivo, codominância; herança autossômica × ligada ao X; penetrância e expressividade.
- **Tipos de variante:** SNV (1 base), **indel** (inserção/deleção pequena), **CNV** (cópias de segmento), **SV** (inversões, translocações, grandes deleções/duplicações).
- **Efeito em proteína:** sinônima/silenciosa; **missense** (troca aa); **nonsense** (vira stop); **frameshift** (indel não múltiplo de 3); splice site; regulatória.
- **Germinativa** (herdável, todas as células) × **somática** (adquirida, ex.: tumor).

### Armadilhas
- Indel múltiplo de 3 é *in-frame* (não frameshift).
- Nonsense no fim do gene pode escapar do NMD e ter efeito menor.
- ClinVar: confira estrelas de revisão; “VUS” = significado incerto, não “benigno”.

@@ BIO1:3
> **O que esperar:** como frequências alélicas mudam em populações e por que alelos vizinhos são herdados juntos (base de GWAS). Base: MIT 7.01SC (linkage), OpenIntro cap. 3.

### Conceitos
- **Hardy-Weinberg:** p + q = 1; genótipos p², 2pq, q² se não há seleção, mutação, migração, deriva e o cruzamento é aleatório.
- Teste: compare observados × esperados (qui-quadrado, 1 g.l.). Desvio em dados de sequenciamento pode indicar **erro de genotipagem**.
- **Deriva genética:** variação aleatória, mais forte em populações pequenas (gargalo, efeito fundador). **Seleção** muda frequências de forma direcional.
- **Recombinação** separa alelos; **desequilíbrio de ligação (LD)** = associação não aleatória entre alelos próximos (medidas D', r²).

### Código
```python
AA, Aa, aa = 360, 480, 160; n = AA+Aa+aa
p = (2*AA + Aa) / (2*n); q = 1-p
esp = [p*p*n, 2*p*q*n, q*q*n]
from scipy.stats import chisquare
chisquare([AA, Aa, aa], esp, ddof=1)   # ddof=1: p foi estimado
```

### Armadilhas
- GWAS acha SNPs **em LD** com a causal, não necessariamente a causal.
- LD difere entre populações (ancestralidade importa).

@@ BIO1:4
> **O que esperar:** as técnicas de bancada que geram ou validam os dados que você vai analisar. Base: Learn.Genetics Virtual Labs, Khan Academy “Biotechnology”.

### Conceitos
- **PCR:** desnaturação (~95 °C) → anelamento dos primers (~55–65 °C) → extensão (72 °C, Taq). Amplificação exponencial (ideal 2ⁿ).
- **qPCR:** fluorescência por ciclo; **Ct** = ciclo em que cruza o limiar (mais DNA → Ct menor). Eficiência ideal 90–110% (curva padrão, inclinação ≈ −3,32).
- **ΔΔCt:** ΔCt = Ct(alvo) − Ct(referência); ΔΔCt = ΔCt(tratado) − ΔCt(controle); fold change = 2^(−ΔΔCt).
- **Eletroforese:** DNA (negativo) migra ao polo +; fragmentos menores andam mais; ladder para tamanho.
- **Sanger:** terminação por ddNTP marcados; reads ~800 pb, alta acurácia; **cromatograma** com picos — duplo pico = heterozigoto ou mistura.
- **Clonagem:** enzima de restrição, ligase, vetor, transformação, seleção.

### Exemplo ΔΔCt
```
Controle: alvo 25, GAPDH 18 → ΔCt 7
Tratado:  alvo 22, GAPDH 18 → ΔCt 4
ΔΔCt = 4 − 7 = −3 → 2^3 = 8× mais expresso
```

### Armadilhas
- ΔΔCt supõe eficiência ~100% para alvo e referência.
- Gene de referência precisa ser estável na condição estudada.
- Início e fim de um cromatograma Sanger têm baixa qualidade.

@@ BIO1:5
> **O que esperar:** onde ficam sequências, genes e anotações, como ler seus identificadores e por que a versão do genoma importa. Base: ajudas do NCBI/Ensembl/UniProt/UCSC, EMBL-EBI Training.

### Conceitos
- **RefSeq:** `NC_` cromossomo, `NM_` mRNA, `NP_` proteína, `XM_/XP_` preditos; sufixo `.2` = versão.
- **Ensembl:** `ENSG` gene, `ENST` transcrito, `ENSP` proteína (+ versão `.15`). **MANE Select** = transcrito de consenso RefSeq/Ensembl.
- **UniProt:** Swiss-Prot (revisado manualmente) × TrEMBL (automático); “canonical sequence” = isoforma de referência.
- **Genomas humanos:** GRCh37/hg19 × GRCh38/hg38 — coordenadas diferentes; converter com liftOver/CrossMap. Nomes `chr1` (UCSC) × `1` (Ensembl).

### Código
```python
from Bio import Entrez, SeqIO
Entrez.email = "voce@exemplo.com"
h = Entrez.efetch(db="nucleotide", id="NM_000546.6", rettype="fasta", retmode="text")
rec = SeqIO.read(h, "fasta")
```
- UCSC Table Browser: genoma + track (NCBI RefSeq/GENCODE) + região → saída BED.

### Armadilhas
- Misturar coordenadas hg19 e hg38 é um dos erros mais comuns em genômica.
- Sempre registre fonte, versão e data de download dos bancos.

@@ PY1:0
> **O que esperar:** o núcleo do Python — tipos, if/for/while, funções e exceções — aplicado a sequências. Base: tutorial oficial caps. 3, 4 e 8; SWC Python.

### Conceitos
- Tipos: `int`, `float`, `str` (imutável), `bool`, `None`. Tudo é objeto; variáveis são nomes (referências).
- Controle: `if/elif/else`, `for x in iterável`, `while`, `break/continue`, `range(n)`, `enumerate`, `zip`.
- Funções: `def f(seq, k=3):` parâmetros com padrão, `return`; **escopo LEGB**; docstring.
- Exceções: `try/except ValueError as e/else/finally`; `raise ValueError("msg")`.

### Código
```python
def gc_content(seq: str) -> float:
    """Fração de G+C (0–1)."""
    seq = seq.upper()
    if not seq:
        raise ValueError("sequência vazia")
    return (seq.count("G") + seq.count("C")) / len(seq)

comp = str.maketrans("ACGT", "TGCA")
revc = "AAAACCCGGT".translate(comp)[::-1]   # Rosalind REVC
rna = "GATGGAACTTGACTACGTAAATT".replace("T", "U")
assert abs(gc_content("GGCC") - 1) < 1e-9
```

### Armadilhas
- Padrão mutável em função (`def f(x=[])`) é compartilhado entre chamadas → use `None`.
- `except:` genérico esconde bugs; capture a exceção específica.
- Divisão `/` sempre dá float; `//` inteira.

@@ PY1:1
> **O que esperar:** escolher a estrutura certa (list, dict, set, tuple) e escrever compreensões. Base: tutorial cap. 5, Rosalind GC/HAMM/PROT.

### Conceitos
- **list:** ordenada, mutável, busca `in` O(n). **tuple:** imutável (pode ser chave). **dict:** chave→valor, busca O(1). **set:** únicos, busca O(1), operações `& | -`.
- Compreensões: `[f(x) for x in xs if cond]`, `{k: v for ...}`, `{x for ...}`; geradores `(x for ...)` economizam memória.
- `collections.Counter`, `defaultdict(list)`.

### Código
```python
from collections import Counter
def kmers(seq, k):
    return Counter(seq[i:i+k] for i in range(len(seq) - k + 1))
kmers("ACGTACGT", 3).most_common(2)

hamming = sum(a != b for a, b in zip(s1, s2))     # Rosalind HAMM
codon = {"AUG": "M", "UAA": None}                  # tabela p/ PROT
prot = "".join(codon[rna[i:i+3]] for i in range(0, len(rna)-2, 3))
```

### Armadilhas
- `in` em lista grande dentro de loop → O(n²); converta para `set`.
- Iterar e modificar a mesma lista/dict ao mesmo tempo.
- Cópia rasa: `b = a` não copia; `a.copy()` / `copy.deepcopy`.

@@ PY1:2
> **O que esperar:** ler/escrever arquivos, organizar código em módulos, isolar dependências e saber quando usar notebook × script. Base: tutorial caps. 6, 7, 12; McKinney cap. 2.

### Conceitos
- `with open(p) as fh:` fecha sozinho; `gzip.open(p, "rt")` para `.gz`. `pathlib.Path` para caminhos (`/`, `.glob`, `.stem`).
- Módulo = arquivo `.py`; pacote = pasta com `__init__.py`. `if __name__ == "__main__":` separa uso como script.
- **venv** (`python -m venv .venv`) ou conda; `pip freeze > requirements.txt`.
- Notebook = exploração; script/módulo = código reutilizável e testável.

### Código
```python
# fasta.py
from pathlib import Path
def read_fasta(path):
    name, seq = None, []
    with open(path) as fh:
        for line in fh:
            line = line.strip()
            if line.startswith(">"):
                if name: yield name, "".join(seq)
                name, seq = line[1:].split()[0], []
            elif line:
                seq.append(line)
    if name: yield name, "".join(seq)

if __name__ == "__main__":
    import sys
    for n, s in read_fasta(sys.argv[1]): print(n, len(s))
```

### Armadilhas
- Concatenar string em loop (`seq += line`) é lento; use lista + `join`.
- Notebooks executados fora de ordem dão resultados irreprodutíveis → “Restart & Run All”.

@@ PY1:3
> **O que esperar:** cálculo vetorizado com NumPy e manipulação de tabelas com pandas (seleção, groupby, merge, pivot, NaN). Base: McKinney caps. 4, 5, 7, 8, 10.

### Conceitos
- **NumPy:** `ndarray` homogêneo; operações vetorizadas; **broadcasting** (formas compatíveis da direita p/ esquerda); `axis=0` linhas↓, `axis=1` colunas→.
- **pandas:** `Series`/`DataFrame` com índice. `loc` (rótulo) × `iloc` (posição). Formato longo × largo.
- `groupby` = split-apply-combine; `merge` (how=inner/left/outer), `pivot_table`, `melt`.
- Ausentes: `isna`, `dropna`, `fillna` — decida conscientemente.

### Código
```python
import numpy as np, pandas as pd
X = np.log2(counts + 1); z = (X - X.mean(1, keepdims=True)) / X.std(1, keepdims=True)
df = pd.read_csv("expr.tsv", sep="\t", index_col=0)
long = df.reset_index().melt(id_vars="gene", var_name="sample", value_name="expr")
long = long.merge(meta, on="sample", how="left")
long.groupby(["gene", "group"])["expr"].agg(["mean", "std"])
long.query("expr > 5 and group == 'tumor'")
```

### Armadilhas
- `SettingWithCopyWarning`: use `.loc[linhas, col] = v` ou `.copy()`.
- `merge` com chaves duplicadas multiplica linhas — confira `len` antes/depois (`validate="one_to_one"`).
- IDs de gene com versão (`ENSG00000141510.17`) não casam sem versão.

@@ PY1:4
> **O que esperar:** montar figuras com matplotlib/seaborn e escolher o gráfico e a escala certos. Base: McKinney cap. 9, Wilke (Fundamentals of Data Visualization) caps. 2, 3, 5.

### Conceitos
- Anatomia: **Figure** → **Axes** (subplots) → artistas (linhas, eixos, legenda). Use a API orientada a objetos.
- Escolha: distribuição → histograma/boxplot/violino; relação → dispersão; comparação → barras/pontos; matriz → heatmap.
- **Escala log** para dados que variam em ordens de grandeza (contagens, p-valores → −log10).
- Mapear dados em estética (posição > comprimento > cor).

### Código
```python
import matplotlib.pyplot as plt, seaborn as sns
fig, axes = plt.subplots(1, 2, figsize=(10, 4), constrained_layout=True)
sns.boxplot(data=long, x="group", y="expr", ax=axes[0])
axes[1].hist(np.log10(lib_sizes), bins=30); axes[1].set_xlabel("log10(reads)")
fig.savefig("fig.png", dpi=300)
sns.clustermap(z, cmap="vlag", center=0)
```

### Armadilhas
- Boxplot esconde n e bimodalidade → adicione pontos (`stripplot`).
- Arco-íris (jet) distorce; use viridis/sequencial ou divergente centrado em 0.
- Eixo de barras sem começar em zero engana.

@@ PY1:5
> **O que esperar:** objetos de sequência e anotação do Biopython, ler/escrever formatos e baixar dados do NCBI. Base: Biopython Tutorial (Seq, SeqRecord, SeqIO, Entrez, BLAST), E-utilities.

### Conceitos
- `Seq` (sequência), `SeqRecord` (id, descrição, `features`, anotações), `SeqIO.parse/read/write` (fasta, fastq, genbank).
- GenBank: `features` com `type` (gene, CDS), `location` (com strand), `qualifiers` (`locus_tag`, `translation`).
- **Entrez/E-utilities:** ESearch (busca IDs) → EFetch (baixa). Defina `Entrez.email` e `api_key`; respeite 3 req/s (10 com chave).

### Código
```python
from Bio import Entrez, SeqIO
Entrez.email = "voce@exemplo.com"
with Entrez.efetch(db="nuccore", id="NC_000913.3", rettype="gbwithparts", retmode="text") as h:
    rec = SeqIO.read(h, "genbank")
cds = [f for f in rec.features if f.type == "CDS"]
seq0 = cds[0].extract(rec.seq)                 # respeita strand
SeqIO.write(SeqIO.parse("in.gb", "genbank"), "out.fa", "fasta")
ids = Entrez.read(Entrez.esearch(db="gene", term="TP53[gene] AND human[orgn]"))["IdList"]
```

### Armadilhas
- Fatiar `rec.seq[start:end]` ignora a fita; use `feature.extract`.
- `rettype="gb"` pode vir sem sequência em genomas grandes → `gbwithparts`.
- BLAST remoto (`NCBIWWW.qblast`) é lento; para muitos queries use BLAST+ local.

@@ R1:0
> **O que esperar:** os tipos de dados do R e a ideia de vetorização, com data frames e funções. Base: SWC R gapminder (lições 4, 5, 9, 10), R4DS caps. 2 e 27.

### Conceitos
- Vetores atômicos (`logical`, `integer`, `double`, `character`) — tudo é vetor; índices começam em **1**.
- **factor** = categórica com `levels` (ordem importa em modelos e gráficos). **list** = heterogênea. **data.frame** = lista de colunas de mesmo tamanho.
- Vetorização: `x * 2` age em todos; reciclagem de vetores curtos (cuidado).
- Funções: `f <- function(x, na.rm = TRUE) { ... }` — último valor é retornado.

### Código
```r
x <- c(5, 2, NA); mean(x, na.rm = TRUE); x[x > 2 & !is.na(x)]
df <- read.csv("gapminder.csv"); str(df); summary(df); head(df)
df[df$continent == "Asia", c("country", "lifeExp")]
df$grupo <- factor(df$grupo, levels = c("controle", "tratado"))
sapply(df, class); lapply(lista, length)
z <- function(v) (v - mean(v)) / sd(v)
```

### Armadilhas
- `factor` convertido com `as.numeric` dá o código do nível → `as.numeric(as.character(f))`.
- `NA` contamina somas/médias; `NULL` ≠ `NA`.
- `=` × `<-`: use `<-` para atribuição.

@@ R1:1
> **O que esperar:** os verbos do dplyr, o pipe e arrumar tabelas com tidyr (largo↔longo) e joins. Base: R4DS caps. 3, 5, 19.

### Conceitos
- **Tidy data:** cada variável uma coluna, cada observação uma linha, cada valor uma célula.
- Verbos: `filter` (linhas), `select` (colunas), `mutate` (novas), `arrange`, `summarise` + `group_by`, `count`, `distinct`.
- `pivot_longer` (largo→longo) / `pivot_wider` (longo→largo).
- Joins: `left_join`, `inner_join`, `full_join`, `anti_join` (o que não casou).

### Código
```r
library(tidyverse)
long <- counts |> pivot_longer(-gene, names_to = "sample", values_to = "count")
long |> left_join(meta, by = "sample") |>
  group_by(gene, condition) |>
  summarise(media = mean(count), n = n(), .groups = "drop") |>
  arrange(desc(media))
meta |> anti_join(long, by = "sample")      # amostras sem dados
```

### Armadilhas
- Join com chaves duplicadas multiplica linhas (`relationship = "one-to-one"` para checar).
- Esquecer `ungroup()` / `.groups` muda cálculos seguintes.
- Nomes de coluna com espaço → `` `nome col` ``.

@@ R1:2
> **O que esperar:** a gramática de gráficos do ggplot2 (dados + aes + geoms + facets + temas) e figuras típicas como o volcano. Base: R4DS caps. 1 e 9; Wilke caps. 4, 6, 9.

### Conceitos
- `ggplot(dados, aes(x, y, colour = grupo)) + geom_*() + facet_wrap(~var) + scale_*() + theme_*()`.
- `aes` mapeia variáveis; atributos fixos ficam fora do `aes` (`colour = "red"`).
- Escalas de cor: sequencial (magnitude), divergente (centro com significado), qualitativa (categorias).

### Código
```r
res |> mutate(sig = padj < 0.05 & abs(log2FoldChange) > 1) |>
  ggplot(aes(log2FoldChange, -log10(pvalue), colour = sig)) +
  geom_point(alpha = .5, size = 1) +
  geom_vline(xintercept = c(-1, 1), linetype = 2) +
  scale_colour_manual(values = c("grey60", "firebrick")) +
  theme_bw()
ggsave("volcano.pdf", width = 5, height = 4)
ggplot(long, aes(condition, count)) + geom_boxplot() + geom_jitter(width = .1) + scale_y_log10()
```

### Armadilhas
- Volcano: eixo y usa **p-valor** bruto (forma), a cor usa **padj**.
- Muitas categorias de cor = ilegível; destaque só o que importa.

@@ R1:3
> **O que esperar:** relatórios reprodutíveis que misturam texto, código e resultado (Quarto/RMarkdown) e como organizar um compêndio. Base: docs do Quarto (Using R, parâmetros, cache), Turing Way.

### Conceitos
- **Literate programming:** narrativa + código executável → HTML/PDF/Word.
- Cabeçalho YAML com `title`, `format`, `params`, `execute`. Chunks com opções `#| echo: false`, `#| label: fig-x`.
- **Parâmetros** reaproveitam o mesmo relatório (ex.: uma amostra por render). **Cache** evita recomputar chunks lentos (cuidado com dependências).
- Compêndio de pesquisa: dados + código + ambiente + relatório juntos.

### Código
```yaml
---
title: "QC das amostras"
format: html
params:
  amostra: "S1"
execute:
  echo: false
---
```
Chunk de R dentro do `.qmd` (abre com três crases + `{r}`):
```r
#| label: fig-qc
#| fig-cap: "Qualidade por posição"
dados <- read_tsv(glue::glue("data/{params$amostra}.tsv"))
```
```bash
quarto render relatorio.qmd -P amostra:S2
```

### Armadilhas
- Caminhos absolutos quebram no computador de outra pessoa → use caminhos relativos ao projeto (`here::here`).
- Cache desatualizado mostra resultados velhos; limpe ao mudar os dados.

@@ R1:4
> **O que esperar:** as classes do Bioconductor que guardam dados ômicos com metadados alinhados. Base: vinhetas SummarizedExperiment e GenomicRanges; PH525x.

### Conceitos
- **S4:** classes formais com slots e métodos (acessores, não `@`).
- **SummarizedExperiment:** `assay()` (matriz genes × amostras), `colData()` (metadados das amostras), `rowData()`/`rowRanges()` (genes). Subconjunto mantém tudo alinhado: `se[genes, amostras]`.
- **GRanges:** intervalos genômicos com `seqnames`, `ranges` (IRanges), `strand` + metadados. Operações: `findOverlaps`, `subsetByOverlaps`, `reduce`, `flank`, `promoters`.
- Coordenadas **1-based fechadas** no Bioconductor.

### Código
```r
library(airway); data(airway)
airway; dim(airway); assayNames(airway)
colData(airway)$dex; head(assay(airway, "counts"))
airway[, airway$dex == "trt"]
library(GenomicRanges)
gr <- GRanges("chr1", IRanges(c(100, 500), width = 50), strand = "+")
findOverlaps(gr, GRanges("chr1", IRanges(120, 130)))
```

### Armadilhas
- Ao importar BED (0-based) use `rtracklayer::import`, que converte.
- `seqlevelsStyle` (chr1 × 1) diferente impede overlaps.

@@ MAT:0
> **O que esperar:** intuição geométrica de vetores e matrizes — a linguagem de PCA, regressão e redes neurais. Base: 3Blue1Brown ep. 1–7, Khan Academy, MML cap. 2.

### Conceitos
- Vetor = seta/lista de números; **combinação linear** a·v + b·w; **span** = tudo que se alcança; **base** = conjunto mínimo independente que gera o espaço.
- **Independência linear:** nenhum vetor é combinação dos outros. **Posto (rank)** = nº de colunas independentes.
- Matriz = **transformação linear** (colunas = para onde vão os vetores da base). Produto AB = aplicar B, depois A (não comutativo).
- **Determinante** = fator de mudança de área/volume; det = 0 → achata o espaço → sem inversa.
- Inversa A⁻¹ desfaz A; sistemas Ax = b.

### Código
```python
import numpy as np
A = np.array([[2, 1], [1, 3]]); v = np.array([1, 2])
A @ v; np.linalg.det(A); np.linalg.inv(A); np.linalg.matrix_rank(A)
np.linalg.solve(A, np.array([3, 5]))     # melhor que inv(A) @ b
np.allclose(A @ np.linalg.inv(A), np.eye(2))
```

### Armadilhas
- Em genômica a matriz é quase sempre **posto deficiente** (p genes ≫ n amostras).
- Matriz de design com colunas colineares (ex.: lote = condição) não tem solução única.

@@ MAT:1
> **O que esperar:** autovalores/autovetores e SVD — a matemática por trás de PCA e de redução de dimensionalidade. Base: 3Blue1Brown ep. 13–15, MML cap. 4.

### Conceitos
- **Autovetor:** direção que a transformação só estica: A v = λ v; λ = autovalor (fator).
- Matriz simétrica (ex.: covariância) → autovetores ortogonais, autovalores reais.
- **SVD:** X = U Σ Vᵀ para qualquer matriz; Σ = valores singulares (ordem decrescente); V = direções nas colunas (genes → loadings), U·Σ = coordenadas das amostras.
- **PCA** = SVD da matriz **centrada**; variância explicada do PC k = σₖ² / Σσ².
- Aproximação de posto baixo: manter os k primeiros componentes.

### Código
```python
Xc = X - X.mean(axis=0)               # amostras nas linhas
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)
var_exp = s**2 / (s**2).sum()
scores = U * s                         # coordenadas das amostras
loadings = Vt.T                        # peso de cada gene no PC
```

### Armadilhas
- Sem centralizar, o PC1 só reflete a média.
- Sem escalar, genes de alta variância dominam; com escala, ruído ganha peso — decida conforme o dado.
- O sinal (±) de um PC é arbitrário.

@@ MAT:2
> **O que esperar:** derivada como taxa de variação, regra da cadeia e gradiente descendente — como modelos “aprendem”. Base: 3Blue1Brown Essence of Calculus ep. 1–4, MML cap. 5.

### Conceitos
- Derivada f'(x) = inclinação local; regras: potência, produto, **cadeia** (f(g(x)))' = f'(g(x))·g'(x).
- **Gradiente** ∇f = vetor de derivadas parciais; aponta para maior subida.
- Mínimo: ∇f = 0; função convexa → mínimo global único.
- **Gradiente descendente:** θ ← θ − η ∇L(θ); η = taxa de aprendizado.

### Código
```python
# regressão linear y ≈ w*x + b, perda MSE
w = b = 0.0; lr = 0.01
for _ in range(5000):
    pred = w*x + b; err = pred - y
    w -= lr * 2 * (err * x).mean()
    b -= lr * 2 * err.mean()
```

### Armadilhas
- η alto diverge, baixo demora; normalize as features.
- Comparar com a solução fechada (`np.polyfit`) para validar.
- Backpropagation = regra da cadeia aplicada camada a camada.

@@ MAT:3
> **O que esperar:** probabilidade condicional, Bayes e as distribuições que modelam dados biológicos (contagens!). Base: Seeing Theory, OpenIntro caps. 3–4.

### Conceitos
- P(A|B) = P(A∩B)/P(B). Independência: P(A∩B) = P(A)P(B).
- **Bayes:** P(H|D) = P(D|H)·P(H)/P(D). Ex.: teste com 99% de sensibilidade em doença rara ainda gera muitos falsos positivos (prevalência importa).
- **Binomial**(n, p): nº de sucessos. **Poisson**(λ): contagens, média = variância. **Normal**(μ, σ). **Binomial negativa**: contagens com **sobredispersão** (variância > média) — modelo do RNA-seq.

### Código
```python
from scipy import stats
stats.binom.pmf(3, n=10, p=.2); stats.poisson.pmf(0, mu=2)
stats.norm.cdf(1.96)                         # ≈ 0.975
# Bayes de um teste
prev, sens, esp = .001, .99, .95
ppv = sens*prev / (sens*prev + (1-esp)*(1-prev))   # ≈ 2%
rng = np.random.default_rng(1); x = rng.negative_binomial(5, .3, 10000); x.var() > x.mean()
```

### Armadilhas
- Confundir P(dados|H0) (p-valor) com P(H0|dados).
- Réplicas biológicas de RNA-seq não são Poisson → por isso DESeq2/edgeR usam NB.

@@ MAT:4
> **O que esperar:** por que quase todo dado ômico é analisado em log, o que é log2 fold change e como estabilizar a variância. Base: MSMB cap. 8.

### Conceitos
- **log2FC = 1** → dobro; −1 → metade; 0 → igual. Simétrico (2× e 0,5× ficam a mesma distância).
- **Pseudocontagem**: log2(x + 1) evita log(0), mas distorce genes de baixa contagem.
- Contagens têm variância que cresce com a média → **VST** (DESeq2 `vst`) e **rlog** deixam a variância ~constante — use para PCA/clustering/heatmap, **não** para o teste de DE (que usa contagens brutas).
- −log10(p): p = 0,05 → 1,3; p = 10⁻⁸ → 8.

### Código
```r
library(DESeq2)
dds <- DESeqDataSet(airway, ~ cell + dex)
vsd <- vst(dds, blind = TRUE); plotPCA(vsd, intgroup = "dex")
library(vsn); meanSdPlot(log2(counts(dds) + 1)); meanSdPlot(assay(vsd))
```

### Armadilhas
- Calcular fold change em dados já log (subtração, não divisão!).
- Média de valores log ≠ log da média.

@@ GIT:0
> **O que esperar:** o modelo mental do Git (snapshots, staging, HEAD, branches) e o ciclo diário de commits e merges. Base: SWC Git lições 1–6, Pro Git caps. 1–3.

### Conceitos
- Três áreas: **working tree** → `add` → **staging (index)** → `commit` → **repositório**.
- Commit = snapshot completo + mensagem + pai(s), identificado por hash.
- **Branch** = ponteiro móvel para um commit; **HEAD** = onde você está.
- Merge fast-forward × merge commit; **conflito** = mesma região alterada nas duas branches.

### Comandos
```bash
git init; git status; git diff; git diff --staged
git add arq.py; git commit -m "Adiciona parser de FASTA"
git log --oneline --graph --all
git switch -c feature/kmers; git switch main; git merge feature/kmers
# conflito: editar marcas <<<<<<< ======= >>>>>>>, depois
git add arq.py && git commit
git restore arq.py            # descarta mudança não commitada
git restore --staged arq.py   # tira do staging
git revert <hash>             # desfaz commit criando outro (seguro)
```

### Armadilhas
- Não versionar dados grandes nem segredos (`.gitignore` antes do primeiro commit).
- `git reset --hard` apaga trabalho não commitado.
- Mensagens no imperativo, curtas e com o porquê.

@@ GIT:1
> **O que esperar:** colaborar pelo GitHub — remotos, pull requests, revisão de código, forks, proteção de branch e .gitignore. Base: GitHub Docs.

### Conceitos
- `origin` = seu remoto; `upstream` = repositório original de um fork.
- **Fluxo de PR:** branch → commits → push → abrir PR → revisão/CI → merge → apagar branch.
- **Code review:** comentários específicos, sugestões, aprovação; PRs pequenos revisam melhor.
- **Branch protegida:** exige PR, revisão e CI verde antes do merge em `main`.

### Comandos
```bash
git remote add origin git@github.com:user/repo.git
git push -u origin feature/kmers
gh pr create --fill; gh pr view --web; gh pr checkout 12
git fetch upstream && git rebase upstream/main     # atualizar fork
```
```gitignore
data/raw/
*.bam
.env
__pycache__/
.ipynb_checkpoints/
```

### Armadilhas
- `.gitignore` não remove arquivos já rastreados → `git rm --cached arq`.
- Nunca `push --force` em branch compartilhada (use `--force-with-lease` se precisar).

@@ GIT:2
> **O que esperar:** organizar um projeto computacional para que você (e outros) entendam e reproduzam daqui a 6 meses. Base: Noble 2009, Wilson et al. 2017 “Good enough practices”, Turing Way RDM.

### Conceitos
- Estrutura: `data/raw` (imutável), `data/processed`, `scripts/` ou `src/`, `results/` (por data, `2026-11-06_qc/`), `doc/`, `README.md`.
- **Dados brutos nunca são editados**; tudo derivado é recriável por script.
- **Notebook de laboratório** datado: o que fez, por quê, o que viu.
- **Script “driver”** (ou Makefile/Snakefile) que roda tudo em ordem.
- Nomes legíveis por máquina e humanos; ISO 8601 para datas.

### Código
```bash
pipx install cookiecutter
cookiecutter gh:drivendata/cookiecutter-data-science
# ou o seu template: cookiecutter ~/templates/projeto-bioinfo
```

### Armadilhas
- “final_v2_corrigido.xlsx” = sinal de falta de versionamento.
- Excel converte nomes de genes em datas (SEPT2 → 2-Sep).

@@ GIT:3
> **O que esperar:** fixar versões do software e da aleatoriedade para que o mesmo código produza o mesmo resultado. Base: Bioconda FAQs, Sandve et al. 2013 (regras 1–4, 6).

### Conceitos
- **environment.yml** (o que você pediu) × **lockfile** (versões exatas resolvidas: `conda-lock`, `renv.lock`, `uv.lock`).
- `renv` no R: `init` → `snapshot` → `restore`.
- **Sementes aleatórias** em qualquer etapa estocástica (bootstrap, UMAP, ML, subsampling).
- 10 regras de Sandve: registrar como cada resultado foi gerado, evitar passos manuais, arquivar versões exatas, versionar scripts…

### Código
```yaml
name: ngs
channels: [conda-forge, bioconda]
dependencies: [python=3.12, fastp=0.23.4, samtools=1.20]
```
```bash
conda-lock -f environment.yml -p linux-64
```
```r
renv::init(); renv::snapshot(); renv::restore()
set.seed(42)
```
```python
rng = np.random.default_rng(42)
```

### Armadilhas
- `conda env export` sem `--from-history` inclui builds específicos de SO (não portável).
- Semente só no início não basta se a ordem das chamadas muda; registre versões de bibliotecas.
