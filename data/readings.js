// Plano de leitura por sessão.
// Chave: "MÓDULO:índice do tópico" (mesma ordem de data/curriculum.js).
// Valor: { idDoMaterial: trecho } onde trecho é:
//   - "texto" ou L("texto", "url direta")  → mesmo trecho em todas as sessões de teoria do tópico
//   - [trechoSessão1, trechoSessão2, ...]   → um trecho por sessão de teoria (null = não usar nessa sessão)
// As sessões de prática mostram os trechos do tópico como consulta.
// O progresso é salvo por trecho (material + texto do trecho): se o texto mudar, a marcação daquele trecho é reiniciada.
(() => {
  const L = (t, u) => ({ t, u });
  const SWC = "https://swcarpentry.github.io/shell-novice/";
  const MS = "https://missing.csail.mit.edu/2020/";
  const PY = "https://docs.python.org/3/tutorial/";
  const PYDA = "https://wesmckinney.com/book/";
  const WILKE = "https://clauswilke.com/dataviz/";
  const BIOPY = "https://biopython.org/docs/latest/Tutorial/";
  const SWCR = "https://swcarpentry.github.io/r-novice-gapminder/";
  const R4DS = "https://r4ds.hadley.nz/";
  const GC = "https://genomicsclass.github.io/book/pages/";
  const MSMB = "https://www.huber.embl.de/msmb/";
  const GIT = "https://swcarpentry.github.io/git-novice/";
  const PG = "https://git-scm.com/book/en/v2/";
  const SEE = "https://seeing-theory.brown.edu/";
  const SQLB = "https://sqlbolt.com/lesson/";
  const SWCSQL = "https://swcarpentry.github.io/sql-novice-survey/";
  const PGT = "https://www.postgresql.org/docs/current/";
  const BA = "https://www.bioinformaticsalgorithms.org/";
  const M791 = "https://ocw.mit.edu/courses/7-91j-foundations-of-computational-and-systems-biology-spring-2014/resources/";
  const CG = "https://github.com/BenLangmead/comp-genomics-class/blob/master/notebooks/";
  const BS = "https://www.biostarhandbook.com/";
  const GTN = "https://training.galaxyproject.org/training-material/topics/";
  const HBC = "https://hbctraining.github.io/Intro-to-DGE/lessons/";
  const HBCR = "https://hbctraining.github.io/Intro-to-bulk-RNAseq/lessons/";
  const TW = "https://book.the-turing-way.org/reproducible-research/";
  const M701 = "https://ocw.mit.edu/courses/7-01sc-fundamentals-of-biology-fall-2011/pages/";
  const NFT = "https://training.nextflow.io/latest/";
  const SMK = "https://snakemake.readthedocs.io/en/stable/";
  const D2L = "https://d2l.ai/";
  const DC = "https://datacarpentry.github.io/";
  const ISL = "ISLP (2023, PDF gratuito) — ";

  window.READINGS = {
    // =================== LNX ===================
    "LNX:0": {
      swcShell: L("Lições 1–3: Introducing the Shell; Navigating Files and Directories; Working With Files and Directories", SWC + "02-filedir.html"),
      missing: L("Aula 1 — Course Overview + The Shell (notas + exercícios)", MS + "course-shell/"),
      tlcl: "Caps. “Navigation”, “Exploring the System”, “Manipulating Files and Directories” e “Permissions”",
    },
    "LNX:1": {
      swcShell: L("Lição 4: Pipes and Filters (+ lição 7: Finding Things, seção sobre grep)", SWC + "04-pipefilter.html"),
      missing: L("Aula 4 — Data Wrangling (regex, sed, awk, sort/uniq)", MS + "data-wrangling/"),
      dcGenomics: L("Shell Genomics, lição 4: Redirection (grep em FASTQ, >, >>, pipes)", DC + "shell-genomics/04-redirection.html"),
    },
    "LNX:2": {
      swcShell: L("Lições 5–6: Loops; Shell Scripts", SWC + "06-script.html"),
      tlcl: "Parte “Writing Shell Scripts”: caps. “Writing Your First Script”, “Flow Control: Branching with if”, “Flow Control: Looping with while/until”, “Positional Parameters” e “Flow Control: Looping with for”",
    },
    "LNX:3": {
      missing: L("Aula 5 — Command-line Environment (job control, tmux, dotfiles, SSH)", MS + "command-line/"),
      bioconda: L("Página “Usage”: configuração de canais e instalação com conda/mamba", "https://bioconda.github.io/"),
    },
    // =================== BIO1 ===================
    "BIO1:0": {
      alberts: ["Cap. 4 — DNA and Chromosomes: seção “The Structure and Function of DNA”", "Cap. 3 — Proteins: seções “The Shape and Structure of Proteins” e “Protein Function”"],
      mit701: [L("Unidade Molecular Biology — DNA Structure, Classic Experiments", M701 + "molecular-biology/dna-structure-classic-experiments/"), L("Unidade Biochemistry — Proteins, Levels of Structure, Non-Covalent Forces", M701 + "biochemistry/proteins-levels-of-structure-non-covalent-forces/")],
      khanBio: ["Unidade “DNA as the genetic material” / “Central dogma” (vídeos de estrutura do DNA e RNA)", "Unidade “Macromolecules” — aulas sobre proteínas e níveis de estrutura"],
    },
    "BIO1:1": {
      alberts: ["Cap. 6 — How Cells Read the Genome: seções “From DNA to RNA” e “From RNA to Protein” (+ Cap. 5, “DNA Replication Mechanisms”, leitura rápida)", "Cap. 7 — Control of Gene Expression: “An Overview of Gene Control”, “How Genetic Switches Work” e “Posttranscriptional Controls”"],
      mit701: [L("Unidade Molecular Biology — DNA Replication e Transcription, Translation", M701 + "molecular-biology/transcription-translation/"), L("Unidade Molecular Biology — Gene Regulation and the Lac Operon", M701 + "molecular-biology/gene-regulation-and-the-lac-operon/")],
    },
    "BIO1:2": {
      learnGen: ["Seções “Basic Genetics” e “Heredity and Traits”", null],
      nhgriGloss: [null, "Verbetes: Point Mutation, Insertion, Deletion, Copy Number Variation, Structural Variation, Missense, Nonsense, Frameshift Mutation"],
      khanBio: ["Unidade “Classical and molecular genetics” — Mendelian genetics", "Unidade “Classical and molecular genetics” — mutações (tipos e efeitos)"],
    },
    "BIO1:3": {
      mit701: L("Unidade Genetics — Linkage and Recombination, Genetic Maps (base para desequilíbrio de ligação)", M701 + "genetics/linkage-and-recombination-genetic-maps/"),
      openintro: "Cap. 3 — Probability, seções 3.1–3.2 (regra do produto e probabilidade condicional, usadas no cálculo de Hardy-Weinberg)",
    },
    "BIO1:4": {
      learnGen: "Laboratórios virtuais: “PCR”, “Gel Electrophoresis” e “DNA Extraction” (Virtual Labs)",
      khanBio: "Unidade “Biotechnology” — aulas “Polymerase chain reaction (PCR)”, “Gel electrophoresis” e “DNA sequencing”",
    },
    "BIO1:5": {
      ncbi: "Páginas de ajuda de Gene e RefSeq (prefixos NM_, NP_, NC_ e versões)",
      ensembl: "Documentação “Stable IDs” (ENSG/ENST/ENSP e versões) + página de um gene no navegador",
      uniprot: "Help: “What is the canonical sequence?” e diferença Swiss-Prot × TrEMBL",
      ucsc: "Training: “Table Browser” e “Genome assembly releases” (hg19 × hg38)",
      ebiTrain: "Curso on-demand “Bioinformatics for the terrified” ou “Ensembl browser” (1º módulo)",
    },
    // =================== PY1 ===================
    "PY1:0": {
      pyTut: L("Caps. 3 (An Informal Introduction), 4 (More Control Flow Tools) e 8 (Errors and Exceptions)", PY + "controlflow.html"),
      swcPy: L("Lições 1, 7, 8 e 9: Python Fundamentals; Making Choices; Creating Functions; Errors and Exceptions", "https://swcarpentry.github.io/python-novice-inflammation/08-func.html"),
    },
    "PY1:1": {
      pyTut: L("Cap. 5 — Data Structures (listas, compreensões, tuplas, sets, dicionários)", PY + "datastructures.html"),
      rosalind: L("Problemas DNA, RNA, REVC, GC e HAMM (Bioinformatics Stronghold)", "https://rosalind.info/problems/list-view/"),
    },
    "PY1:2": {
      pyTut: L("Caps. 6 (Modules), 7 (Input and Output) e 12 (Virtual Environments and Packages)", PY + "venv.html"),
      pyda: L("Cap. 2 — Python Language Basics, IPython, and Jupyter Notebooks (+ Cap. 3, seção 3.3 Files and the Operating System)", PYDA + "python-basics"),
    },
    "PY1:3": {
      pyda: [L("Cap. 4 — NumPy Basics: Arrays and Vectorized Computation", PYDA + "numpy-basics"), L("Cap. 5 — Getting Started with pandas (+ Cap. 8 Join/Combine/Reshape e Cap. 10 Group Operations, seções iniciais)", PYDA + "pandas-basics")],
    },
    "PY1:4": {
      pyda: L("Cap. 9 — Plotting and Visualization (matplotlib e seaborn)", PYDA + "plotting-and-visualization"),
      wilke: L("Caps. 2 (Mapping data onto aesthetics), 3 (Coordinate systems and axes — escalas log) e 5 (Directory of visualizations)", WILKE + "coordinate-systems-axes.html"),
    },
    "PY1:5": {
      biopython: L("Tutorial: caps. “Sequence objects”, “Sequence annotation objects”, “Sequence Input/Output”, “Accessing NCBI’s Entrez databases” e “BLAST”", BIOPY + "index.html"),
      eutils: "Capítulo “A General Introduction to the E-utilities” (ESearch, EFetch, chaves de API e limites)",
    },
    // =================== R1 ===================
    "R1:0": {
      swcR: L("Lições 4, 5, 9 e 10: Data Structures; Exploring Data Frames; Vectorization; Functions Explained", SWCR + "04-data-structures-part1.html"),
      r4ds: L("Caps. 2 (Workflow: basics) e 27 (A field guide to base R)", R4DS + "base-R.html"),
    },
    "R1:1": {
      r4ds: L("Caps. 3 (Data transformation), 5 (Data tidying) e 19 (Joins)", R4DS + "data-transform.html"),
    },
    "R1:2": {
      r4ds: L("Caps. 1 (Data visualization) e 9 (Layers)", R4DS + "layers.html"),
      wilke: L("Caps. 4 (Color scales), 6 (Visualizing amounts) e 9 (Visualizing many distributions at once)", WILKE + "color-basics.html"),
    },
    "R1:3": {
      quarto: L("Guide: “Using R” (computations) e “Markdown Basics”; Reference: parâmetros e cache", "https://quarto.org/docs/computations/r.html"),
      turingway: L("Guide for Reproducible Research — “Overview” e “Research Compendia”", TW + "compendia"),
    },
    "R1:4": {
      bioc: L("Vinhetas: “SummarizedExperiment for Coordinating Experimental Assays” e “An Introduction to the GenomicRanges Package”", "https://bioconductor.org/packages/release/bioc/html/SummarizedExperiment.html"),
      genomicsclass: L("“Data structure and management for genome scale experiments” + “Interlude: GenomicRanges”", GC + "bioc1_igranges.html"),
    },
    // =================== MAT ===================
    "MAT:0": {
      b3b1b: ["Essence of Linear Algebra, ep. 1–2: Vectors; Linear combinations, span, and basis vectors", "Essence of Linear Algebra, ep. 3–7: Linear transformations; Matrix multiplication as composition; 3D; The determinant; Inverse matrices, column space and null space"],
      khanLA: ["Unidade “Vectors and spaces” — vetores, combinações lineares e span, independência linear", "Unidade “Matrix transformations” — funções e transformações lineares, inversas e determinantes"],
      mml: [L("Cap. 2 — Linear Algebra, seções 2.4–2.6 (espaços vetoriais, independência, base e posto)", "https://mml-book.github.io/book/mml-book.pdf"), L("Cap. 2, seções 2.2–2.3 e 2.7 (matrizes, sistemas lineares, aplicações lineares) + Cap. 4, seção 4.1 (determinante e traço)", "https://mml-book.github.io/book/mml-book.pdf")],
    },
    "MAT:1": {
      b3b1b: "Essence of Linear Algebra, ep. 13–15: Change of basis; Eigenvectors and eigenvalues; A quick trick for computing eigenvalues",
      mml: L("Cap. 4 — Matrix Decompositions, seções 4.2 (Eigenvalues and Eigenvectors), 4.4 (Eigendecomposition) e 4.5 (Singular Value Decomposition)", "https://mml-book.github.io/book/mml-book.pdf"),
    },
    "MAT:2": {
      b3b1b: ["Essence of Calculus, ep. 1–4: The essence of calculus; The paradox of the derivative; Derivative formulas through geometry; Visualizing the chain rule and product rule", "Neural Networks, ep. 2: Gradient descent, how neural networks learn"],
      mml: [L("Cap. 5 — Vector Calculus, seção 5.1 (Differentiation of Univariate Functions, incl. regra da cadeia)", "https://mml-book.github.io/book/mml-book.pdf"), L("Cap. 5, seção 5.2 (Partial Differentiation and Gradients) + Cap. 7, seção 7.1 (Optimization Using Gradient Descent)", "https://mml-book.github.io/book/mml-book.pdf")],
    },
    "MAT:3": {
      seeing: [L("Capítulos “Compound Probability” (Conditional Probability) e “Bayesian Inference” (Bayes’ Theorem)", SEE + "compound-probability/index.html"), L("Capítulo “Probability Distributions” (Random Variables; Discrete and Continuous)", SEE + "probability-distributions/index.html")],
      openintro: ["Cap. 3 — Probability, seções 3.1 (Defining probability) e 3.2 (Conditional probability, incl. Bayes)", "Cap. 4 — Distributions of random variables: 4.1 Normal, 4.3 Binomial, 4.4 Negative binomial, 4.5 Poisson"],
    },
    "MAT:4": {
      msmb: L("Cap. 8 — High-Throughput Count Data & GLMs: seções sobre transformações de dados de contagem (log com pseudocontagem, VST, rlog) e log fold change", MSMB + "08-chap.html"),
    },
    // =================== GIT ===================
    "GIT:0": {
      swcGit: L("Lições 1–6: Automated Version Control → Ignoring Things", GIT + "04-changes.html"),
      progit: L("Cap. 1.3 What is Git?; Cap. 2 Git Basics (Recording Changes, Viewing History, Undoing Things); Cap. 3.1–3.2 Branches in a Nutshell e Basic Branching and Merging", PG + "Git-Branching-Branches-in-a-Nutshell"),
    },
    "GIT:1": {
      ghDocs: L("Pull requests: “About pull requests”, “Reviewing proposed changes in a pull request”; Repositories: “About protected branches”; “Ignoring files”", "https://docs.github.com/en/pull-requests/reference/pull-requests"),
    },
    "GIT:2": {
      noble2009: "Artigo inteiro (curto): organização de diretórios, notebook de laboratório e scripts “driver”",
      wilson2017: "Seções “Data management” e “Project organization” (+ Box 1 com o resumo das práticas)",
      turingway: L("Guide for Reproducible Research — “Research Data Management”", TW + "rdm"),
    },
    "GIT:3": {
      bioconda: L("Página inicial “Usage” + “FAQs” (canais, prioridade estrita, environment.yml)", "https://bioconda.github.io/"),
      sandve2013: "Regras 1–4 (rastrear como o resultado foi produzido, evitar passos manuais, arquivar versões de programas, versionar scripts) e regra 6 (sementes aleatórias)",
    },
    // =================== EST1 ===================
    "EST1:0": {
      openintro: "Cap. 2 — Summarizing data: 2.1 (dados numéricos: média, variância, quantis, boxplot, outliers) e 2.2 (dados categóricos)",
      statquest: "Vídeos: “Histograms, Clearly Explained”, “Quantiles and Percentiles, Clearly Explained” e “The Normal Distribution, Clearly Explained”",
    },
    "EST1:1": {
      seeing: [L("Capítulo “Probability Distributions” — Central Limit Theorem", SEE + "probability-distributions/index.html#section3"), L("Capítulo “Frequentist Inference” — Point Estimation e Interval Estimation", SEE + "frequentist-inference/index.html")],
      openintro: ["Cap. 5 — Foundations for inference, seção 5.1 (Point estimates and sampling variability)", "Cap. 5, seção 5.2 (Confidence intervals for a proportion) + 7.1 (IC com distribuição t)"],
    },
    "EST1:2": {
      openintro: ["Cap. 5, seção 5.3 (Hypothesis testing for a proportion: erros tipo I/II)", "Cap. 7, seção 7.4 (Power calculations for a difference of means)"],
      asa2016: [null, "Declaração inteira (6 princípios) — foco no que o p-valor NÃO significa"],
      pos: ["Colunas “Significance, P values and t-tests” e “Power and sample size”", "Colunas “Interpreting P values” e “P values and the search for significance”"],
    },
    "EST1:3": {
      openintro: "Caps. 7.1–7.3 (t de uma amostra, pareado e duas amostras) e 6.3–6.4 (qui-quadrado: aderência e independência)",
      genomicsclass: L("“t-test in practice”, “Rank tests” e “Association tests” (Fisher e qui-quadrado)", GC + "association_tests.html"),
    },
    "EST1:4": {
      openintro: "Cap. 8 — Introduction to linear regression: 8.1 (Fitting a line, residuals, and correlation) e 8.2 (Least squares regression)",
      statquest: "Vídeos: “Pearson’s Correlation, Clearly Explained”, “R-squared, Clearly Explained” e “Linear Regression, Clearly Explained”",
    },
    "EST1:5": {
      msmb: L("Cap. 4 — Mixture Models, seção “The bootstrap”; Cap. 6 — Testing, seções sobre testes por permutação", MSMB + "06-chap.html"),
    },
    // =================== SQL ===================
    "SQL:0": {
      sqlbolt: L("Lições 1–5 e 10–12 (SELECT, filtros, ordenação, agregações, ordem de execução)", SQLB + "select_queries_introduction"),
      swcSql: L("Lições 1–6: Selecting Data → Aggregation", SWCSQL + "06-agg.html"),
    },
    "SQL:1": {
      pgTut: L("Tutorial 2.6 (Joins Between Tables) e 3.5 (Window Functions)", PGT + "tutorial-window.html"),
      sqlbolt: L("Lições 6–9 (INNER/OUTER JOINs, NULLs, expressões)", SQLB + "select_queries_with_joins"),
    },
    "SQL:2": {
      pgTut: L("Tutorial 2.2–2.3 (Concepts; Creating a New Table) e 3.2–3.4 (Views; Foreign Keys; Transactions)", PGT + "tutorial-fk.html"),
    },
    "SQL:3": {
      duckdb: L("Clients → Python API (overview) e R API; Data Import → Parquet Files", "https://duckdb.org/docs/stable/clients/python/overview"),
    },
    "SQL:4": {
      ensRest: L("Página de endpoints: lookup/id, sequence/id, overlap/region + “Rate limits” e exemplos em Python/R", "https://rest.ensembl.org/"),
      eutils: "Capítulo “The E-utilities In-Depth: Parameters, Syntax and More” (retmax/retstart, history server)",
    },
    // =================== ALG ===================
    "ALG:0": {
      pythonds: "Caps. “Algorithm Analysis” (Big-O), “Recursion” e “Sorting and Searching” (busca binária e hashing)",
    },
    "ALG:1": {
      rosalind: L("Problemas BA1A–BA1D (Pattern Count, Frequent Words, Reverse Complement, Pattern Matching)", "https://rosalind.info/problems/list-view/?location=bioinformatics-textbook-track"),
      bioalgo: L("Cap. 1 — Where in the Genome Does DNA Replication Begin? (k-mers frequentes) + Cap. 2 — Which DNA Patterns Play the Role of Molecular Clocks? (motivos), seções iniciais", BA + "bioinformatics-chapter-1"),
    },
    "ALG:2": {
      bioalgo: [L("Cap. 5 — How Do We Compare Biological Sequences?: Manhattan Tourist, programação dinâmica, matrizes de score", BA + "bioinformatics-chapter-5"), L("Cap. 5: alinhamento local, penalidades de gap afim e alinhamento em espaço linear", BA + "bioinformatics-chapter-5")],
      mit791: [L("Lecture 3: Global Alignment of Protein Sequences (NW, SW, PAM, BLOSUM)", M791 + "lecture-3-global-alignment-of-protein-sequences-nw-sw-pam-blosum/"), L("Lecture 2: Local Alignment (BLAST) and Statistics", M791 + "lecture-2-local-alignment-blast-and-statistics/")],
    },
    "ALG:3": {
      langmead: [L("Notebooks CG_SuffixTrie, CG_SuffixTree e CG_BinarySearchSA (suffix trie/tree/array)", CG + "CG_BinarySearchSA.ipynb"), L("Notebooks CG_BWT_SimpleBuild, CG_BWT_Reverse e CG_FmIndex (BWT, LF-mapping, FM-index)", CG + "CG_FmIndex.ipynb")],
      liDurbin: [null, "Seção Methods: “Burrows–Wheeler transform”, “Prefix trie and string matching” e “Inexact matching”"],
    },
    "ALG:4": {
      bioalgo: L("Cap. 3 — How Do We Assemble Genomes? (grafos de De Bruijn, caminhos eulerianos, read-pairs e erros)", BA + "bioinformatics-chapter-3"),
    },
    "ALG:5": {
      bioalgo: ["Vol. II, cap. 10 — Why Have Biologists Still Not Developed an HIV Drug? (HMMs: Viterbi e forward)", "Vol. II, cap. 7 — Which Animal Gave Us SARS? (árvores por distância, UPGMA, neighbor-joining, parcimônia)"],
      mit791: [L("Lecture 10: Markov and Hidden Markov Models of Genomic and Protein Features", M791 + "lecture-10-markov-and-hidden-markov-models-of-genomic-and-protein-features/"), null],
    },
    // =================== BIO2 ===================
    "BIO2:0": {
      brownGenomes: ["Caps. 7 (Eukaryotic Nuclear Genomes), 8 (Genomes of Prokaryotes and Eukaryotic Organelles) e 9 (Virus Genomes and Mobile Genetic Elements)", "Caps. 10 (Accessing the Genome — cromatina) e 14 (Regulation of Genome Activity)"],
    },
    "BIO2:1": {
      goodwin2016: ["Seções sobre sequenciamento de leitura curta (sequencing by synthesis e by ligation) e Tabela 1 (plataformas)", "Seções sobre leitura longa (PacBio SMRT, Oxford Nanopore, synthetic long reads) e aplicações"],
      biostar: [L("“Sequencing instruments” e “Illumina sequencers” (exige login no Biostar Handbook)", BS + "illumina.html"), L("“PacBio sequencers” e “Minion sequencers” (exige login no Biostar Handbook)", BS + "pacbio.html")],
    },
    "BIO2:2": {
      biostar: L("“Sequencing data preparation” e “Sequencing coverage” (exige login no Biostar Handbook)", BS + "sequencing-coverage.html"),
      conesa2016: "Seção “Experimental design” (réplicas, profundidade, tipo de biblioteca)",
    },
    "BIO2:3": {
      stark2019: ["Resumo, introdução e seções sobre aplicações do RNA-seq em bulk (quantificação, isoformas)", "Seções sobre single-cell e transcriptômica espacial"],
      stephens2015: [null, "Artigo inteiro (curto): escala de aquisição, armazenamento e análise de dados genômicos"],
    },
    "BIO2:4": {
      kg1000: [L("Página “About” do IGSR + FAQ sobre frequências alélicas por população", "https://www.internationalgenome.org/about"), null],
      gnomad: [L("“About” e página de ajuda sobre frequências (AF, popmax/grpmax) e constraint", "https://gnomad.broadinstitute.org/help"), null],
      gwasCat: [null, L("Documentação “About” + navegar 1 traço (ex.: altura) observando p-valor, OR/beta e mapeamento", "https://www.ebi.ac.uk/gwas/docs/about")],
    },
    // =================== NGS ===================
    "NGS:0": {
      htsSpecs: ["SAMv1.pdf, seção 1 (The SAM Format Specification: 1.4 mandatory fields — FLAG, CIGAR, MAPQ) + qualidade Phred", "Seções sobre coordenadas (1-based no SAM) — para VCF/BED/GFF use os trechos do Biostar ao lado"],
      biostar: [L("“The FASTA format”, “The FASTQ format” e “The SAM format explained” (exige login no Biostar Handbook)", BS + "the-sam-format-explained.html"), L("“The Variant Call Format (VCF)” e “Visualizing interval data” (BED 0-based × GFF 1-based)", BS + "vcf.html")],
    },
    "NGS:1": {
      fastqc: L("Help → “Analysis Modules” (ler os 11 módulos e exemplos de bom/ruim)", "https://www.bioinformatics.babraham.ac.uk/projects/fastqc/Help/3%20Analysis%20Modules/"),
      multiqc: L("Docs: “Running MultiQC” e “Using MultiQC Reports”", "https://docs.seqera.io/multiqc"),
      fastp: L("README: seções sobre adapter trimming, filtros de qualidade e deduplicação", "https://github.com/OpenGene/fastp"),
      galaxy: L("Tutorial “Quality Control” (Sequence analysis)", GTN + "sequence-analysis/tutorials/quality-control/tutorial.html"),
    },
    "NGS:2": {
      liDurbin: "Resumo, Introdução e Discussão (por que BWT para reads curtos; limitações com indels)",
      minimap2: L("README: seção “Use cases” (presets map-ont, map-hifi, sr, splice)", "https://github.com/lh3/minimap2#use-cases"),
      dcGenomics: L("Wrangling Genomics, lição 4: Variant Calling Workflow (seção de alinhamento com bwa mem)", DC + "wrangling-genomics/04-variant_calling.html"),
    },
    "NGS:3": {
      htslib: L("Workflows: “Filtering and sorting” / manual do samtools (sort, index, markdup, flagstat, stats)", "https://www.htslib.org/doc/samtools.html"),
      danecek2021: "Seções de funcionalidades do SAMtools (sort/markdup/stats) e discussão sobre formatos",
    },
    "NGS:4": {
      igv: L("IGV Desktop User Guide: “Viewing Alignments” (cores, insert size, pares discordantes)", "https://igv.org/doc/desktop/"),
    },
    "NGS:5": {
      galaxy: L("Tutoriais “An Introduction to Genome Assembly” e “Genome Assembly of a bacterial genome (MRSA) sequenced using Illumina MiSeq Data”", GTN + "assembly/tutorials/general-introduction/tutorial.html"),
      bioalgo: L("Cap. 3 — revisão das seções sobre repetições e erros na montagem", BA + "bioinformatics-chapter-3"),
    },
    // =================== MCI ===================
    "MCI:0": {
      leekPeng2015: "Artigo inteiro (1 página) + fluxograma da figura para classificar a pergunta",
    },
    "MCI:1": {
      pos: ["Colunas “Replication” e “Sources of variation”", "Colunas “Designing comparative experiments” e “Analysis of variance and blocking”"],
      msmb: [null, L("Cap. 13 — Design of High Throughput Experiments and their Analyses (seções sobre blocagem, randomização e poder)", MSMB + "13-chap.html")],
    },
    "MCI:2": {
      leek2010: ["Artigo inteiro: definição de batch effect, exemplos e diagnóstico", null],
      whatif: [null, "Parte I, caps. 1–3 (definição de efeito causal, experimentos randomizados) e cap. 6 (Graphical representation of causal effects — DAGs)"],
    },
    "MCI:3": {
      ioannidis2005: "Artigo inteiro: o modelo de PPV e os 6 corolários",
      button2013: "Resumo, Introdução e seção sobre consequências do baixo poder",
      cos: L("Página “Preregistration” (o que é, quando faz sentido)", "https://www.cos.io/initiatives/prereg"),
      sandve2013: "Releitura rápida das 10 regras com foco nas regras 7–10 (resultados intermediários, acesso público)",
    },
    "MCI:4": {
      callingbs: L("Aulas/vídeos “Spotting Bullshit” e “Causality”", "https://callingbullshit.org/syllabus.html"),
      sdw: L("Caps. “An Introduction to Statistical Significance”, “Statistical Power and Underpowered Statistics” e “Pseudoreplication”", "https://www.statisticsdonewrong.com/"),
    },
    "MCI:5": {
      callingbs: L("Aulas “Publication bias” e “Predatory publishing and scientific misconduct” (leituras indicadas no syllabus)", "https://callingbullshit.org/syllabus.html"),
    },
    // =================== EST2 ===================
    "EST2:0": {
      genomicsclass: [L("“Linear models introduction”, “Expressing design formula” e “Linear models in practice”", GC + "expressing_design_formula.html"), L("“Interactions and contrasts” e “Collinearity”", GC + "interactions_and_contrasts.html")],
      msmb: [null, L("Cap. 8 — seções sobre matriz de design e modelos com mais de um fator", MSMB + "08-chap.html")],
    },
    "EST2:1": {
      statquest: ["Série “Logistic Regression” (Details Pt 1–3: coeficientes, máxima verossimilhança, R²)", "Vídeos sobre GLMs/Poisson e “Maximum Likelihood, clearly explained”"],
      msmb: [null, L("Cap. 8 — High-Throughput Count Data & GLMs: binomial negativa, dispersão e estimativa", MSMB + "08-chap.html")],
    },
    "EST2:2": {
      msmb: L("Cap. 6 — Testing: seções sobre múltiplos testes, FWER, FDR, Benjamini-Hochberg e histograma de p-valores", MSMB + "06-chap.html"),
      pos: "Coluna “Comparing samples—part II” (múltiplas comparações)",
    },
    "EST2:3": {
      msmb: L("Cap. 13 — seções sobre efeitos aleatórios/dependência entre amostras (medidas repetidas)", MSMB + "13-chap.html"),
    },
    "EST2:4": {
      msmb: [L("Cap. 7 — Multivariate Analysis (PCA, interpretação de loadings) + Cap. 5, seções sobre distâncias", MSMB + "07-chap.html"), L("Cap. 5 — Clustering (hierárquico, k-means, validação/estabilidade)", MSMB + "05-chap.html")],
      islr: [ISL + "Cap. 12, seção 12.2 (Principal Components Analysis)", ISL + "Cap. 12, seção 12.4 (Clustering Methods: K-means e hierárquico)"],
    },
    "EST2:5": {
      rethinking: ["Aulas 1–2 (2023): The Golem of Prague; The Garden of Forking Data (prior, verossimilhança, posterior)", "Aulas sobre modelos multinível (Multilevel models / partial pooling — shrinkage)"],
    },
    "EST2:6": {
      gloor2017: "Artigo inteiro: por que dados de microbioma são composicionais e a transformação CLR",
      openintro: "OpenIntro não cobre sobrevivência — revise o Cap. 9 (9.5 Introduction to logistic regression) como base de modelagem",
      islr: ISL + "Cap. 11 — Survival Analysis and Censored Data (11.1–11.5: Kaplan-Meier, log-rank, Cox)",
    },
    // =================== ENG1 ===================
    "ENG1:0": {
      taschuk2017: "Regras 1–5 (controle de versão, README, uso/--help, versões, dependências)",
      wilson2017: "Seção “Software” (funções, nomes, decompor programas, testes simples)",
    },
    "ENG1:1": {
      pytest: L("Get Started + How-to: “How to use fixtures” e “How to parametrize fixtures and test functions”", "https://docs.pytest.org/en/stable/getting-started.html"),
      testthat: L("Artigo “testthat” (Get started) e “Test fixtures”", "https://testthat.r-lib.org/articles/test-fixtures.html"),
    },
    "ENG1:2": {
      lee2018: "Artigo inteiro: as 10 regras (README, exemplos, documentação de API)",
      writethedocs: L("Guide: “A beginner’s guide to writing documentation”", "https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/"),
      mkdocs: L("“Getting Started” e “Writing your docs”", "https://www.mkdocs.org/getting-started/"),
    },
    "ENG1:3": {
      packaging: L("Tutorial “Packaging Python Projects” + guia “Writing your pyproject.toml” (entry points / scripts)", "https://packaging.python.org/en/latest/tutorials/packaging-projects/"),
      semver: L("Especificação 2.0.0 (seções “Summary” e FAQ)", "https://semver.org/"),
    },
    "ENG1:4": {
      ruff: L("“Tutorial” (configuração, regras, formatter)", "https://docs.astral.sh/ruff/tutorial/"),
      precommit: L("Seções “Quick start” e “Adding pre-commit plugins to your project”", "https://pre-commit.com/#quick-start"),
    },
    "ENG1:5": {
      pyda: L("Apêndice A — Advanced NumPy (performance, ufuncs) + Apêndice B — More on the IPython System (%timeit, %prun)", PYDA + "ipython"),
    },
    // =================== VAR ===================
    "VAR:0": {
      gatk: ["Artigo “HaplotypeCaller” (como funciona: regiões ativas, reassembly, PairHMM, genotipagem)", "Artigo “Hard-filtering germline short variants” (QD, FS, MQ, SOR, ReadPosRankSum)"],
      mckenna2010: ["Seções Introdução e “The GATK architecture” (MapReduce, walkers)", null],
    },
    "VAR:1": {
      gatk: "Best Practices Workflows → “Germline short variant discovery (SNPs + Indels)” (BQSR, GVCF, joint genotyping, VQSR)",
      galaxy: L("Tutorial “Calling variants in diploid systems”", GTN + "variant-analysis/tutorials/dip/tutorial.html"),
    },
    "VAR:2": {
      deepvariant: L("README + docs “DeepVariant usage guide” e “Case study” WGS", "https://github.com/google/deepvariant/blob/r1.6/docs/deepvariant-quick-start.md"),
      giab: L("Página do programa: amostras de referência (HG001–HG007) e benchmark regions", "https://www.nist.gov/programs-projects/genome-bottle"),
    },
    "VAR:3": {
      vep: L("Documentação “Calculated variant consequences” e opções --mane/--canonical", "https://www.ensembl.org/info/genome/variation/prediction/predicted_data.html"),
      clinvar: L("Documentação “Review status” e “Clinical significance” (estrelas, conflitos)", "https://www.ncbi.nlm.nih.gov/clinvar/docs/review_status/"),
      gnomad: "Help: frequências por população, filtragem de alelos comuns (BA1/BS1) e pLI/LOEUF",
    },
    "VAR:4": {
      richards2015: ["Seções de critérios: Tabelas 3–4 (evidências patogênicas e benignas) e Tabela 5 (regras de combinação)", "Seções “Reporting” e “Special considerations” (laudo, VUS, achados secundários)"],
    },
    "VAR:5": {
      gatk: "Best Practices → “Somatic short variant discovery (SNVs + Indels)” (Mutect2, PoN, FilterMutectCalls)",
    },
    "VAR:6": {
      minimap2: L("README: preset para long reads (map-ont/map-hifi) e opção --MD/-Y para SV calling", "https://github.com/lh3/minimap2"),
      goodwin2016: "Releitura: seção sobre long reads e aplicações em variantes estruturais",
    },
    // =================== RNA ===================
    "RNA:0": {
      conesa2016: "Seções “Experimental design” e “Analysis overview” (Fig. 1)",
      stark2019: "Seções sobre escolha de protocolo (poly-A × ribodepleção, strandedness, profundidade)",
    },
    "RNA:1": {
      patro2017: "Resumo, Introdução e seção de métodos sobre selective alignment/modelo de viés (GC, posição)",
      hbc: L("Intro to bulk RNA-seq: “Quantifying expression using alignment-free methods (Salmon)” + “Workflow (raw data to counts)”", HBCR + "09_quasi_alignment_salmon_sbatch.html"),
    },
    "RNA:2": {
      love2014: ["Seções de métodos: size factors e estimativa de dispersão (shrinkage)", "Seções sobre shrinkage de LFC, filtragem independente e outliers (Cook)"],
      deseq2: [L("Vinheta: “Quick start”, “Input data” e “Differential expression analysis”", "https://bioconductor.org/packages/release/bioc/vignettes/DESeq2/inst/doc/DESeq2.html#differential-expression-analysis"), L("Vinheta: “Log fold change shrinkage” e “Independent filtering of results”", "https://bioconductor.org/packages/release/bioc/vignettes/DESeq2/inst/doc/DESeq2.html#log-fold-change-shrinkage-for-visualization-and-ranking")],
      rnaseqGene: [null, "Workflow: seções “Differential expression analysis” e “Plotting results”"],
      hbc: [L("Intro to DGE: “RNA-seq counts distribution” e “Count normalization”", HBC + "02_DGE_count_normalization.html"), L("Intro to DGE: “Hypothesis testing and multiple test correction” e “Wald test results”", HBC + "05b_wald_test_results.html")],
    },
    "RNA:3": {
      leek2010: "Releitura com foco nas estratégias de correção e no risco de confundimento batch × grupo",
      rnaseqGene: "Workflow: seção “Removing hidden batch effects” (sva/RUVSeq)",
    },
    "RNA:4": {
      gsea: "Documentação: “GSEA User Guide” — seção sobre o algoritmo (enrichment score, permutação)",
      clusterprof: L("Caps. “Over-Representation Analysis” e “Gene Set Enrichment Analysis”", "https://yulab-smu.top/biomedical-knowledge-mining-book/enrichment-overview.html"),
      reactome: L("User Guide: “Analysis Tools” (over-representation e expressão)", "https://reactome.org/userguide/analysis"),
    },
    "RNA:5": {
      stark2019: "Seções sobre isoformas, splicing e long-read RNA-seq",
    },
    // =================== WF ===================
    "WF:0": {
      bioconda: L("“Usage” + “FAQs” (prioridade de canais, mamba, por que não misturar canais)", "https://bioconda.github.io/faqs.html"),
    },
    "WF:1": {
      docker: L("Get Started: “What is a container?”, “What is an image?”, “Persisting container data” e “Building images” (camadas)", "https://docs.docker.com/get-started/"),
      apptainer: L("User Guide: “Quick Start” (build a partir de imagem Docker, bind de diretórios)", "https://apptainer.org/docs/user/latest/quick_start.html"),
      biocontainers: L("Documentação: “Getting Started” (registro quay.io/biocontainers, tags)", "https://biocontainers-edu.readthedocs.io/en/latest/"),
    },
    "WF:2": {
      snakemake: [L("Tutorial: “Basics: An example workflow” (passos 1–7)", SMK + "tutorial/basics.html"), L("Tutorial: “Advanced: Decorating the example workflow” (configs, threads, conda, logs) + docs de profiles", SMK + "tutorial/advanced.html")],
      molder2021: ["Seções sobre legibilidade e modularidade da linguagem (rules, wildcards, DAG)", "Seções sobre portabilidade e escalabilidade (software deployment, cluster/cloud)"],
    },
    "WF:3": {
      nfTraining: [L("Hello Nextflow — Parts 1–3: Hello World, Hello Channels, Hello Workflow", NFT + "hello_nextflow/02_hello_channels/"), L("Hello Nextflow — Parts 4–6: Hello Modules, Hello Containers, Hello Config", NFT + "hello_nextflow/04_hello_modules/")],
      nfDocs: [L("Reference: “Channels” e “Operators” (map, collect, join, groupTuple)", "https://docs.seqera.io/nextflow/workflow"), L("“Modules”, “Workflows” (subworkflows) e “Configuration” (profiles)", "https://docs.seqera.io/nextflow/modules/")],
      ditommaso2017: ["Artigo inteiro (curto): modelo dataflow e reprodutibilidade", null],
    },
    "WF:4": {
      nfcore: L("Docs: “Running pipelines” (samplesheets, -profile, params) e páginas de um pipeline (ex.: nf-core/rnaseq — Usage e Output)", "https://nf-co.re/docs/usage/getting_started/introduction"),
      ewels2020: "Artigo inteiro (curto): diretrizes do nf-core e template",
      nftest: L("Docs: “Getting started” e “Writing process tests”", "https://www.nf-test.com/docs/getting-started/"),
    },
    "WF:5": {
      wdl: L("“Getting started” + especificação: estrutura task/workflow", "https://docs.openwdl.org/"),
    },
    // =================== META ===================
    "META:0": {
      quince2017: ["Seções “Study design and sampling” e “Sequencing” (marcador × shotgun, resolução)", "Seções sobre controles, contaminação e metadados"],
    },
    "META:1": {
      callahan2016: "Artigo inteiro (curto): modelo de erro, ASVs e comparação com OTUs",
      dada2: L("Tutorial oficial do início até “Assign taxonomy” (filterAndTrim, learnErrors, dada, removeBimeraDenovo)", "https://benjjneb.github.io/dada2/tutorial.html"),
      bolyen2019: "Resumo e visão geral da plataforma (plugins, artefatos, proveniência)",
      qiime2: L("Tutorial “Moving Pictures” (até a etapa de taxonomia)", "https://docs.qiime2.org/2024.10/tutorials/moving-pictures/"),
    },
    "META:2": {
      phyloseq: L("Tutoriais “Alpha diversity graphics” e “Ordination”", "https://joey711.github.io/phyloseq/plot_richness-examples.html"),
      msmb: L("Cap. 9 — Multivariate methods for heterogeneous data (ordenação, distâncias) + exemplo de microbioma", MSMB + "09-chap.html"),
    },
    "META:3": {
      gloor2017: ["Releitura com foco em CLR, ALDEx2 e análise de proporcionalidade", "Seção de discussão: por que métodos diferem e boas práticas"],
    },
    "META:4": {
      wood2019: "Resumo, Introdução e Resultados: minimizers, banco compacto, comparação com Kraken 1",
      quince2017: "Seções sobre perfil taxonômico e funcional (MetaPhlAn, HUMAnN) de shotgun",
    },
    "META:5": {
      anvio: L("Tutorial “The anvi’o metagenomic workflow” (co-assembly, binning, refinamento)", "https://merenlab.org/2016/06/22/anvio-tutorial-v2/"),
      gtdb: L("Página “About” + “GTDB-Tk” (classificação de MAGs)", "https://gtdb.ecogenomic.org/about"),
    },
    "META:6": {
      card: L("Página “About” + uso do RGI (Resistance Gene Identifier)", "https://card.mcmaster.ca/about"),
      mgnify: L("Documentação: “About” e pipelines de análise (amplicon, assembly, raw reads)", "https://docs.mgnify.org/"),
    },
    // =================== ML1 ===================
    "ML1:0": {
      islr: [ISL + "Cap. 2 — Statistical Learning, seção 2.2 (Assessing Model Accuracy: bias-variance trade-off)", ISL + "Cap. 5 — Resampling Methods, seção 5.1 (Cross-Validation)"],
      statquest: ["Vídeo “Machine Learning Fundamentals: Bias and Variance”", "Vídeo “Machine Learning Fundamentals: Cross Validation”"],
      mlcc: [L("Módulo “Overfitting” (generalização e regularização)", "https://developers.google.com/machine-learning/crash-course/overfitting"), L("Módulo “Datasets, generalization, and overfitting” — dividir dados em treino/validação/teste", "https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets")],
      greener2022: [null, "Artigo inteiro: boxes sobre divisão de dados e armadilhas"],
    },
    "ML1:1": {
      islr: ISL + "Cap. 6 — Linear Model Selection and Regularization, seção 6.2 (Shrinkage Methods: ridge e lasso)",
      sklearn: L("User Guide 1.1 — Linear Models: Ridge, Lasso e Elastic-Net", "https://scikit-learn.org/stable/modules/linear_model.html"),
    },
    "ML1:2": {
      islr: ISL + "Cap. 8 — Tree-Based Methods (8.1 árvores; 8.2 bagging, random forests e boosting)",
      statquest: "Vídeos: “Decision and Classification Trees”, “Random Forests Part 1” e “Gradient Boost Part 1”",
    },
    "ML1:3": {
      islr: ISL + "Cap. 9 — Support Vector Machines + Cap. 4, seção 4.4 (naive Bayes) e 2.2.3 (KNN)",
    },
    "ML1:4": {
      islr: ISL + "Cap. 12 — Unsupervised Learning (releitura de clustering com foco em escolher k e validar)",
      msmb: L("Cap. 5 — Clustering (seções sobre validação) + Cap. 7, seções sobre métodos não lineares", MSMB + "05-chap.html"),
    },
    "ML1:5": {
      whalen2022: ["Artigo inteiro: as 5 armadilhas (vazamento, dependência entre amostras, confundimento, desbalanceamento, distribuição)", null],
      chicco2017: [null, "Dicas sobre métricas (MCC, AUPRC) e desbalanceamento"],
      sklearn: [L("User Guide 3.1 — Cross-validation (incl. GroupKFold e nested CV) e “Common pitfalls”", "https://scikit-learn.org/stable/common_pitfalls.html"), L("User Guide 3.4 — Metrics and scoring + 1.16 — Probability calibration", "https://scikit-learn.org/stable/modules/model_evaluation.html")],
    },
    "ML1:6": {
      lundberg2017: "Resumo, Introdução e seções 2–4 (additive feature attribution, valores de Shapley)",
      sklearn: L("User Guide 4.2 — Permutation feature importance (e o aviso sobre features correlacionadas)", "https://scikit-learn.org/stable/modules/permutation_importance.html"),
    },
    "ML1:7": {
      mlflow: L("“Getting Started” — MLflow Tracking (runs, params, metrics, artifacts)", "https://mlflow.org/docs/latest/"),
      dvc: L("“Get Started” — Data Versioning e Data Pipelines", "https://doc.dvc.org/start"),
    },
    // =================== COM ===================
    "COM:0": {
      mensh2017: "Artigo inteiro: as 10 regras (contexto-conteúdo-conclusão, um ponto central)",
      zhang2014: "Artigo inteiro: regras sobre estrutura e escrita de cada seção",
    },
    "COM:1": {
      wilke: L("Caps. 19 (Common pitfalls of color use), 20 (Redundant coding) e 21 (Multi-panel figures)", WILKE + "color-pitfalls.html"),
      rougier2014: "Artigo inteiro: as 10 regras para figuras",
    },
    "COM:2": {
      bourne2007: "Artigo inteiro: as 10 regras para apresentações orais",
    },
    "COM:3": {
      knapp2015: "Artigo inteiro: regras sobre expectativas, comunicação e créditos",
    },
    "COM:4": {
      engPractices: L("“The Standard of Code Review” e “How to write code review comments”", "https://google.github.io/eng-practices/review/reviewer/comments.html"),
      designDocs: "Seções “The anatomy of a design doc” e “Design doc lifecycle”",
    },
    // =================== SC ===================
    "SC:0": {
      luecken2019: "Seções introdutórias e “Pre-processing and visualization” (Fig. 1 — fluxo geral)",
      scbp: L("Introduction: “Single-cell RNA sequencing” e “Raw data processing”", "https://www.sc-best-practices.org/introduction/scrna-seq"),
    },
    "SC:1": {
      scbp: "Preprocessing and visualization: “Quality control” (incl. ambient RNA e doublet detection)",
      osca: L("Basics: capítulos “Quality Control” e (Advanced) “Doublet detection”", "https://bioconductor.org/books/release/OSCA.basic/quality-control.html"),
    },
    "SC:2": {
      scanpy: L("Tutorial “Preprocessing and clustering” (pbmc3k)", "https://scanpy.readthedocs.io/en/stable/tutorials/basics/clustering.html"),
      wolf2018: "Resumo e seção de funcionalidades (vizinhança, clustering, PAGA)",
      seurat: L("Vinheta “Seurat - Guided Clustering Tutorial” (pbmc3k)", "https://satijalab.org/seurat/articles/pbmc3k_tutorial"),
    },
    "SC:3": {
      scbp: "Cellular structure: “Annotation” (manual por marcadores × automática)",
      cellxgene: L("Página “Docs” — Census e anotações de referência", "https://cellxgene.cziscience.com/docs/01__CellxGene"),
    },
    "SC:4": {
      scvi: L("Tutorial “Atlas-level integration” / “Integration and reference mapping” (scVI)", "https://docs.scvi-tools.org/en/stable/tutorials/index.html"),
      scbp: "Cellular structure: “Integration” (métricas scIB e risco de sobrecorreção)",
    },
    "SC:5": {
      scbp: "Capítulos “Pseudotemporal ordering”, “RNA velocity” e “Cell-cell communication”",
    },
    "SC:6": {
      scbp: "Conditions: “Differential gene expression” (pseudobulk) + Spatial omics: introdução",
      squidpy: L("Tutorial de análise Visium (vizinhança, autocorrelação espacial — Moran’s I)", "https://squidpy.readthedocs.io/en/stable/notebooks/tutorials/index.html"),
    },
    // =================== OMX ===================
    "OMX:0": {
      aebersold2016: ["Seções sobre a tecnologia de MS (ionização, espectros, identificação de peptídeos)", "Seções sobre quantificação (label-free, isotópica) e DIA"],
      pride: [L("Página “About PRIDE Archive” + explorar 1 dataset (arquivos RAW, mzIdentML)", "https://www.ebi.ac.uk/pride/markdownpage/aboutpride"), null],
      ebiTrain: [null, "Curso on-demand de proteômica (ex.: “Proteomics: an introduction” / PRIDE)"],
    },
    "OMX:1": {
      openms: L("Documentação: “User Tutorial” (fluxo de identificação/quantificação)", "https://openms.readthedocs.io/en/latest/"),
      msmb: L("Cap. 8 — releitura do modelo linear/limma e Cap. 4 sobre misturas (valores ausentes MNAR)", MSMB + "08-chap.html"),
    },
    "OMX:2": {
      metaboanalyst: L("Tutoriais/FAQ: “Statistical Analysis [one factor]” (normalização, escalonamento)", "https://www.metaboanalyst.ca/docs/Tutorials.xhtml"),
    },
    "OMX:3": {
      encode: ["Página de padrões: “ChIP-seq data standards” (FRiP, IDR, controles)", "Página de padrões: “WGBS” / dados de metilação"],
      nfcore: [L("Pipeline nf-core/chipseq — Output docs (MACS2, FRiP)", "https://nf-co.re/chipseq"), L("Pipeline nf-core/methylseq — Output docs", "https://nf-co.re/methylseq")],
      galaxy: [L("Tutorial “ATAC-Seq data analysis”", GTN + "epigenetics/tutorials/atac-seq/tutorial.html"), L("Tutorial “DNA Methylation data analysis”", GTN + "epigenetics/tutorials/methylation-seq/tutorial.html")],
    },
    "OMX:4": {
      jumper2021: "Resumo, Introdução e seção sobre métricas de confiança (pLDDT)",
      rcsb: L("PDB-101: “Guide to Understanding PDB Data” (resolução, R-free)", "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/introduction"),
      afdb: L("FAQ: interpretação de pLDDT e PAE", "https://alphafold.ebi.ac.uk/faq"),
    },
    // =================== HPC ===================
    "HPC:0": {
      hpcCarp: L("Lição “Introduction to High-Performance Computing”: Scheduler Fundamentals e Using resources effectively", "https://carpentries-incubator.github.io/hpc-intro/"),
      slurm: L("Quick Start User Guide (sbatch, squeue, partições, job arrays)", "https://slurm.schedmd.com/quickstart.html"),
    },
    "HPC:1": {
      awsDocs: [L("“What is Amazon EC2?” e IAM: “What is IAM?”", "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html"), L("Amazon S3: “What is Amazon S3?” e “Storage classes”", "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html")],
      gcpSkills: ["Curso/lab introdutório “Google Cloud Fundamentals: Core Infrastructure” (módulos de recursos e IAM)", "Lab “Cloud Storage” (buckets, classes, custos)"],
    },
    "HPC:2": {
      nfDocs: L("“Executors” (AWS Batch, Google Batch) e “Amazon S3/Google Storage” (work dir em bucket)", "https://docs.seqera.io/nextflow/executor"),
    },
    "HPC:3": {
      terra: "Documentação “Terra architecture and where your files live” + “Running workflows”",
    },
    "HPC:4": {
      dask: L("Docs: “Dask DataFrame” (out-of-core, partições)", "https://docs.dask.org/en/stable/dataframe.html"),
      polars: L("User guide: “Lazy API” e leitura de Parquet", "https://docs.pola.rs/user-guide/lazy/"),
      duckdb: L("Data Import → Parquet Files (consultas diretas em arquivos/coleções Parquet)", "https://duckdb.org/docs/stable/data/parquet/overview"),
    },
    "HPC:5": {
      terraform: L("Tutorial “Get Started” (AWS ou GCP): init, plan, apply, state", "https://developer.hashicorp.com/terraform/tutorials/aws-get-started"),
    },
    // =================== MULTI ===================
    "MULTI:0": {
      hasin2017: ["Seções sobre abordagens: genome-first, phenotype-first, environment-first", "Seções sobre desafios de integração e limitações"],
    },
    "MULTI:1": {
      argelaguet2018: "Resumo, Fig. 1 (modelo) e seções de resultados sobre interpretação dos fatores",
      mofa: L("Tutorial “Getting started” (R) / CLL vignette", "https://biofam.github.io/MOFA2/tutorials.html"),
      mixomics: L("Página “DIABLO” (N-integration) e Case Study", "https://mixomics.org/mixdiablo/"),
    },
    "MULTI:2": {
      string: [L("Help: “Getting started” e significado dos escores de interação", "https://string-db.org/cgi/help"), null],
      msmb: [L("Cap. 10 — Networks and Trees (grafos, centralidade)", MSMB + "10-chap.html"), L("Cap. 10 — seções sobre redes inferidas e árvores", MSMB + "10-chap.html")],
    },
    "MULTI:3": {
      gtex: [L("Página “About” + documentação de eQTLs (cis-eQTL, NES)", "https://gtexportal.org/home/aboutGTEx"), null],
      whatif: [null, "Parte II, cap. 16 — Instrumental variable estimation (base da randomização mendeliana)"],
    },
    "MULTI:4": {
      reactome: L("User Guide: “Pathway Browser” e “Analysis Tools”", "https://reactome.org/userguide"),
    },
    // =================== DL ===================
    "DL:0": {
      d2l: [L("Cap. 5 — Multilayer Perceptrons (5.1–5.3: MLP, implementação, forward/backward)", D2L + "chapter_multilayer-perceptrons/index.html"), L("Cap. 12 — Optimization Algorithms (SGD, momentum, Adam) + 5.6 Dropout e 8.5 Batch Normalization", D2L + "chapter_optimization/index.html")],
      karpathy: ["Aula 1 — “The spelled-out intro to neural networks and backpropagation: building micrograd”", null],
      b3b1b: ["Neural Networks, ep. 1, 3 e 4: But what is a neural network?; Backpropagation, intuitively; Backpropagation calculus", null],
      dlbook: [null, "Caps. 7 (Regularization) e 8 (Optimization for Training Deep Models)"],
    },
    "DL:1": {
      pytorch: L("“Learn the Basics” (Tensors, Datasets & DataLoaders, Autograd, Optimization Loop)", "https://docs.pytorch.org/tutorials/beginner/basics/intro.html"),
      fastai: L("Lição 1 (Getting started) e Lição 3 (Neural net foundations)", "https://course.fast.ai/Lessons/lesson1.html"),
    },
    "DL:2": {
      eraslan2019: ["Seções sobre CNNs para sequência (one-hot, filtros como motivos)", "Seções sobre interpretação de modelos (saliência, mutagênese in silico)"],
      kipoi: [null, L("Docs “Getting started” + explorar 1 modelo (ex.: DeepSEA/Basset)", "https://kipoi.org/docs/")],
    },
    "DL:3": {
      vaswani2017: ["Seções 3.1–3.5 (arquitetura, scaled dot-product attention, multi-head, positional encoding)", null],
      lin2023: [null, "Resumo, Introdução e seções sobre ESM-2 (escala) e ESMFold"],
      esm: [null, L("README: modelos ESM-2, extração de embeddings e exemplos", "https://github.com/facebookresearch/esm")],
      hfLearn: [L("LLM Course, cap. 1 — Transformer models (How do Transformers work?)", "https://huggingface.co/learn/llm-course/chapter1/1"), L("LLM Course, cap. 3 — Fine-tuning a pretrained model", "https://huggingface.co/learn/llm-course/chapter3/1")],
    },
    "DL:4": {
      pyg: L("“Introduction by Example” + “Creating Message Passing Networks”", "https://pytorch-geometric.readthedocs.io/en/latest/get_started/introduction.html"),
    },
    "DL:5": {
      d2l: [L("Cap. 20 — Generative Adversarial Networks (visão geral de modelos generativos) — para VAE use o scvi-tools ao lado", D2L + "chapter_generative-adversarial-networks/index.html"), "Seção sobre modelos de difusão (se disponível na versão atual) ou revisão de modelos generativos"],
      scvi: [L("User guide: “scVI” (modelo, VAE, espaço latente)", "https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html"), null],
    },
    // =================== LLM ===================
    "LLM:0": {
      karpathy: ["Aula “Let’s build GPT: from scratch, in code, spelled out” + “Let’s build the GPT Tokenizer”", null],
      hfLearn: [L("LLM Course, cap. 1 — Transformer models", "https://huggingface.co/learn/llm-course/chapter1/1"), L("LLM Course — capítulos de fine-tuning e alinhamento (cap. 3 e cap. 11/12, se disponível)", "https://huggingface.co/learn/llm-course/chapter3/1")],
      vaswani2017: ["Releitura: seção 3 (arquitetura) com foco no decoder", null],
    },
    "LLM:1": {
      claudeDocs: L("Prompt engineering: “Be clear and direct”, “Use examples (multishot)”, “Use XML tags” e saídas estruturadas", "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"),
    },
    "LLM:2": {
      lewis2020: ["Resumo, Introdução e seção 2 (Methods: retriever + generator)", "Seções de resultados e discussão sobre fundamentação (grounding)"],
      eutils: [null, "Releitura: ESearch/EFetch para montar um corpus do PubMed"],
      hfLearn: [L("LLM Course — seção sobre embeddings e busca semântica (FAISS)", "https://huggingface.co/learn/llm-course/chapter5/6"), null],
    },
    "LLM:3": {
      mcp: L("“Introduction” e “Core architecture” (servers, tools, resources)", "https://modelcontextprotocol.io/introduction"),
      claudeDocs: L("“Tool use with Claude” — overview e “How to implement tool use”", "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"),
    },
    "LLM:4": {
      lgpd: "Arts. 5º (definições: dado sensível, anonimização), 7º e 11 (bases legais; dados sensíveis) e 46–49 (segurança)",
    },
    "LLM:5": {
      hfLearn: L("PEFT/LoRA: documentação “PEFT” — conceito de LoRA", "https://huggingface.co/docs/peft/index"),
      esm: "README: fine-tuning/uso de embeddings para tarefas downstream",
    },
    // =================== ENG2 ===================
    "ENG2:0": {
      ghActions: L("“Understanding GitHub Actions”, “Using a matrix”, “Caching dependencies” e “Using secrets”", "https://docs.github.com/en/actions/get-started/understand-github-actions"),
    },
    "ENG2:1": {
      fastapi: [null, L("Tutorial — User Guide: “First Steps”, “Path Parameters”, “Request Body” e “Response Model”", "https://fastapi.tiangolo.com/tutorial/first-steps/")],
      duckdb: ["Docs: “Why DuckDB” + uso como motor analítico sobre um data lake de Parquet", null],
    },
    "ENG2:2": {
      wilkinson2016: "Artigo inteiro: os princípios F, A, I, R e o Box 2",
      ga4gh: L("Página “Toolkit” (htsget, DRS, Phenopackets, VRS)", "https://www.ga4gh.org/our-products/"),
      mixs: L("Página MIxS: checklists e pacotes ambientais", "https://www.gensc.org/pages/standards-intro.html"),
    },
    "ENG2:3": {
      lgpd: "Arts. 5º, 6º (princípios), 11 (dados sensíveis), 13 (pesquisa em saúde pública), 37–41 (registro e encarregado) e 46–49 (segurança)",
    },
    "ENG2:4": {
      roy2018: "Seções com as recomendações (17 diretrizes) sobre validação, versionamento e controle de qualidade",
    },
    "ENG2:5": {
      adr: L("Página inicial + “ADR templates” (Michael Nygard)", "https://adr.github.io/adr-templates/"),
      designDocs: "Releitura: seção “Alternatives considered” e “Cross-cutting concerns”",
    },
    // =================== TOOL ===================
    "TOOL:0": {
      weber2019: "Seções “Defining the purpose and scope” e “Selection of methods”",
      biostars: "Buscar perguntas recorrentes no tema escolhido (tags) para mapear lacunas reais",
    },
    "TOOL:1": {
      numba: [L("“A ~5 minute guide to Numba” + “Performance Tips”", "https://numba.readthedocs.io/en/stable/user/5minguide.html"), null],
      pyo3: [null, L("Guia: “Getting started” e “Python modules” (maturin)", "https://pyo3.rs/latest/getting-started")],
    },
    "TOOL:2": {
      weber2019: "Seções sobre datasets (simulados × reais, ground truth), métricas e interpretação neutra",
    },
    "TOOL:3": {
      packaging: L("Guia “Publishing package distribution releases using GitHub Actions” (PyPI)", "https://packaging.python.org/en/latest/guides/publishing-package-distribution-releases-using-github-actions-ci-cd-workflows/"),
      bioconda: L("Contributor guide: “Contributing a recipe” e “Guidelines”", "https://bioconda.github.io/contributor/index.html"),
      biocontainers: "Seção sobre como imagens são geradas automaticamente a partir das receitas Bioconda",
    },
    "TOOL:4": {
      joss: L("“Submitting a paper to JOSS” e “Review criteria”", "https://joss.readthedocs.io/en/latest/submitting.html"),
      zenodo: L("Guia de integração GitHub → Zenodo (DOI por release) + CITATION.cff", "https://help.zenodo.org/docs/github/"),
    },
    // =================== LEAD ===================
    "LEAD:0": {
      atlassianAgile: [L("“Project management” (escopo, marcos, riscos)", "https://www.atlassian.com/agile/project-management"), L("“Scrum” e “Kanban”", "https://www.atlassian.com/agile/kanban")],
    },
    "LEAD:1": {
      atlassianAgile: L("“Estimation” (story points) e “Prioritization frameworks”", "https://www.atlassian.com/agile/project-management/estimation"),
    },
    "LEAD:2": {
      adr: "Releitura: como registrar contexto, decisão e consequências",
      designDocs: "Releitura: “Alternatives considered” como ferramenta de decisão",
    },
    "LEAD:3": {
      staffeng: [L("Guides: “Staff archetypes” e “Operating at Staff”", "https://staffeng.com/guides/staff-archetypes/"), L("Guides: “Mentorship and sponsorship” e “Being visible”", "https://staffeng.com/guides/")],
      engPractices: [null, "Releitura: “How to handle pushback in code reviews” (feedback respeitoso)"],
    },
    "LEAD:4": {
      knapp2015: "Releitura com foco em alinhar expectativas e comunicar valor",
    },
    "LEAD:5": {
      lgpd: "Arts. 7º, 8º (consentimento), 11 e 13 (dados sensíveis e pesquisa)",
      cos: L("Página “Open Science” / “TOP Guidelines” (transparência e integridade)", "https://www.cos.io/initiatives/top-guidelines"),
    },
    // =================== CAR ===================
    "CAR:0": {
      iscb: "ISCB Competency Framework (seção Education do site): leia as competências de “Bioinformatics Scientist”",
    },
    "CAR:1": {
      ghDocs: L("“Managing your profile README” e “Pinning items to your profile”", "https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme"),
      quarto: L("Guide: “Creating a Website” (projects) e publicação no GitHub Pages", "https://quarto.org/docs/websites/"),
    },
    "CAR:2": {
      rosalind: L("Treino cronometrado: 3 problemas do Bioinformatics Stronghold por sessão", "https://rosalind.info/problems/list-view/"),
      biostars: "Ler 5 perguntas recentes de pipelines/design e responder mentalmente antes de ver a resposta",
    },
    "CAR:3": {
      staffeng: L("Guides: “Getting the title where you are” / “Interviewing for Staff-plus roles”", "https://staffeng.com/guides/"),
    },
    "CAR:4": {
      biostars: "Seguir 3 tags do seu interesse (ex.: rna-seq, nextflow, single-cell)",
      nfcore: L("Página “Join” (Slack, eventos, hackathons)", "https://nf-co.re/join"),
      iscb: L("Página de conferências (ISMB, X-Meeting/Brasil) e COSIs", "https://www.iscb.org/"),
    },

    // =================== GoGenetic / Conhecimento comercial ===================
    // Sessão 1 = fundamentos e mecanismos; sessão 2 = relação com o relatório, interpretação e limitações.
    "GGB:0": {
      knight2018: ["Seções sobre coleta, extração e escolha de marcador (16S × shotgun)", "Seções sobre composicionalidade e boas práticas de análise"],
      johnson2019: [null, "Resumo, Resultados (comparação de regiões V × gene completo) e Discussão: limite de resolução de espécie"],
      louca2018: [null, "Artigo inteiro: por que corrigir número de cópias do 16S continua impreciso"],
      nilsson2019: ["Seções sobre ITS como marcador e bancos de referência (UNITE)", null],
      schoch2012: ["Resumo e Discussão: por que o ITS virou o barcode oficial de fungos", null],
      vandeputte2017: [null, "Resumo e Resultados: perfil quantitativo (carga microbiana) × relativo"],
      salter2014: [null, "Resumo e Resultados: contaminação de reagentes em amostras de baixa biomassa"],
      callahan2016: ["Releitura: o que é uma ASV e por que é reprodutível entre estudos", null],
      bolyen2019: ["Releitura: fluxo QIIME 2 (importação → DADA2 → classificador)", null],
    },
    "GGB:1": {
      chao2014: ["Seções sobre números de Hill (q = 0, 1, 2) e relação com riqueza, Shannon e Simpson", null],
      willis2019: [null, "Artigo inteiro: limites de rarefação e estimar diversidade com incerteza"],
      mcmurdie2014: [null, "Resumo, Introdução e Discussão: por que rarefazer descarta informação"],
      msmb: [L("Cap. 4 — Mixture Models / Cap. 9 — exemplos de diversidade em microbioma (releitura)", MSMB + "09-chap.html"), null],
    },
    "GGB:2": {
      martiny2015: ["Artigo inteiro: conservação filogenética de traços (quais funções o táxon prediz bem)", null],
      faprotax: ["Resumo e Métodos: como o FAPROTAX atribui funções a partir de táxons", null],
      funguild: ["Resumo e Métodos: guildas e níveis de confiança do FUNGuild", null],
      picrust2: [null, "Resumo, Resultados (validação) e limitações (NSTI)"],
      sun2020: [null, "Artigo inteiro: acurácia da predição funcional varia por ambiente e categoria"],
    },
    "GGA:0": {
      lugtenberg2009: ["Seções sobre mecanismos de PGPR (biofertilização, fitoestimulação, biocontrole)", null],
      glick2012: ["Seções sobre mecanismos diretos e indiretos de promoção de crescimento", null],
      fira2018: ["Introdução e seção sobre Bacillus como agente de biocontrole", null],
      harman2004: ["Resumo e seções sobre modos de ação de Trichoderma", null],
      salter2014: [null, "Releitura com foco em contaminantes que podem aparecer em análises de produto"],
    },
    "GGA:1": {
      hoffman2014: ["Resumo e Introdução: nitrogenase, cofator FeMo e custo energético", null],
      dixon2004: ["Seções sobre genes nif e regulação por O2 e amônio", null],
      oldroyd2013: ["Seções sobre sinalização simbiótica (fatores Nod, via SYM)", null],
      hungria2010: [null, "Resumo, Resultados e Discussão: ganho de produtividade com Azospirillum no Brasil"],
      xie2014: [null, "Resumo e Resultados: cluster nif em Paenibacillus (o que a genômica permite afirmar)"],
      kuypers2018: ["Seção sobre fixação de N2 dentro do ciclo do nitrogênio", null],
    },
    "GGA:2": {
      richardson2011: ["Seções sobre mecanismos de solubilização de P (ácidos orgânicos, fosfatases)", null],
      rodriguez1999: ["Resumo e seções sobre bactérias solubilizadoras e genes envolvidos", null],
      bashan2013: [null, "Artigo inteiro: por que fosfato tricálcico não serve como critério universal"],
      kramer2020: ["Seções sobre sideróforos em comunidades e interação com hospedeiro", null],
      hider2010: ["Seções sobre classes químicas de sideróforos e captação de ferro", null],
      may2001: [null, "Resumo e Resultados: operon dhb e bacilibactina (ligação gene → função)"],
    },
    "GGA:3": {
      glick2012: ["Releitura: fitormônios (AIA, citocininas, giberelinas) e ACC desaminase", null],
      compant2010: ["Seções sobre colonização da rizosfera e endosfera", null],
      spaepen2007: ["Seções sobre vias de biossíntese de AIA e sinalização", null],
      glick2014: ["Artigo inteiro: ACC desaminase e redução de etileno", null],
      ryu2003: [null, "Resumo e Resultados: voláteis (2,3-butanodiol, acetoína) promovem crescimento"],
      idris2007: [null, "Resumo e Resultados: AIA dependente de triptofano em FZB42"],
    },
    "GGA:4": {
      ongena2008: ["Seções sobre lipopeptídeos (surfactina, iturina, fengicina): estrutura e modo de ação", null],
      stein2005: ["Seções sobre classes de antibióticos de B. subtilis", null],
      fan2018: ["Seções sobre metabólitos secundários e promoção de crescimento em FZB42", null],
      chen2007: [null, "Resumo e Resultados: clusters de metabólitos secundários no genoma de FZB42"],
      chen2009: [null, "Resumo e Resultados: difficidina e bacilisina contra Erwinia amylovora"],
      fira2018: ["Releitura: mecanismos de biocontrole por Bacillus", null],
      harman2004: [null, "Releitura: Trichoderma — indução de resistência"],
      pieterse2014: ["Seções sobre resistência sistêmica induzida (ISR) e vias de JA/ET", null],
      bravo2007: [null, "Seções sobre modo de ação de toxinas Cry e Cyt"],
      dunlap2016: [null, "Artigo inteiro (curto): taxonomia de B. velezensis × amyloliquefaciens"],
      gupta2020: [null, "Resumo e Discussão: reclassificação de clados de Bacillus (Priestia etc.)"],
    },
    "GGA:5": {
      ehling2019: ["Seções sobre o grupo B. cereus, toxinas (cereulida, enterotoxinas) e plasmídeos de virulência", "Seções sobre identificação e limites para distinguir espécies do grupo"],
      johnson2019: [null, "Releitura: por que 16S não separa espécies do grupo B. cereus"],
      salter2014: [null, "Releitura: contaminantes de reagentes × contaminação real do produto"],
    },
    "GGY:0": {
      sender2016: ["Artigo inteiro (curto): estimativa de células humanas × bacterianas", null],
      lynch2016: ["Seções sobre composição do microbioma saudável e fatores que o moldam", null],
      fan2021: ["Seções sobre microbiota e saúde metabólica", null],
      olesen2016: [null, "Artigo inteiro: críticas ao conceito de disbiose"],
      falony2016: [null, "Resumo e Resultados: covariáveis que explicam variação (Flemish Gut Flora Project)"],
      vandeputte2016: [null, "Resumo e Resultados: consistência das fezes como confundidor"],
      maier2018: [null, "Resumo e Resultados: impacto de medicamentos não antibióticos"],
      oren2021: ["Artigo (nomes válidos de filos: Bacillota, Bacteroidota…) — ler a tabela de nomes", null],
    },
    "GGY:1": {
      koh2016: ["Seções sobre produção e efeitos de AGCC (acetato, propionato, butirato)", null],
      louis2017: ["Seções sobre vias de formação de propionato e butirato e táxons produtores", null],
      litvak2018: ["Artigo inteiro: metabolismo do colonócito, hipóxia epitelial e ecologia microbiana", null],
      devkota2012: [null, "Resumo e Resultados: gordura → ácido taurocólico → Bilophila wadsworthia"],
      triantafyllou2014: [null, "Seções sobre metanogênicos, metano e motilidade"],
    },
    "GGY:2": {
      belkaid2014: ["Seções sobre microbiota e imunidade inata/adaptativa", null],
      peterson2014: ["Seções sobre células epiteliais e barreira", null],
      johansson2016: ["Seções sobre muco e mucinas", null],
      smith2013: ["Resumo e Resultados: AGCC regulam Treg do cólon", null],
      furusawa2013: ["Resumo e Resultados: butirato induz Treg", null],
      sokol2008: [null, "Resumo e Resultados: F. prausnitzii como comensal anti-inflamatório"],
      mazmanian2008: [null, "Resumo e Resultados: PSA de Bacteroides fragilis"],
      plovier2017: [null, "Resumo e Resultados: proteína Amuc_1100 de Akkermansia"],
      henke2019: [null, "Resumo e Resultados: glucoramnana inflamatória de R. gnavus"],
      shin2015: [null, "Artigo inteiro: Proteobacteria como assinatura de disbiose (e seus limites)"],
      kostic2013: [null, "Resumo e Resultados: Fusobacterium nucleatum e tumorigênese"],
    },
    "GGY:3": {
      ley2006: ["Artigo inteiro (curto): o achado original da razão F/B", null],
      walters2014: [null, "Resumo e Resultados: meta-análise não reproduz F/B como marcador"],
      magne2020: [null, "Artigo inteiro: revisão crítica da razão F/B"],
      arumugam2011: ["Resumo e Resultados: proposta dos enterotipos", null],
      costea2018: [null, "Artigo inteiro: enterotipos como gradientes, não categorias discretas"],
      magnusdottir2015: ["Resumo e Resultados: biossíntese de vitaminas B nos genomas intestinais", null],
      leblanc2013: ["Seções sobre vitaminas produzidas por bactérias e absorção", null],
      picrust2: [null, "Releitura: limitações para inferir vias de vitaminas"],
      sun2020: [null, "Releitura: acurácia em amostras intestinais"],
    },
    "GGY:4": {
      hill2014: ["Artigo inteiro: definição de probiótico (ISAPP)", null],
      zheng2020: ["Resumo + tabela dos novos gêneros (Lactobacillus → Lacticaseibacillus etc.)", null],
      duvallet2017: [null, "Resumo e Resultados: respostas compartilhadas × específicas de doença"],
      forslund2015: [null, "Resumo e Resultados: metformina como confundidor no diabetes tipo 2"],
      johnson2019: [null, "Releitura: limites do 16S para identificar patógenos em nível de espécie"],
    },
    "GGS:0": {
      fierer2017: ["Seções sobre o solo como habitat e fatores que estruturam a comunidade", null],
      fiererJackson2006: ["Resumo e Resultados: pH como principal preditor de diversidade bacteriana", null],
      philippot2013: ["Seções sobre rizosfera e recrutamento pela planta", null],
      berendsen2012: ["Seções sobre microbioma da rizosfera e saúde da planta", null],
      tedersoo2014: [null, "Resumo e Resultados: padrões globais de fungos do solo"],
      bardgett2014: [null, "Seções sobre biodiversidade e funcionamento do ecossistema"],
    },
    "GGS:1": {
      kuypers2018: ["Artigo inteiro: rede de ciclagem do nitrogênio e genes-chave (amo, nir, nos)", null],
      richardson2011: ["Releitura: ciclagem e disponibilidade de P", null],
      fierer2017: [null, "Releitura: o que ainda não se sabe sobre funções no solo"],
    },
    "GGS:2": {
      weller2002: ["Seções sobre supressividade geral × específica (take-all, DAPG)", null],
      schlatter2017: [null, "Artigo inteiro: novas evidências do microbioma em solos supressivos"],
      mendes2011: ["Resumo e Resultados: táxons associados à supressão de Rhizoctonia", null],
      berendsen2012: [null, "Releitura: seções sobre defesa da planta mediada por microrganismos"],
    },
    "GGS:3": {
      parniske2008: ["Seções sobre a simbiose micorrízica arbuscular e sinalização", null],
      jiang2017: ["Resumo e Resultados: transferência de lipídios da planta ao fungo", null],
      karst2023: [null, "Artigo inteiro: viés de citação sobre redes micorrízicas comuns"],
      tedersoo2014: [null, "Releitura: grupos funcionais de fungos"],
      nilsson2019: [null, "Releitura: por que ITS subestima fungos micorrízicos arbusculares"],
    },
    "GGS:4": {
      wagg2014: ["Resumo e Resultados: biodiversidade do solo e multifuncionalidade (experimento)", null],
      delgado2016: ["Resumo e Resultados: diversidade microbiana e multifuncionalidade (escala global)", null],
      bardgett2014: [null, "Releitura: limitações e lacunas"],
      schlatter2017: [null, "Releitura: saúde do solo e indicadores microbianos"],
    },
    "GGG:0": {
      spades2012: ["Resumo e seção do algoritmo (grafo de De Bruijn multisized)", null],
      checkm: ["Resumo e Métodos: genes marcadores de cópia única (completude/contaminação)", null],
      richter2009: ["Resumo e Resultados: ANI ~95–96% como limite de espécie", null],
      jain2018: [null, "Resumo e Resultados: descontinuidade de ANI em 90 mil genomas"],
      skani: [null, "Resumo + README/uso: ANI rápido com assemblies incompletos"],
      gtdbtk: [null, "Resumo e Métodos: classificação contra o GTDB"],
      dunlap2016: [null, "Releitura: delimitação de B. velezensis"],
      gupta2020: [null, "Releitura: novos gêneros derivados de Bacillus"],
    },
    "GGG:1": {
      prokka: ["Artigo inteiro (curto): pipeline de anotação", null],
      metabolic: [null, "Resumo e Resultados: perfil de traços funcionais e ciclos biogeoquímicos"],
      diamond: [null, "Resumo e Métodos: alinhamento de proteínas rápido (uso na anotação)"],
    },
    "GGG:2": {
      antismash7: [null, "Resumo e seções sobre novidades da versão 7 e interpretação dos resultados"],
      antismashDocs: [null, L("Docs: “Understanding the output” (regiões, contig edge, similaridade com MIBiG)", "https://docs.antismash.secondarymetabolites.org/understanding_output/")],
      mibig: [null, "Resumo: padrão MIBiG e uso como referência"],
      fischbach2006: ["Seções sobre linhas de montagem de NRPS e PKS (módulos, domínios A/T/C)", null],
      sussmuth2017: ["Seções sobre princípios da síntese não ribossomal", null],
      arnison2013: ["Seções iniciais: definição e classes de RiPPs", null],
      stein2005: ["Releitura: antibióticos de B. subtilis por classe biossintética", null],
      ongena2008: ["Releitura: lipopeptídeos e seus clusters (srf, itu, fen)", null],
      chen2009: [null, "Releitura: clusters de difficidina e bacilisina"],
      may2001: [null, "Releitura: dhb e bacilibactina como exemplo de sideróforo NRPS"],
      fan2018: [null, "Releitura: repertório de BGCs de FZB42"],
      chen2007: [null, "Releitura: anotação dos clusters no genoma completo"],
    },
    "GGG:3": {
      vfdb: ["Resumo e seções sobre organização do banco de fatores de virulência", null],
      ehling2019: ["Releitura: genes de toxinas e plasmídeos (cesB, capBCA) e por que capC isolado não indica antraz", null],
      bravo2007: [null, "Releitura: toxinas Cry/Cyt como fator de segurança/benefício"],
      card: [null, L("Página “About” + ontologia ARO e critérios de corte do RGI (Perfect/Strict/Loose)", "https://card.mcmaster.ca/about")],
    },
  };
})();
