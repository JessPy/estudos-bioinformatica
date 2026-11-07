# Trilha Conhecimento comercial (GGB, GGA, GGY, GGS, GGG) — resumos baseados no conteúdo aprofundado (data/gogenetic.js)

@@ GGB:0
> **O que esperar:** o caminho do DNA à tabela de abundâncias em metabarcoding (16S/ITS) e o que esse número pode ou não afirmar. Base: conteúdo aprofundado B1 (Gloor 2017, Louca 2018, Johnson 2019, Salter 2014).

### Conceitos
- **16S rRNA** (~1 500 pb): regiões conservadas (primers) + 9 hipervariáveis **V1–V9** (sinal taxonômico). Amplicon curto = menos resolução.
- **ITS** (ITS1–5.8S–ITS2): barcode oficial de fungos; comprimento variável → viés de PCR e sequenciamento.
- **Fluxo:** extração → PCR do marcador → Illumina → **DADA2 (ASVs)** → classificação (SILVA, GTDB, UNITE) → contagens → abundância relativa.
- **Composicional:** % é fração das leituras; se um táxon sobe, os outros “caem” sem mudar em número absoluto.
- **Nº de cópias do 16S** (1 a >10 por genoma) superestima táxons com muitas cópias; correção imprecisa.
- **Resolução:** gênero confiável; espécie muitas vezes não (grupo *B. subtilis/velezensis/amyloliquefaciens*, *Escherichia/Shigella*, grupo *B. cereus*).

### Como ler o resultado
- “15% de X” = 15% das sequências do marcador atribuídas a X **nesta amostra**.
- Nome de espécie por 16S = **hipótese**: checar confiança da classificação e confirmar (qPCR, *gyrB/rpoB*, genoma) quando importa.
- **Ausência** = não detectado naquela profundidade.

### Limites
- Pode: presença de DNA e composição relativa. **Não pode:** viabilidade, atividade, carga absoluta, cepa.
- Baixa biomassa → contaminantes de kit (*kitome*); controles negativos são essenciais.

@@ GGB:1
> **O que esperar:** índices de diversidade alfa, como calculá-los e por que mais diversidade não é sempre melhor. Base: conteúdo aprofundado B2 (Chao 2014, McMurdie & Holmes 2014, Willis 2019).

