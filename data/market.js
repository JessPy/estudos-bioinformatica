// Pesquisa de mercado — levantamento feito em 30/10/2026 por busca web.
// Os requisitos foram extraídos dos resumos de busca de cada anúncio; confira o anúncio original
// (vagas expiram e podem ter mudado). "mods" liga cada requisito aos módulos da trilha.
window.MARKET = {
  date: "2026-10-30",
  note: "Amostra qualitativa de anúncios encontrados em buscas web (EUA, Europa, Índia e Brasil). Não é um censo do mercado: use para orientar prioridades, não como estatística.",
  jobs: [
    { title: "Senior Scientist – NGS Bioinformatics (Data Standardization & Platform Integration)", org: "Amgen", when: "jul/2026", url: "https://amgen.wd1.myworkdayjobs.com/en-US/Careers/job/Senior-Scientist---NGS-Bioinformatics--Data-Standardization---Platform-Integration-_R-247977", reqs: ["Nextflow ou Snakemake", "Padronização de dados NGS", "Integração de plataformas"] },
    { title: "Bioinformatics Senior Scientist", org: "Flomics", when: "jul/2026", url: "https://www.flomics.com/2026/07/30/bioinformatics-senior-scientist", reqs: ["PhD + 3 anos de pós-doc/indústria", "Desenvolvimento hands-on em Nextflow"] },
    { title: "Bioinformatics Scientist", org: "Amgen (Hyderabad)", when: "ago/2026", url: "https://careers.amgen.com/en/job/hyderabad/bioinformatics-scientist/87/96042363472", reqs: ["~8+ anos com pipelines NGS", "Variant calling e variantes estruturais", "Nextflow/Snakemake", "AWS e HPC", "GPU (diferencial)"] },
    { title: "Senior Scientist, Bioinformatics / Computational Biology", org: "AstraZeneca (Cambridge, MA)", when: "out/2026", url: "https://zapply.jobs/jobs/a57cb531-e84a-4d0b-947c-d7439a7770ec/", reqs: ["Genômica e multi-omics", "GATK e bcftools", "Linux/Unix", "Schedulers HPC e/ou AWS/GCP"] },
    { title: "Sr Bioinformatics Scientist (MRD)", org: "Insight Global", when: "out/2026", url: "https://talents.vaia.com/companies/insight-global/sr-bioinformatics-scientist-mrd-106029970/", reqs: ["Pipelines production-grade com detecção de variantes", "AWS (EC2, S3, Lambda, Batch, Step Functions)", "Ambientes regulados CAP/CLIA"] },
    { title: "Senior Computational Biologist – Single-Cell Genomics & Machine Learning", org: "Recruits Lab (Nova York)", when: "2026", url: "https://jobs.physicstoday.org/job/42027105/senior-computational-biologist-single-cell-genomics-and-machine-learning/?TrackID=21", reqs: ["scRNA-seq", "Transcriptômica e multi-omics", "ML aplicado a dados biológicos"] },
    { title: "Senior Data Scientist / Computational Biologist", org: "Harvard Medical School", when: "2026", url: "https://careers.harvard.edu/job/senior-data-scientist-computational-biologist-in-boston-ma-united-states-jid-1499", reqs: ["Frameworks de ML: TensorFlow ou PyTorch"] },
    { title: "Senior/Principal Scientist, Computational Biology", org: "Cellular Intelligence", when: "2026", url: "https://www.compbiojobs.com/jobs/5638/senior-principal-scientist-computational-biology", reqs: ["Stack Python single-cell (scanpy, anndata)", "Capacidade de estender ferramentas"] },
    { title: "Senior / Principal Computational Biologist", org: "Flagship Pioneering", when: "2026", url: "https://zapply.jobs/jobs/8cf3b599-a972-41c3-92ab-9e90a4df8b63/", reqs: ["Single-cell e bulk transcriptômica", "Atlas single-cell em larga escala", "Geração de hipóteses a partir de dados"] },
    { title: "Senior / Principal ML Scientist, Foundation Models for Life Sciences", org: "Lila Sciences", when: "abr/2026", url: "https://jobs.generalcatalyst.com/companies/lila-sciences-2/jobs/76522831-senior-principal-ml-scientist-foundation-models-for-life-sciences", reqs: ["PyTorch/JAX/TensorFlow", "Treino em GPU e distribuído", "Domínio em genômica/biologia molecular/proteínas", "Colaboração com cientistas experimentais", "Publicações de alto impacto"] },
    { title: "Senior Applied Research Scientist", org: "NVIDIA", when: "2026", url: "https://jobs.anitab.org/companies/nvidia/jobs/84994148-senior-applied-research-scientist", reqs: ["PhD (ou equivalente)", "Deep learning para sequências", "Difusão e LLMs"] },
    { title: "SI/ML Computational Biologist (pós-doc)", org: "LLNL", when: "2026", url: "https://zapply.jobs/jobs/e2953488-b670-4f21-a637-f63c008a7c72/", reqs: ["Modelos self-supervised e fundacionais para ômicas"] },
    { title: "(Senior) Research Scientist – LLMs for Genomics", org: "Deep Genomics (encerrada, 2025)", when: "2025", url: "https://jobs.khoslaventures.com/companies/deep-genomics/jobs/59838047-senior-research-scientist-large-language-models-for-genomics", reqs: ["Aplicações com LLMs (3+ anos)", "Fluxos agênticos e integração de ferramentas", "Dados NGS", "Distilação de modelos"] },
    { title: "Senior Bioinformatics Scientist I, Team Lead", org: "Watchmaker Genomics", when: "2026", url: "https://jobs.eclipse.capital/companies/watchmaker-genomics/jobs/59736638-senior-bioinformatics-scientist-i-team-lead", reqs: ["Mentoria de colegas júnior", "Liderança de equipe"] },
    { title: "Senior Bioinformatics Scientist", org: "Texas A&M (TxGen)", when: "—", url: "https://www.txgen.tamu.edu/jobs/senior-bioinformatics-scientist-25", reqs: ["Recrutar e gerenciar analistas júnior", "Liderança técnica"] },
    { title: "Bioinformata sênior", org: "Salvador/BA (via Agrobase)", when: "2025–2026", url: "https://plataforma.agrobase.com.br/?p=1171681", reqs: ["HPC e agendamento de jobs", "Linux, shell, Git com CI/CD", "Documentação auditável de pipelines", "REDCap, OMOP-CDM", "Inglês intermediário"] },
  ],
  // Síntese: quantas vagas da amostra citam cada competência (contagem manual sobre a lista acima)
  skills: [
    { k: "Pipelines (Nextflow/Snakemake) e produção", n: 5, mods: ["WF", "ENG1", "ENG2"] },
    { k: "Nuvem (AWS/GCP) e HPC", n: 4, mods: ["HPC", "LNX"] },
    { k: "NGS e análise de variantes (GATK, bcftools, SV)", n: 4, mods: ["NGS", "VAR"] },
    { k: "Single-cell, transcriptômica e multi-omics", n: 4, mods: ["RNA", "SC", "MULTI"] },
    { k: "Machine learning / deep learning (PyTorch)", n: 5, mods: ["ML1", "DL"] },
    { k: "Modelos fundacionais, LLMs e agentes", n: 4, mods: ["DL", "LLM"] },
    { k: "Liderança, mentoria e colaboração", n: 3, mods: ["COM", "LEAD"] },
    { k: "Ambientes regulados e documentação auditável", n: 2, mods: ["ENG2", "VAR"] },
    { k: "Linux, Git e CI/CD", n: 2, mods: ["LNX", "GIT", "ENG2"] },
    { k: "Formação: PhD frequentemente pedido (ou experiência equivalente)", n: 3, mods: ["MCI", "COM", "TOOL"] },
  ],
  insights: [
    "Python é a linguagem mais consistente; R aparece como requisito ou alternativa — a trilha cobre ambos.",
    "Workflow managers (Nextflow/Snakemake) e nuvem/HPC são o 'piso' técnico das vagas sênior de genômica em escala.",
    "Vagas de Computational Biologist concentram-se em single-cell, multi-omics e ML; o stack scverse (scanpy/anndata) é citado.",
    "Nas vagas mais recentes cresce a demanda por modelos fundacionais, LLMs e fluxos agênticos aplicados a genômica e proteínas.",
    "Senioridade aparece como mentoria, liderança de equipe, colaboração com laboratório úmido e documentação auditável — não só como habilidade técnica.",
    "Vagas de diagnóstico pedem experiência em ambientes regulados (CAP/CLIA) e interpretação de variantes (ClinVar, gnomAD, ACMG/AMP).",
  ],
};