### Conceitos
- **Riqueza** S = nº de táxons. **Chao1** = S_obs + F1²/(2·F2) (F1 singletons, F2 doubletons).
- **Shannon** H' = −Σ pᵢ ln pᵢ (riqueza + equitabilidade). **Simpson** λ = Σ pᵢ² (dominância); **Gini-Simpson** = 1 − λ.
- **Pielou** J = H'/ln S (1 = todos iguais).
- **Números de Hill:** q=0 riqueza, q=1 exp(H'), q=2 1/λ.
- **Profundidade** muda a diversidade observada → rarefação (prática comum, debatida) ou modelagem.
- **DADA2 descarta singletons** → Chao1 ≈ riqueza observada (perde sentido).

### Código
```python
import numpy as np
c = np.array([50, 30, 10, 5, 3, 2]); p = c / c.sum()
S = (c > 0).sum(); H = -(p * np.log(p)).sum(); simpson = (p**2).sum()
gini_simpson = 1 - simpson; J = H / np.log(S)
from skbio.diversity import alpha_diversity
alpha_diversity("shannon", [c])      # atenção: scikit-bio usa log base 2 por padrão em algumas versões
```

### Como ler
- Índice normalizado pelo histórico = posição relativa às amostras já analisadas, não padrão ecológico absoluto.
- **Bioinsumo:** esperada **baixa** diversidade (dominância do agente) — alta sugere contaminação.
- **Solo/intestino:** diversidade associada à resiliência, mas não linear nem causal.

### Limites
- Comparar amostras com profundidades diferentes sem tratamento.
- Fezes: consistência e tempo de trânsito confundem a diversidade.

@@ GGB:2
> **O que esperar:** como se infere função a partir de táxons, o que é predição funcional e como graduar a evidência. Base: conteúdo aprofundado B3 (Martiny 2015, Sun 2020, Douglas 2020).

### Conceitos
- **Três caminhos:** (1) táxon → atributo da literatura (FAPROTAX, FUNGuild, bancos internos); (2) **predizer genes a partir do 16S** (PICRUSt2); (3) **medir** genes (shotgun, genoma) ou fenótipo (ensaio).
- **Conservação filogenética:** funções complexas (fotossíntese, metanogênese) são conservadas; funções simples/transferidas horizontalmente (resistência, alguns metabólitos) variam entre **cepas** da mesma espécie.
- **PICRUSt2:** estima genes pela proximidade a genomas de referência; acurácia cai em ambientes pouco representados (solo) e funções específicas.
- **Níveis de evidência:** genoma (potencial) → in vitro → casa de vegetação → **campo** com repetição e controle.

### Como ler
- Selo funcional = “há relato na literatura para esta espécie (às vezes só para uma cepa)”, não que a população expresse a função.
- Índice funcional predito = estimativa **indireta e relativa**; compare entre amostras do mesmo tipo.

### Limites
- Bancos com poucas referências preenchidas (ex.: fixadoras 355 espécies / 43 referências; micorrízicas 410 / 2).
- Atributo de uma cepa estendido à espécie; predição por 16S não vê plasmídeos nem variação entre cepas.

@@ GGA:0
> **O que esperar:** o que define a qualidade de um bioinsumo e o que o sequenciamento consegue (e não consegue) verificar. Base: conteúdo aprofundado A1.

### Conceitos
- **Bioinsumos:** inoculantes (*Bradyrhizobium*, *Azospirillum*), biofertilizantes, agentes de biocontrole (*Bacillus*, *Trichoderma*, *Beauveria*, *Metarhizium*).
- **4 eixos de qualidade:** **identidade** (espécie/cepa declarada), **concentração viável** (UFC/mL ou g), **pureza** (sem contaminantes/patógenos), **estabilidade** (vida de prateleira).
- Produção *on-farm*/assepsia deficiente → contaminantes de crescimento rápido (Enterobacteriaceae, outros *Bacillus*, leveduras).
- Estabilidade: **endósporos** (*Bacillus*, Spo0A) e **conídios** (*Trichoderma*) resistem mais que Gram-negativas vegetativas.
- Regulação: MAPA (Lei dos Bioinsumos 15.070/2024 — confira o texto) e lista negativa do IBAMA.

### Como ler
- Produto monoespecífico: esperada dominância quase total do gênero declarado; táxons minoritários podem ser contaminação real, de reagente ou *index hopping*.
- Compare com **controles negativos** da mesma corrida antes de concluir contaminação.

### Limites
- Sequenciamento **não mede UFC nem viabilidade**.
- 16S não separa espécies do grupo *B. subtilis* → genoma ou marcador específico.
- Dose e momento de aplicação dependem de ensaios agronômicos, não do perfil de DNA.

@@ GGA:1
> **O que esperar:** bioquímica e genética da fixação biológica de N₂, simbiose rizóbio-leguminosa e como avaliar “fixadores”. Base: conteúdo aprofundado A2 (Hoffman 2014, Dixon & Kahn 2004, Oldroyd 2013, Hungria 2010).

### Conceitos
- **Nitrogenase:** N₂ + 8H⁺ + 8e⁻ + 16 ATP → 2NH₃ + H₂ + 16 ADP + 16 Pi (muito cara).
- **Complexo:** proteína Fe (**NifH**) → proteína MoFe (**NifDK**, cofator FeMo-co); **NifENB** sintetizam o cofator; nitrogenases alternativas (V, Fe).
- **Inativada por O₂:** leghemoglobina no nódulo, proteção respiratória (*Azotobacter*), heterocistos, micronichos anóxicos.
- **Regulação:** NifA ativa genes *nif*; NifL e PII/GlnB integram O₂ e N — **amônio reprime** a fixação.
- **Simbiose:** flavonoides → fatores Nod (*nodABC*) → cordão de infecção → bacteroides. **Associativa:** *Azospirillum* em gramíneas (+ AIA).
- Brasil: soja + *Bradyrhizobium* substitui adubo N; *A. brasilense* Ab-V5/Ab-V6 em milho e trigo.

### Como ler
- DNA de *Bradyrhizobium* no solo ≠ nodulação eficiente (cepa, cultivar, N mineral, Mo, pH).
- Em genoma, exija **nifHDK + nifENB** antes de afirmar capacidade de fixação.

### Limites
- Muitos “fixadores” do banco são anaeróbios (*Clostridium*, *Geobacter*, *Desulfovibrio*) — não equivalem a inoculantes.
- *Bacillus* sensu stricto em geral **não** tem *nif*; *Paenibacillus polymyxa* é o caso documentado.

@@ GGA:2
> **O que esperar:** mecanismos de solubilização de P e K e de aquisição de ferro por sideróforos, e por que ensaios in vitro enganam. Base: conteúdo aprofundado A3 (Richardson & Simpson 2011, Rodríguez & Fraga 1999, Hider & Kong 2010, Kramer 2020, Bashan 2013).

### Conceitos
- **P no solo:** ligado a **Fe/Al** em solos ácidos (Latossolos), a Ca em alcalinos, e orgânico (**fitato**).
- **Solubilização inorgânica:** ácidos orgânicos (glucônico, 2-cetoglucônico, cítrico, oxálico…) acidificam e quelam. Gram-negativas: glicose desidrogenase dependente de **PQQ** (*gcd*, *pqqA–E*).
- **Mineralização orgânica:** fosfatases (PhoA, PhoD, PhoX), **fitases**, C-P liases; regulon PhoR/PhoB e transportador Pst.
- **K:** liberado de silicatos por ácidos orgânicos, EPS e quelação.
- **Sideróforos:** quelantes de Fe³⁺ de altíssima afinidade — catecolatos (enterobactina, **bacilibactina** — *dhb*), hidroxamatos, mistos (pioverdina — *pvd*); receptores TonB-dependentes.
- Ecologia: bens públicos (trapaceiros) e **arma de biocontrole** (privam patógenos de Fe).

### Como ler
- Ágar **Pikovskaya** (fosfato tricálcico) prevê mal o desempenho em solos com P ligado a Fe/Al → use FePO₄, AlPO₄, fitato.
- Ácidos orgânicos são consumidos e tamponados no solo: efeito de campo < in vitro.

### Limites
- Potencial genômico não diz quanto ácido é produzido.
- Gênero “solubilizador” por 16S não quantifica P disponível — só análise química do solo.

@@ GGA:3
> **O que esperar:** mecanismos de promoção de crescimento vegetal — fitormônios, ACC desaminase e voláteis — e como confirmá-los. Base: conteúdo aprofundado A4 (Glick 2012/2014, Spaepen 2007, Ryu 2003, Idris 2007).

### Conceitos
- **Diretos:** nutrientes, fitormônios, redução de etileno, voláteis. **Indiretos:** biocontrole, indução de resistência.
- **AIA (auxina):** rotas dependentes de Trp — **indol-3-piruvato** (*ipdC/ppdC*), indol-3-acetamida (*iaaM/iaaH*, típica de patógenos), indol-3-acetonitrila, triptamina. **Dose-dependente:** excesso inibe a raiz.
- **ACC desaminase** (*acdS*): degrada o precursor do etileno → menos inibição radicular sob estresse.
- Citocininas e giberelinas (nome vem de *Gibberella fujikuroi*).
- **Voláteis de *Bacillus*:** acetoína e 2,3-butanodiol (*alsS, alsD, bdhA*) promovem crescimento e ISR.
- SA, JA e ABA são sobretudo hormônios da planta; síntese bacteriana pouco caracterizada.

### Como ler
- “Via não identificada” no genoma = marcadores ausentes, não prova de que não produz.
- Os relatórios não avaliam voláteis — mecanismo relevante em *Bacillus*.

### Limites
- **Salkowski** detecta outros indóis; confirmar AIA com HPLC/LC-MS (meio ± Trp + bioensaio radicular).
- Efeito em planta depende de dose, genótipo e ambiente.

@@ GGA:4
> **O que esperar:** mecanismos de biocontrole e a biologia do gênero *Bacillus* (lipopeptídeos, policetídeos, esporulação, taxonomia). Base: conteúdo aprofundado A5 (Ongena & Jacques 2008, Chen 2009, Pieterse 2014, Dunlap 2016, Gupta 2020).

### Conceitos
- **Antibiose:** lipopeptídeos cíclicos — **surfactina** (*srfA*; biossurfactante, biofilme, ISR), **iturina/bacilomicina** (*itu/bmy*; antifúngica), **fengicina** (*fen/pps*; fungos filamentosos); policetídeos **bacilaeno**, **dificidina**, **macrolactina**; **bacilisina** (inibe glucosamina-6-P sintase); bacteriocinas.
- **Sfp** (fosfopanteteinil transferase) é essencial para NRPS/PKS; *B. subtilis* 168 tem *sfp* inativo → “*B. subtilis*” ≠ biocontrole.
- **Competição:** colonização/biofilme (TasA, EPS; SinR/SlrR), nutrientes, ferro.
- **Parasitismo:** *Trichoderma* (quitinases, glucanases); entomopatógenos (*Beauveria*, *Metarhizium*); toxinas **Cry/Cyt** de *B. thuringiensis*.
- **ISR** (JA/ET, NPR1) ≠ **SAR** (ácido salicílico).
- *Bacillus*: endósporo (Spo0A), competência/quorum (ComX/ComP/ComA, Rap/Phr), metabólitos na fase estacionária, respiração de nitrato (*narGHJI*).
- **Taxonomia:** *B. velezensis* separada de *B. amyloliquefaciens* (absorveu *B. methylotrophicus* e subsp. *plantarum*); várias espécies → *Priestia* etc.

### Como ler
- “Potencial” nos mapas de calor = literatura × abundância, não eficácia.
- Mesma espécie pode ser biocontrole ou patógeno conforme a cepa (*A. flavus* atoxigênico).

### Limites
- Produção de lipopeptídeos in planta ≪ cultura. Revisar evidência/segurança de *Clostridium* e *Aspergillus* rotulados como biocontrole.

@@ GGA:5
> **O que esperar:** avaliar segurança de bioinsumos — oportunistas, fitopatógenos, lista negativa e os limites de resolução do 16S/ITS. Base: conteúdo aprofundado A6 (Ehling-Schulz 2019).

### Conceitos
- **Oportunista:** doença sobretudo em hospedeiros vulneráveis (*P. aeruginosa*, *K. pneumoniae*, *Enterobacter*, *A. baumannii*), muitas vezes com resistência.
- **Grupo *B. cereus*:** *B. cereus*, *B. thuringiensis*, *B. anthracis* quase idênticos no 16S; diferença em **plasmídeos e toxinas**.
- ***Shigella*** está dentro de *E. coli* (16S não separa).
- Listas regulatórias usam **espécie**, patovar ou *forma specialis* — resolução que o metabarcoding raramente atinge.
- Bioinsumo: 21 oportunistas listados; lista negativa IBAMA (ex.: *Xylella fastidiosa*, *Ralstonia solanacearum*, *Xanthomonas*, *Brucella*, *Mycoplasma*).

### Como ler
- Hit de **gênero** contra lista de espécies → **inconclusivo**, não positivo.
- Hit em táxon indistinguível por 16S (ex.: “*B. anthracis*”) → confirmar com marcador específico **antes** de comunicar.

### Árvore de decisão (resumo)
1. Abundância acima do branco/controle? Não → artefato provável. 2. Resolução suficiente para a espécie da lista? Não → inconclusivo + confirmação (qPCR, cultura seletiva, genoma). 3. Confirmado → comunicação ao cliente.

### Limites
- “Não detectado” depende da profundidade; contaminação de laboratório gera falsos positivos em baixa abundância.

@@ GGY:0
> **O que esperar:** ecologia do microbioma intestinal, o que varia entre pessoas e por que “disbiose” precisa ser especificada. Base: conteúdo aprofundado Y1 (Sender 2016, Falony 2016, Vandeputte 2016, Maier 2018, Olesen & Alm 2016).

### Conceitos
- Cólon: ~3,8 × 10¹³ bactérias (mesma ordem das células humanas).
- **Filos:** Bacillota (ex-Firmicutes), Bacteroidota, Actinomycetota, Pseudomonadota (ex-Proteobacteria), Verrucomicrobiota.
- Gradientes ao longo do trato (O₂, pH, bile, trânsito); cólon majoritariamente **anaeróbio**.
- **Variação:** idade, dieta (fibras), **medicamentos** (inclusive não antibióticos), **consistência das fezes (Bristol)** e trânsito, IMC.
- Resiliência, **redundância funcional**, alimentação cruzada.
- “Disbiose” sem definição única → descreva **qual alteração** e **qual consequência**.

### Como ler
- Escala 0–10 resume várias ponderações → explique quais componentes puxaram o valor.
- Coletar Bristol e medicamentos melhora a interpretação.

### Limites
- Com 90% do peso na diversidade, a **Qualidade Geral** é na prática um índice de diversidade.
- Não é diagnóstico; não há validação contra desfechos clínicos nos documentos lidos.

@@ GGY:1
> **O que esperar:** o metabolismo da microbiota — fermentação de fibras em AGCC, proteólise, ácidos biliares e gases. Base: conteúdo aprofundado Y2 (Koh 2016, Louis & Flint 2017, Litvak 2018, Devkota 2012).

### Conceitos
- **Fibras → AGCC:** acetato, propionato, butirato.
- **Butirato:** Clostridia — *F. prausnitzii*, *Roseburia*, *Agathobacter rectalis* (ex-*E. rectale*), *Anaerostipes*, *Coprococcus*; genes ***but*** (butiril-CoA:acetato CoA-transferase) ou ***buk***.
- **Propionato:** vias do succinato (*Bacteroides*), acrilato, propanodiol.
- **Alimentação cruzada:** *Bifidobacterium* (acetato, lactato) → butirato por outros gêneros.
- **Butirato** = combustível do colonócito; β-oxidação consome O₂ → epitélio hipóxico favorece anaeróbios; se falha, Enterobacteriaceae facultativas proliferam.
- **Proteólise:** ácidos graxos ramificados, amônia, H₂S, fenóis, indóis. **Bile:** desconjugação (BSH, *bsh*) e 7α-desidroxilação (*bai*) → ácidos biliares secundários.
- ***Bilophila wadsworthia*** (taurina → H₂S; dieta rica em gordura saturada). ***M. smithii*** (H₂ → metano; trânsito lento).

### Como ler
- Abundância de produtoras de butirato = proxy de **potencial**; AGCC real depende de dieta, trânsito e absorção.

### Limites
- Soma com só três gêneros; *Agathobacter*, *Anaerostipes*, *Butyricicoccus* ficam de fora; “*Eubacterium*” é polifilético.
- *M. smithii* não é pró-inflamatório por definição (mais associado à constipação).

@@ GGY:2
> **O que esperar:** barreira intestinal, imunidade e a lógica do índice anti-inflamatório (marcadores, direção e evidência). Base: conteúdo aprofundado Y3 (Peterson & Artis 2014, Smith 2013, Furusawa 2013, Sokol 2008, Henke 2019).

### Conceitos
- **Barreira:** muco (**MUC2**; camada interna quase estéril), junções de oclusão, peptídeos antimicrobianos, **IgA** secretora.
- **Inato:** TLR/NOD reconhecem LPS, flagelina, peptidoglicano → NF-κB → citocinas.
- **Butirato → Treg** (inibição de HDAC; receptores GPR43/GPR109A). PSA de *B. fragilis* → IL-10.
- **Anti-inflamatórios (exemplos):** *F. prausnitzii* (reduzida em Crohn), *A. muciniphila* (Amuc_1100), *Roseburia*, *Bifidobacterium*.
- **Pró-inflamatórios:** *R. gnavus* (glucorramnano → TNF-α), expansão de Proteobacteria, *F. nucleatum* (câncer colorretal).
- Inflamação clínica = **calprotectina fecal**, não composição.

### Como ler
- Índice = semelhança com faixas do banco, **não medida de inflamação**. Veja quais marcadores contribuíram e se o nível taxonômico é confiável.

### Limites
- Espécie de *Bacteroides* por 16S incerta; efeito é de cepa (*B. fragilis* enterotoxigênica *bft* × não toxigênica com PSA).
- *Prevotella* > 0,1% penalizada, mas enterotipo P tem 20–60% → dietas ricas em fibra perdem pontos.
- Verificar no código: ausentes que somam +1,5, faixas que retornam None, nomes fora da taxonomia GTDB.

@@ GGY:3
> **O que esperar:** os índices funcionais do relatório intestinal (F/B, ganho de peso, vitaminas, enterotipos) e o que a literatura diz deles. Base: conteúdo aprofundado Y4 (Ley 2006, Walters 2014, Magne 2020, Arumugam 2011, Costea 2018, Magnúsdóttir 2015, LeBlanc 2013).

### Conceitos
- **Razão Firmicutes/Bacteroidetes:** associada à obesidade em estudos iniciais; **meta-análises não confirmam** associação consistente em humanos.
- **Enterotipos** (*Bacteroides*, *Prevotella*, *Ruminococcus*): na verdade **gradientes contínuos**; o 3º grupo é pouco robusto. DMM = Dirichlet multinomial mixture.
- **Vitaminas B:** muitas bactérias têm vias completas/parciais e trocam vitaminas; mas vitaminas do cólon são **pouco absorvidas** (B12 é absorvida no íleo).
- **PICRUSt2** estima genes por parentesco; precisão varia por categoria.

### Como ler
- Índice de vitamina = potencial genético **predito**, em escala arbitrária; dosagem sérica é o que vale.
- Enterotipo = descrição da composição dominante, não categoria clínica.

### Limites
- F/B depende de extração, região do 16S, banco e classificação de filos.
- Multiplicadores das vitaminas sem fundamentação documentada.
- Para validar: rastrear cada EC até a enzima/etapa da via (KEGG/MetaCyc) e comparar PICRUSt2 com shotgun.

@@ GGY:4
> **O que esperar:** patógenos, patobiontes e probióticos no relatório intestinal e os limites do “Perfil para Doenças”. Base: conteúdo aprofundado Y5 (Hill 2014, Zheng 2020, Duvallet 2017, Forslund 2015).

### Conceitos
- **Patógeno ≠ patobionte ≠ portador assintomático**; DNA presente ≠ infecção.
- **Limites do 16S:** *Shigella* × *E. coli*; *B. anthracis* × *B. cereus*; complexo *M. tuberculosis* × outras micobactérias; *Brucella*; *Treponema pallidum* × comensais; *Neisseria* patogênicas × comensais.
- **Probiótico:** microrganismo **vivo** em quantidade adequada que confere benefício; efeito **específico de cepa**.
- ***Lactobacillus*** dividido em 25 gêneros (2020): *L. casei* → *Lacticaseibacillus*; *L. plantarum* → *Lactiplantibacillus*.
- Associações microbioma–doença: muitas **inespecíficas** (compartilhadas entre doenças); **medicamentos** confundem (metformina); causalidade reversa.

### Como ler
- Diga “**detectado DNA de…**”, não “presença de patógeno”; tags de risco ≠ UFC.
- Táxon probiótico detectado ≠ efeito probiótico.
- Para profissional de saúde: associação populacional, sem alegação diagnóstica.

### Limites
- “Risco” sugere predição individual; os dados são associações transversais sem validação preditiva.
- Nomes antigos de *Lactobacillus* podem não casar com a taxonomia de referência.

@@ GGS:0
> **O que esperar:** o solo como habitat microbiano, a rizosfera e o que determina a composição — e como amostrar. Base: conteúdo aprofundado S1 (Fierer & Jackson 2006, Tedersoo 2014, Philippot 2013, Berendsen 2012, Fierer 2017).

### Conceitos
- Solo = **mosaico de microambientes** (agregados, poros com água/ar, gradientes de O₂ e nutrientes) em escala de milímetros.
- **pH** é o principal preditor da composição **bacteriana** em escala continental; **fungos** respondem mais a vegetação, MO e clima.
- **Efeito rizosfera:** exsudatos (açúcares, ácidos orgânicos, aminoácidos, metabólitos secundários) selecionam a comunidade; a planta “recruta” microrganismos (inclusive sob ataque de patógeno).
- Compartimentos com filtragem crescente: solo não rizosférico → **rizosfera** → rizoplano → endosfera.
- Grande parte da diversidade não é cultivada nem descrita.
- Filos típicos: Acidobacteriota, Actinomycetota, Pseudomonadota, Chloroflexota, Verrucomicrobiota; fungos Ascomycota, Basidiomycota, Mortierellomycota, Glomeromycota.

### Como ler
- Interprete junto com **pH, MO, cultura, manejo e época** de coleta.

### Limites
- 250 mg representam uma amostra composta homogênea, não a variabilidade do talhão → protocolo de amostragem (nº de subamostras, profundidade, época, transporte) define o que se conclui.

@@ GGS:1
> **O que esperar:** os ciclos microbianos de C, N e P no solo, seus genes marcadores e como medir processos. Base: conteúdo aprofundado S2 (Kuypers 2018, BioAS/Embrapa).

### Conceitos
- **Carbono:** celulases, **β-glicosidases**, ligninases (fungos); MO estável a partir de **necromassa microbiana**; respiração (CO₂); metanogênese em anaerobiose.
- **Nitrogênio:** fixação (*nifH*) → mineralização/amonificação → **nitrificação** (*amoA* de AOA e AOB; *nxrB*; comammox) → **desnitrificação** (*narG*, *nirK/nirS*, *norB*, ***nosZ*** — sem nosZ, mais **N₂O**), DNRA, anammox.
- **Fósforo:** mineralização (fosfatases, *phoD*, fitases/*appA*), solubilização, imobilização, polifosfatos.
- EPS e hifas estabilizam agregados.
- Indicadores biológicos no Brasil: enzimas **β-glicosidase** e **arilsulfatase** (BioAS/Embrapa), fosfatase ácida, urease.

### Como ler
- Índice funcional predito = **potencial relativo** da comunidade, não taxa de processo.

### Limites
- Taxas exigem medida direta: respiração, atividade enzimática, fluxo de N₂O, P disponível. Para validar um índice, compare com essas medidas no mesmo solo.

@@ GGS:2
> **O que esperar:** o triângulo da doença, supressividade geral × específica e como interpretar o índice de risco de doenças. Base: conteúdo aprofundado S3 (Weller 2002, Schlatter 2017, Mendes 2011).

### Conceitos
- **Triângulo da doença:** hospedeiro suscetível + patógeno virulento + ambiente favorável → patógeno presente é **necessário, não suficiente**.
- **Supressividade geral:** proporcional à biomassa/atividade total; **não transferível**. **Específica:** grupos definidos; **transferível** com pouco solo.
- Clássicos: declínio do **mal-do-pé** (*Gaeumannomyces*) em monocultura de trigo por *Pseudomonas* produtoras de **2,4-DAPG**; solos supressivos a *Rhizoctonia* (Pseudomonadaceae, Mendes 2011).
- Densidade de inóculo e nível de dano variam por patossistema.
- Doenças no índice: *Bipolaris*, oídio, *Colletotrichum*, *Corynespora*, *Diaporthe*, *Exserohilum*, **fusariose**, mal-do-pé, giberela, nematoides (*Heterodera*, *Meloidogyne*, *Pratylenchus*…), *Macrophomina*, rizoctoniose, *Verticillium*.

### Como ler
- Risco “alto” = combinação desfavorável de sinais na comunidade → confrontar com **histórico da área, cultivar e clima**.
- “*Fusarium* sp.” inclui muitas saprófitas; *formae speciales* de *F. oxysporum* não são resolvidas por ITS (confirmar por **TEF1α**).

### Limites
- Pesos definidos por especialistas; validação contra incidência em campo não documentada.
- Biodiversidade → sobretudo supressividade **geral**.

@@ GGS:3
> **O que esperar:** micorrizas arbusculares e ectomicorrizas, o que o ITS consegue ver delas e mitos comuns. Base: conteúdo aprofundado S4 (Parniske 2008, Jiang 2017, Karst 2023).

### Conceitos
- **AMF (Glomeromycota):** arbúsculos nas células corticais; trocam **fosfato e água** por carbono da planta — inclusive **lipídios** (não sintetizam ácidos graxos).
- Gêneros no banco: *Glomus*, *Acaulospora*, *Rhizophagus*, *Diversispora*, *Scutellospora*, *Septoglomus*, *Funneliformis*, *Gigaspora*.
- **Ectomicorrizas** (*Pisolithus*, *Hebeloma*, *Cenococcum*): principalmente árvores (eucalipto, pinus), não grãos.
- **Redes micorrízicas comuns** (“wood wide web”): evidência de transferência com efeito ecológico é **fraca**.
- **Glomalina:** o método de “proteína do solo relacionada à glomalina” **não é específico** de AMF.

### Como ler
- Primers de **ITS têm baixa eficiência para Glomeromycota** → poucas leituras de AMF podem ser artefato do método.
- Ectomicorrízicos num talhão de soja podem vir de árvores próximas ou DNA transportado.

### Limites
- Para quantificar AMF: primers **SSU/18S ou LSU** específicos e **colonização radicular** por microscopia.

@@ GGS:4
> **O que esperar:** relação entre biodiversidade, multifuncionalidade e saúde do solo — e o que um índice global pode afirmar. Base: conteúdo aprofundado S5 (Wagg 2014, Delgado-Baquerizo 2016).

### Conceitos
- Diversidade sustenta **multifuncionalidade**; perder diversidade afeta mais **funções raras** que funções amplamente distribuídas.
- **Redundância funcional:** funções comuns persistem apesar de mudanças de composição.
- **Resistência** (não mudar com o distúrbio) × **resiliência** (voltar ao estado anterior).
- **Saúde do solo** integra indicadores químicos, físicos e biológicos; **não existe** índice de microbioma validado universalmente.
- Solo **conducivo** × **supressivo**.

### Como ler
- Alta diversidade favorece supressividade **geral**, mas não garante supressão de um patógeno específico.

### Limites
- “Torna-se supressivo” generaliza além da evidência — supressividade é definida pela **doença**, não pela diversidade.
- Validar o índice global contra indicadores enzimáticos (BioAS) no mesmo conjunto de amostras.

@@ GGG:0
> **O que esperar:** montagem de genomas bacterianos, métricas de qualidade e identificação de espécie por ANI. Base: conteúdo aprofundado G1 (Bankevich 2012, Parks 2015, Jain 2018, Shaw & Yu 2023, Dunlap 2016).

### Conceitos
- **SPAdes** (de Bruijn multi-k) com reads curtas → contigs; **repetições** (operons de rRNA, transposases) fragmentam a montagem.
- **Métricas:** nº de contigs, **N50**, tamanho total, cobertura; **completude/contaminação** por genes de cópia única (**CheckM/CheckM2**).
- **Espécie por genoma:** **ANI ≥ 95–96%** com a linhagem-tipo. **skani** (rápido, tolera fragmentação), fastANI; **GTDB-Tk** para taxonomia GTDB.
- Nomenclatura muda: *B. velezensis* ≠ *B. amyloliquefaciens*; espécies movidas para *Priestia* etc.
- Ferramentas do relatório: FastQC, fastp, SPAdes, Prokka, skani, METABOLIC, DIAMOND, antiSMASH.

### Comandos
```bash
fastp -i R1.fq.gz -I R2.fq.gz -o t1.fq.gz -O t2.fq.gz
spades.py --isolate -1 t1.fq.gz -2 t2.fq.gz -o asm -t 8
checkm2 predict -i asm/contigs.fasta -o checkm2 ; quast.py asm/contigs.fasta -o quast
skani dist asm/contigs.fasta refs/*.fna -o ani.tsv     # B. velezensis, B. amyloliquefaciens, B. subtilis
```

### Como ler
- ANI ≥ 95% com a referência = mesma espécie; **cepa** exige SNPs/cgMLST contra a cepa declarada.
- Cobertura muito alta não melhora (pode piorar no SPAdes) → subamostrar para ~100×.

### Limites
- Relatório sem CheckM: contaminação de cultura altera ANI e anotação. Resultado depende do banco de referências.

@@ GGG:1
> **O que esperar:** anotação de genes, reconstrução de vias (N, P, fitormônios, enzimas) e como evitar falsos positivos funcionais. Base: conteúdo aprofundado G2 (Seemann 2014, Zhou 2022, Buchfink 2015).

### Conceitos
- **Prodigal** prediz genes; **Prokka** anota por homologia (bancos curados + HMMs); muitas “hypothetical protein”.
- **Vias:** completude de módulos KEGG / HMMs (**METABOLIC**); buscas específicas com **DIAMOND** exigem limiares de identidade e cobertura.
- **Ortólogo ≠ parálogo:** famílias grandes (proteases, transportadores) geram falsos positivos.
- *Bacillus*: respira nitrato em anaerobiose (*narGHJI*) e reduz nitrito (*nasDE*) — **sem fixação**.
- **Secreção:** só proteínas com **peptídeo sinal** (Sec/Tat; SignalP) atuam fora da célula (ex.: proteases *aprE, nprE, bpr, vpr*).

### Comandos
```bash
prokka --outdir ann --prefix iso --genus Bacillus asm/contigs.fasta
diamond blastp -q ann/iso.faa -d nifH.dmnd --id 50 --query-cover 70 -o hits.tsv
signalp6 --fastafile proteases.faa --output_dir sp --organism other
```

### Como ler
- “171 proteases” incluem peptidases intracelulares; para biocontrole importam as **secretadas** (MEROPS + SignalP).
- “Via parcial” = lacuna de anotação, montagem fragmentada ou via realmente incompleta.

### Limites
- Genoma = **potencial**; expressão exige transcriptômica, proteômica ou ensaios.

@@ GGG:2
> **O que esperar:** clusters biossintéticos (BGCs) — NRPS, PKS, RiPPs — em *Bacillus* e como interpretar o antiSMASH. Base: conteúdo aprofundado G3 (Süssmuth & Mainz 2017, Fischbach & Walsh 2006, Arnison 2013, Blin 2023).

### Conceitos
- **BGC:** genes de síntese + regulação + transporte + autorresistência agrupados.
- **NRPS:** linha de montagem modular — domínios **A** (escolhe o aminoácido), **T/PCP** (tiolação), **C** (condensação); ativação de T depende de **Sfp**.
- **PKS tipo I:** módulos KS-AT-ACP + domínios redutores; em *Bacillus* predominam **trans-AT** (bacilaeno, dificidina, macrolactina).
- **RiPPs:** peptídeos ribossomais modificados (lantipeptídeos classe II/LanM, sactipeptídeos, lassopeptídeos).
- **Regulação:** fase estacionária; ComA (surfactina), DegU, Spo0A, repressor AbrB.
- Operons: *srfAA–AD*, *ppsA–E/fenA–E*, *baeB–S*, *dfnA–Y*, *mlnA–I*, *bacA–E*, *dhbACEBF*, *sfp*.
- **antiSMASH:** regras de domínios + comparação com **MIBiG** (KnownClusterBlast, % similaridade); BiG-SCAPE agrupa famílias.

### Como ler
- BGC presente = **capacidade**; produção depende de cultivo/regulação (confirmar por **LC-MS/MS** + cultura pareada).
- *B. velezensis*: núcleo de BGCs quase igual entre cepas; diferenças em BGCs acessórios, expressão e colonização.
- Regiões “**on contig edge**” podem estar incompletas.

### Limites
- Similaridade baixa com MIBiG = novidade **ou** cluster incompleto. Classificar macrolactina H como “toxina” exige referência.

@@ GGG:3
> **O que esperar:** avaliação genômica de segurança — toxinas, virulência, cápsula e resistência a antimicrobianos — sem confundir homologia com risco. Base: conteúdo aprofundado G4 (Ehling-Schulz 2019, Bravo 2007).

### Conceitos
- **Grupo *B. cereus*:** enterotoxinas **Nhe** (*nheABC*) e **Hbl** (*hblCDAB*), citotoxina K (*cytK*), toxina emética **cereulida** (cluster *ces*), esfingomielinase.
- ***B. anthracis*:** toxinas do plasmídeo **pXO1** (*pagA, lef, cya*) e cápsula do **pXO2** (*capBCAD*).
- **Cry/Cyt** de *B. thuringiensis*: inseticidas.
- **Homologia ≠ virulência:** *B. subtilis/velezensis* produzem ácido poli-γ-glutâmico com *pgsBCA*, homólogos de *capBCA* → hit isolado de “*capC*” **não** indica cápsula de antraz.
- Avaliação completa: **AMR** (CARD, **AMRFinderPlus**), **VFDB**, elementos móveis e plasmídeos.

### Comandos
```bash
amrfinder -n asm/contigs.fasta --plus -o amr.tsv
abricate --db vfdb asm/contigs.fasta > vfdb.tsv
```

### Como ler
- Hits isolados de genes de cápsula, sem operon completo nem plasmídeo → compatíveis com homólogos não patogênicos.

### Limites
- O relatório não traz AMR — relevante para dossiês de registro (parágrafo de segurança: toxinas, AMR, mobilidade, conclusão).
